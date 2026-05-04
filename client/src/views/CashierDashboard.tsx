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
import CashRegisterPanel from "@/components/cashierDashboard/CashRegisterPanel";
import { UsersContext } from "@/context/UsersContext";
import { useSocket } from "@/context/SocketContext";
import { useTables } from "@/context/TablesContext";
import { PaymentMethod, Table } from "@/types/cashier";
import {
  CashRegisterSession,
  CashierDailySummary,
  closeCashRegister,
  fetchCashRegisterHistory,
  fetchCashierOrders,
  fetchCashierDailySummary,
  fetchCurrentCashRegisterSession,
  mapCashierOrdersToTables,
  openCashRegister,
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
  const [cashRegisterSession, setCashRegisterSession] = useState<CashRegisterSession | null>(null);
  const [cashRegisterHistory, setCashRegisterHistory] = useState<CashRegisterSession[]>([]);
  const [isCashRegisterLoading, setIsCashRegisterLoading] = useState(true);
  const [isCashRegisterSubmitting, setIsCashRegisterSubmitting] = useState(false);
  const [cashRegisterError, setCashRegisterError] = useState<string | null>(null);

  const isCashRegisterOpen = Boolean(
    cashRegisterSession && cashRegisterSession.status.toUpperCase() === "OPEN",
  );

  const parseAmountInput = (rawValue: string) => {
    const normalized = rawValue.replace(",", ".").trim();
    if (!normalized) return null;
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return parsed;
  };

  const getBackendMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) return "";
    const data = error.response?.data as { message?: unknown; error?: unknown } | undefined;

    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.map((item) => String(item)).join(" | ");
    }

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    return "";
  };

  const loadCurrentCashRegister = useCallback(async () => {
    try {
      setCashRegisterError(null);
      setIsCashRegisterLoading(true);
      const session = await fetchCurrentCashRegisterSession();
      setCashRegisterSession(session);
    } catch {
      setCashRegisterError("No se pudo cargar el estado de caja.");
      setCashRegisterSession(null);
    } finally {
      setIsCashRegisterLoading(false);
    }
  }, []);

  const loadCashRegisterHistory = useCallback(async () => {
    try {
      const history = await fetchCashRegisterHistory(1, 10);
      setCashRegisterHistory(history.items);
    } catch {
      setCashRegisterHistory([]);
    }
  }, []);

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
    void loadCurrentCashRegister();
    void loadCashRegisterHistory();
  }, [loadCurrentCashRegister, loadCashRegisterHistory]);

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
      void loadCurrentCashRegister();
      void loadCashRegisterHistory();
      if (restaurantId) {
        void getTables(restaurantId);
      }
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [
    getTables,
    loadCashierOrders,
    loadCashRegisterHistory,
    loadCurrentCashRegister,
    loadDailySummary,
    restaurantId,
  ]);

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

  async function handleOpenCashRegister() {
    const result = await Swal.fire({
      title: "Abrir caja",
      text: "Ingresá el monto de apertura de la caja.",
      input: "text",
      inputLabel: "Monto de apertura",
      inputPlaceholder: "Ej: 25000.50",
      showCancelButton: true,
      confirmButtonText: "Abrir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      preConfirm: (value) => {
        const amount = parseAmountInput(value || "");
        if (amount === null) {
          Swal.showValidationMessage("Ingresá un monto válido, mayor o igual a 0, con hasta 2 decimales.");
          return;
        }

        return amount;
      },
    });

    if (!result.isConfirmed || typeof result.value !== "number") {
      return;
    }

    setIsCashRegisterSubmitting(true);
    setCashRegisterError(null);

    try {
      const session = await openCashRegister(result.value);
      setCashRegisterSession(session);
      await loadCashRegisterHistory();

      await Swal.fire({
        icon: "success",
        title: "Caja abierta",
        text: `La caja se abrió con ${result.value.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}.`,
        confirmButtonColor: "#16a34a",
      });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const backendMessage = getBackendMessage(error);

      const message =
        status === 409
          ? "Ya tenés una caja abierta en este restaurante."
          : backendMessage || "No se pudo abrir la caja. Intentá de nuevo.";

      setCashRegisterError(message);

      await Swal.fire({
        icon: "error",
        title: "No fue posible abrir caja",
        text: message,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsCashRegisterSubmitting(false);
    }
  }

  const renderSalesByMethod = (session: CashRegisterSession) => {
    const rows = [
      ["Efectivo", session.salesByMethod.efectivo],
      ["Tarjeta", session.salesByMethod.tarjeta],
      ["Transferencia", session.salesByMethod.transferencia],
      ["QR", session.salesByMethod.qr],
      ["No definido", session.salesByMethod.unknown],
    ];

    return rows
      .map(
        ([label, total]) =>
          `<div style=\"display:flex;justify-content:space-between;gap:16px;padding:4px 0;\"><span>${label}</span><strong>$ ${Number(total).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</strong></div>`,
      )
      .join("");
  };

  async function handleCloseCashRegister() {
    if (!isCashRegisterOpen) {
      await Swal.fire({
        icon: "info",
        title: "No hay caja abierta",
        text: "Primero debés abrir una caja para poder cerrarla.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Cerrar caja",
      html: `
        <div style=\"display:flex;flex-direction:column;gap:10px;text-align:left;\">
          <label for=\"declaredAmount\" style=\"font-size:14px;color:#374151;\">Monto final declarado *</label>
          <input id=\"declaredAmount\" class=\"swal2-input\" placeholder=\"Ej: 42000.00\" style=\"margin:0;\" />
          <label for=\"closingNotes\" style=\"font-size:14px;color:#374151;\">Notas (opcional)</label>
          <textarea id=\"closingNotes\" class=\"swal2-textarea\" placeholder=\"Observaciones de cierre...\" style=\"margin:0;\"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Cerrar caja",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      focusConfirm: false,
      preConfirm: () => {
        const amountInput = document.getElementById("declaredAmount") as HTMLInputElement | null;
        const notesInput = document.getElementById("closingNotes") as HTMLTextAreaElement | null;
        const amount = parseAmountInput(amountInput?.value || "");

        if (amount === null) {
          Swal.showValidationMessage("Ingresá un monto válido, mayor o igual a 0, con hasta 2 decimales.");
          return;
        }

        return {
          declaredClosingAmount: amount,
          notes: notesInput?.value?.trim() || "",
        };
      },
    });

    if (!result.isConfirmed || !result.value) {
      return;
    }

    setIsCashRegisterSubmitting(true);
    setCashRegisterError(null);

    try {
      const closedSession = await closeCashRegister(
        result.value.declaredClosingAmount,
        result.value.notes,
      );

      await loadCurrentCashRegister();
      await loadCashRegisterHistory();
      await loadDailySummary();

      await Swal.fire({
        icon: "success",
        title: "Caja cerrada",
        html: `
          <div style=\"text-align:left;display:flex;flex-direction:column;gap:10px;\">
            <div><strong>Monto apertura:</strong> $ ${closedSession.openingAmount.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</div>
            <div><strong>Monto esperado:</strong> $ ${(closedSession.expectedClosingAmount ?? 0).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</div>
            <div><strong>Monto declarado:</strong> $ ${(closedSession.declaredClosingAmount ?? 0).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</div>
            <div><strong>Diferencia:</strong> $ ${(closedSession.differenceAmount ?? 0).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</div>
            <div style=\"margin-top:8px;border-top:1px solid #e5e7eb;padding-top:8px;\">
              <strong>Ventas por método</strong>
              ${renderSalesByMethod(closedSession)}
            </div>
          </div>
        `,
        confirmButtonColor: "#16a34a",
      });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const backendMessage = getBackendMessage(error);

      const message =
        status === 404
          ? "No hay caja abierta para cerrar."
          : backendMessage || "No se pudo cerrar la caja. Intentá de nuevo.";

      setCashRegisterError(message);

      await Swal.fire({
        icon: "error",
        title: "No fue posible cerrar caja",
        text: message,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsCashRegisterSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierNavbar
        restaurantName={restaurantName}
        cashierName={isLogged?.name ?? "Cajero"}
        hasOpenCashRegister={isCashRegisterOpen}
        isCashRegisterActionLoading={isCashRegisterLoading || isCashRegisterSubmitting}
        onOpenCashRegister={() => {
          void handleOpenCashRegister();
        }}
        onCloseCashRegister={() => {
          void handleCloseCashRegister();
        }}
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

        <CashRegisterPanel
          session={cashRegisterSession}
          history={cashRegisterHistory}
          isLoading={isCashRegisterLoading}
          isSubmitting={isCashRegisterSubmitting}
          error={cashRegisterError}
          onOpen={() => {
            void handleOpenCashRegister();
          }}
          onClose={() => {
            void handleCloseCashRegister();
          }}
          onRefresh={() => {
            void loadCurrentCashRegister();
            void loadCashRegisterHistory();
          }}
        />

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