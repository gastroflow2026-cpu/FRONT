"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import CashierNavbar from "@/components/cashierDashboard/CashierNavbar";
import MetricCards from "@/components/cashierDashboard/MetricCards";
import TableGrid from "@/components/cashierDashboard/TableGrid";
import TableDrawer from "@/components/cashierDashboard/TableDrawer";
import ReservationsTab from "@/components/cashierDashboard/ReservationsTab";
import DailySummaryTab from "@/components/cashierDashboard/DailySummaryTab";
import { UsersContext } from "@/context/UsersContext";
import { useSocket } from "@/context/SocketContext";
import { useTables } from "@/context/TablesContext";
import { PaymentMethod, Table } from "@/types/cashier";
import {
  CashierDailySummary,
  fetchCashierOrders,
  fetchCashierDailySummary,
  mapCashierOrdersToTables,
  payOrder,
  resolveRestaurantId,
} from "@/services/orderLifecycle";

type MainTab = "mesas" | "reservas" | "resumen";

const TABS: { value: MainTab; label: string }[] = [
  { value: "mesas", label: "Mesas y órdenes" },
  { value: "reservas", label: "Reservas" },
  { value: "resumen", label: "Resumen diario" },
];

export default function CashierDashboard() {
  const router = useRouter();
  const { isLogged } = useContext(UsersContext);
  const { socket } = useSocket();
  const restaurantId = resolveRestaurantId(isLogged as Record<string, unknown> | null);
  const { tables: backendTables, getTables } = useTables();
  const [restaurantName, setRestaurantName] = useState("Mi Restaurante");
  const [activeTab, setActiveTab] = useState<MainTab>("mesas");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cashierTables, setCashierTables] = useState<Table[]>([]);
  const [summaryDate, setSummaryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailySummary, setDailySummary] = useState<CashierDailySummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCashierOrders = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const orders = await fetchCashierOrders();
      const nextTables = mapCashierOrdersToTables(orders);
      setCashierTables(nextTables);
      setSelectedTable((prev) => {
        if (!prev) return null;
        return nextTables.find((table) => table.id === prev.id) ?? null;
      });
    } catch {
      setError("No se pudo cargar la cola de cobro.");
      setCashierTables([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDailySummary = useCallback(async (date = summaryDate) => {
    try {
      setSummaryError(null);
      setIsSummaryLoading(true);
      const summary = await fetchCashierDailySummary(date);
      setDailySummary(summary);
    } catch {
      setSummaryError("No se pudo cargar el resumen diario.");
      setDailySummary(null);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [summaryDate]);

  useEffect(() => {
    void loadCashierOrders();
  }, [loadCashierOrders]);

  useEffect(() => {
    void loadDailySummary(summaryDate);
  }, [loadDailySummary, summaryDate]);

  useEffect(() => {
    const roles = (isLogged?.roles ?? []).map((role) => role.toLowerCase());
    const isCashier = roles.some((role) => ["cashier", "cajero", "staff_cashier"].includes(role));

    if (roles.length > 0 && !isCashier) {
      if (roles.some((role) => ["waiter", "mesero", "mozo", "staff_waiter"].includes(role))) {
        router.replace("/waiter");
        return;
      }

      if (roles.some((role) => ["chef", "cocinero", "staff_chef", "kitchen", "kitchen_staff"].includes(role))) {
        router.replace("/kitchen");
        return;
      }

      router.replace("/login");
    }
  }, [isLogged?.roles, router]);

  useEffect(() => {
    const user = (isLogged as Record<string, unknown> | null) ?? null;
    const nestedRestaurant =
      user?.restaurant && typeof user.restaurant === "object"
        ? (user.restaurant as Record<string, unknown>)
        : null;

    const candidates = [
      user?.restaurant_name,
      user?.restaurantName,
      nestedRestaurant?.name,
      nestedRestaurant?.restaurant_name,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        setRestaurantName(candidate.trim());
        return;
      }
    }

    const storedName = localStorage.getItem("restaurantName");
    if (storedName && storedName.trim()) {
      setRestaurantName(storedName.trim());
      return;
    }

    setRestaurantName("Mi Restaurante");
  }, [isLogged]);

  useEffect(() => {
    if (!restaurantId) return;
    void getTables(restaurantId);
  }, [getTables, restaurantId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadCashierOrders();
      void loadDailySummary();
      if (restaurantId) {
        void getTables(restaurantId);
      }
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [getTables, loadCashierOrders, loadDailySummary, restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const handleQueueEvent = () => {
      void loadCashierOrders();
      if (restaurantId) {
        void getTables(restaurantId);
      }
    };

    const handlePaidEvent = () => {
      handleQueueEvent();
      void loadDailySummary();
    };

    socket.on("order:closed", handleQueueEvent);
    socket.on("order:updated", handleQueueEvent);
    socket.on("order:paid", handlePaidEvent);

    return () => {
      socket.off("order:closed", handleQueueEvent);
      socket.off("order:updated", handleQueueEvent);
      socket.off("order:paid", handlePaidEvent);
    };
  }, [getTables, loadCashierOrders, loadDailySummary, restaurantId, socket]);

  const metrics = useMemo(() => {
    const occupiedTables = backendTables.filter(
      (table) => (table.status || "").toUpperCase() === "OCUPADA",
    ).length;
    const reservedTables = backendTables.filter(
      (table) => (table.status || "").toUpperCase() === "RESERVADA",
    ).length;

    return {
      activeOrders: cashierTables.length,
      ordersInPreparation: cashierTables.filter(
        (table) => table.currentOrder?.status === "preparacion",
      ).length,
      occupiedTables,
      totalTables: backendTables.length,
      reservedTables,
      reservationsToday: reservedTables,
    };
  }, [backendTables, cashierTables]);

  function handleTableClick(table: Table) {
    setSelectedTable(table);
  }

  function handleCloseDrawer() {
    setSelectedTable(null);
  }

  async function handleCloseOrder(table: Table, paymentMethod: PaymentMethod) {
    const result = await Swal.fire({
      title: "¿Cobrar orden?",
      html: `¿Confirmás el cobro de la orden <strong>#${table.currentOrder?.id}</strong> de la mesa <strong>${table.id}</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cobrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed || !table.currentOrder?.id) {
      return;
    }

    try {
      await payOrder(table.currentOrder.id, paymentMethod);
      await loadCashierOrders();
      await loadDailySummary();

      await Swal.fire({
        title: "¡Cobro registrado!",
        text: `Pago registrado correctamente con ${paymentMethod}.`,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#f97316",
      });

      setSelectedTable(null);
    } catch (error) {
      const backendMessage =
        axios.isAxiosError(error) &&
        typeof error.response?.data === "object" &&
        error.response?.data &&
        "message" in error.response.data
          ? String((error.response.data as { message?: unknown }).message || "")
          : "";

      await Swal.fire({
        title: "Error al cobrar",
        text: backendMessage || "No se pudo registrar el pago. Intentá de nuevo.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierNavbar
        restaurantName={restaurantName}
        cashierName={isLogged?.name ?? "Cajero"}
      />

      <main className="p-6">
        {/* Título */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-xs" />
            ))}
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            Dashboard del Cajero
          </h1>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Métricas */}
        <MetricCards metrics={metrics} />

        {/* Tabs principales */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido según tab */}
        {activeTab === "mesas" && (
          isLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
              Cargando órdenes para cobro...
            </div>
          ) : (
            <TableGrid tables={cashierTables} onTableClick={handleTableClick} />
          )
        )}
        {activeTab === "reservas" && <ReservationsTab />}
        {activeTab === "resumen" && (
          <DailySummaryTab
            summary={dailySummary}
            date={summaryDate}
            isLoading={isSummaryLoading}
            error={summaryError}
            onDateChange={(nextDate) => setSummaryDate(nextDate)}
            onRefresh={() => void loadDailySummary(summaryDate)}
          />
        )}
      </main>

      <TableDrawer
        table={selectedTable}
        onClose={handleCloseDrawer}
        onCloseOrder={handleCloseOrder}
      />
    </div>
  );
}