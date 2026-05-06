"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import CashierNavbar from "@/components/cashierDashboard/CashierNavbar";
import ReservationsTab from "@/components/cashierDashboard/ReservationsTab";
import DailySummaryTab from "@/components/cashierDashboard/DailySummaryTab";
import CashRegisterPanel from "@/components/cashierDashboard/CashRegisterPanel";
import TableAssignmentModal from "@/components/cashierDashboard/TableAssignmentModal";
import { UsersContext } from "@/context/UsersContext";
import { useSocket } from "@/context/SocketContext";
import { Reservation } from "@/types/cashier";
import { fetchCashierReservations } from "@/services/cashierReservations";
import {
  AssignmentWaiter,
  TableAssignment,
  assignWaiter,
  getTableAssignments,
  getWaiters,
  unassignWaiter,
} from "@/services/tableAssignments";
import {
  CashRegisterSession,
  CashierDailySummary,
  closeCashRegister,
  fetchCashRegisterHistory,
  fetchCashierDailySummary,
  fetchCurrentCashRegisterSession,
  openCashRegister,
  resolveRestaurantId,
} from "@/services/orderLifecycle";

type MainTab = "mesas" | "reservas" | "resumen";

const TABS: { value: MainTab; label: string }[] = [
  { value: "mesas", label: "Asignación de mesas" },
  { value: "reservas", label: "Reservas" },
  { value: "resumen", label: "Resumen diario" },
];

export default function CashierDashboard() {
  const router = useRouter();
  const { isLogged } = useContext(UsersContext);
  const { socket } = useSocket();
  const restaurantId = resolveRestaurantId(isLogged as Record<string, unknown> | null);
  const [restaurantName, setRestaurantName] = useState("Mi Restaurante");
  const [activeTab, setActiveTab] = useState<MainTab>("mesas");
  const [summaryDate, setSummaryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reservationsDate, setReservationsDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reservationsStatus, setReservationsStatus] = useState("ALL");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsTotal, setReservationsTotal] = useState(0);
  const [isReservationsLoading, setIsReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState<CashierDailySummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [cashRegisterSession, setCashRegisterSession] = useState<CashRegisterSession | null>(null);
  const [cashRegisterHistory, setCashRegisterHistory] = useState<CashRegisterSession[]>([]);
  const [isCashRegisterLoading, setIsCashRegisterLoading] = useState(true);
  const [isCashRegisterSubmitting, setIsCashRegisterSubmitting] = useState(false);
  const [cashRegisterError, setCashRegisterError] = useState<string | null>(null);
  const [tableAssignments, setTableAssignments] = useState<TableAssignment[]>([]);
  const [waiters, setWaiters] = useState<AssignmentWaiter[]>([]);
  const [selectedWaiterByTable, setSelectedWaiterByTable] = useState<Record<string, string>>({});
  const [isTableAssignmentsLoading, setIsTableAssignmentsLoading] = useState(false);
  const [tableAssignmentsError, setTableAssignmentsError] = useState<string | null>(null);
  const [submittingAssignmentTableId, setSubmittingAssignmentTableId] = useState<string | null>(null);

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

  const loadCashierReservations = useCallback(
    async (nextDate = reservationsDate, nextStatus = reservationsStatus) => {
      try {
        setReservationsError(null);
        setIsReservationsLoading(true);

        const response = await fetchCashierReservations({
          date: nextDate,
          status: nextStatus,
        });

        setReservations(response.data);
        setReservationsTotal(response.total);
      } catch (error) {
        const backendMessage = getBackendMessage(error);
        setReservationsError(backendMessage || "No se pudieron cargar las reservas del cajero.");
        setReservations([]);
        setReservationsTotal(0);
      } finally {
        setIsReservationsLoading(false);
      }
    },
    [reservationsDate, reservationsStatus],
  );

  const loadTableAssignmentsData = useCallback(async () => {
    if (!restaurantId) {
      setTableAssignments([]);
      setWaiters([]);
      setSelectedWaiterByTable({});
      setTableAssignmentsError("No se encontró el restaurante del usuario.");
      return;
    }

    try {
      setTableAssignmentsError(null);
      setIsTableAssignmentsLoading(true);

      const [loadedWaiters, loadedAssignments] = await Promise.all([
        getWaiters(restaurantId),
        getTableAssignments(restaurantId),
      ]);

      setWaiters(loadedWaiters);
      setTableAssignments(loadedAssignments);

      const nextSelected: Record<string, string> = {};
      for (const assignment of loadedAssignments) {
        if (assignment.assignedWaiter?.id) {
          nextSelected[assignment.tableId] = assignment.assignedWaiter.id;
        }
      }
      setSelectedWaiterByTable(nextSelected);
    } catch (error) {
      const backendMessage = getBackendMessage(error);
      setTableAssignmentsError(backendMessage || "No se pudieron cargar las asignaciones de mesas.");
      setTableAssignments([]);
      setWaiters([]);
      setSelectedWaiterByTable({});
    } finally {
      setIsTableAssignmentsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void loadDailySummary(summaryDate);
  }, [loadDailySummary, summaryDate]);

  useEffect(() => {
    void loadCashierReservations(reservationsDate, reservationsStatus);
  }, [loadCashierReservations, reservationsDate, reservationsStatus]);

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
    const intervalId = window.setInterval(() => {
      void loadDailySummary();
      void loadCashierReservations();
      void loadCurrentCashRegister();
      void loadCashRegisterHistory();
      if (activeTab === "mesas") {
        void loadTableAssignmentsData();
      }
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [
    loadCashRegisterHistory,
    loadCashierReservations,
    loadCurrentCashRegister,
    loadDailySummary,
    loadTableAssignmentsData,
    restaurantId,
    activeTab,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handlePaidEvent = () => {
      void loadDailySummary();
      void loadCashRegisterHistory();
    };

    const handleReservationEvent = () => {
      void loadCashierReservations();
      if (activeTab === "mesas") {
        void loadTableAssignmentsData();
      }
    };

    socket.on("order:paid", handlePaidEvent);
    socket.on("reservation:created", handleReservationEvent);
    socket.on("reservation:cancelled", handleReservationEvent);

    return () => {
      socket.off("order:paid", handlePaidEvent);
      socket.off("reservation:created", handleReservationEvent);
      socket.off("reservation:cancelled", handleReservationEvent);
    };
  }, [
    activeTab,
    loadCashRegisterHistory,
    loadCashierReservations,
    loadDailySummary,
    loadTableAssignmentsData,
    socket,
  ]);

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

    const confirmClose = await Swal.fire({
      icon: "question",
      title: "¿Cerrar caja?",
      text: "¿Estás seguro de que querés cerrar la caja ahora?",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmClose.isConfirmed) {
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

  async function handleOpenTableAssignment() {
    setActiveTab("mesas");
    await loadTableAssignmentsData();
  }

  async function handleAssignTable(table: TableAssignment) {
    if (!restaurantId) return;

    const waiterId = selectedWaiterByTable[table.tableId];
    if (!waiterId) {
      await Swal.fire({
        icon: "warning",
        title: "Seleccioná un mozo",
        text: "Debés seleccionar un mozo antes de asignar la mesa.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    const waiter = waiters.find((item) => item.id === waiterId);
    const waiterName = waiter?.name || "el mozo seleccionado";

    const confirm = await Swal.fire({
      icon: "question",
      title: "¿Confirmar asignación?",
      text: `¿Estás seguro que quieres asignar la mesa ${table.tableNumber} a ${waiterName}?`,
      showCancelButton: true,
      confirmButtonText: "Sí, asignar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSubmittingAssignmentTableId(table.tableId);
      setTableAssignmentsError(null);
      await assignWaiter(restaurantId, table.tableId, waiterId);
      await loadTableAssignmentsData();

      await Swal.fire({
        icon: "success",
        title: "Mesa asignada",
        text: `La mesa ${table.tableNumber} fue asignada a ${waiterName}.`,
        confirmButtonColor: "#16a34a",
      });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const backendMessage = getBackendMessage(error);

      const message =
        status === 403
          ? "No tenés permisos para asignar mesas en este restaurante."
          : status === 404
            ? "No se encontró la mesa o el mozo seleccionado."
            : backendMessage || "No se pudo asignar la mesa. Intentá nuevamente.";

      setTableAssignmentsError(message);

      await Swal.fire({
        icon: "error",
        title: "No fue posible asignar",
        text: message,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setSubmittingAssignmentTableId(null);
    }
  }

  async function handleUnassignTable(table: TableAssignment) {
    if (!restaurantId || !table.assignedWaiter?.id) return;

    const waiterName = table.assignedWaiter.name || "el mozo asignado";

    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Quitar asignación?",
      text: `¿Querés quitar la asignación de la mesa ${table.tableNumber} para ${waiterName}?`,
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSubmittingAssignmentTableId(table.tableId);
      setTableAssignmentsError(null);
      await unassignWaiter(restaurantId, table.tableId);
      await loadTableAssignmentsData();

      await Swal.fire({
        icon: "success",
        title: "Asignación removida",
        text: `La mesa ${table.tableNumber} quedó sin mozo asignado.`,
        confirmButtonColor: "#16a34a",
      });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const backendMessage = getBackendMessage(error);

      const message =
        status === 403
          ? "No tenés permisos para desasignar mesas en este restaurante."
          : status === 404
            ? "No se encontró la mesa asignada."
            : backendMessage || "No se pudo quitar la asignación. Intentá nuevamente.";

      setTableAssignmentsError(message);

      await Swal.fire({
        icon: "error",
        title: "No fue posible quitar",
        text: message,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setSubmittingAssignmentTableId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierNavbar
        restaurantName={restaurantName}
        cashierName={isLogged?.name ?? "Cajero"}
        hasOpenCashRegister={isCashRegisterOpen}
        isCashRegisterActionLoading={isCashRegisterLoading || isCashRegisterSubmitting}
        onOpenTableAssignment={() => {
          void handleOpenTableAssignment();
        }}
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

        {/* Tabs principales */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-md"
                  : "text-gray-500 hover:text-pink-600 hover:bg-linear-to-r hover:from-orange-50 hover:to-pink-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido según tab */}
        {activeTab === "mesas" && (
          <TableAssignmentModal
            isOpen
            embedded
            isLoading={isTableAssignmentsLoading}
            error={tableAssignmentsError}
            tables={tableAssignments}
            waiters={waiters}
            selectedWaiterByTable={selectedWaiterByTable}
            submittingTableId={submittingAssignmentTableId}
            onClose={() => undefined}
            onRefresh={() => {
              void loadTableAssignmentsData();
            }}
            onSelectWaiter={(tableId, waiterId) => {
              setSelectedWaiterByTable((prev) => ({
                ...prev,
                [tableId]: waiterId,
              }));
            }}
            onAssign={(table) => {
              void handleAssignTable(table);
            }}
            onUnassign={(table) => {
              void handleUnassignTable(table);
            }}
          />
        )}
        {activeTab === "reservas" && (
          <ReservationsTab
            reservations={reservations}
            total={reservationsTotal}
            date={reservationsDate}
            status={reservationsStatus}
            isLoading={isReservationsLoading}
            error={reservationsError}
            onDateChange={(nextDate) => setReservationsDate(nextDate)}
            onStatusChange={(nextStatus) => setReservationsStatus(nextStatus)}
            onRefresh={() => {
              void loadCashierReservations(reservationsDate, reservationsStatus);
            }}
          />
        )}
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

    </div>
  );
}