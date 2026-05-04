"use client";

import { Clock3, History, LockKeyholeOpen, Wallet } from "lucide-react";
import { CashRegisterSession } from "@/services/orderLifecycle";

interface CashRegisterPanelProps {
  session: CashRegisterSession | null;
  history: CashRegisterSession[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onOpen: () => void;
  onClose: () => void;
  onRefresh: () => void;
}

const formatMoney = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isSessionOpen = (session: CashRegisterSession | null) =>
  Boolean(session && session.status.toUpperCase() === "OPEN");

export default function CashRegisterPanel({
  session,
  history,
  isLoading,
  isSubmitting,
  error,
  onOpen,
  onClose,
  onRefresh,
}: CashRegisterPanelProps) {
  const open = isSessionOpen(session);

  return (
    <section className="mb-4 space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado de caja</p>
            <h2 className="text-lg font-semibold text-gray-800">Apertura y cierre de caja</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRefresh}
              disabled={isLoading || isSubmitting}
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Actualizar
            </button>

            {open ? (
              <button
                onClick={onClose}
                disabled={isLoading || isSubmitting}
                className="h-10 px-4 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cerrar caja
              </button>
            ) : (
              <button
                onClick={onOpen}
                disabled={isLoading || isSubmitting}
                className="h-10 px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Abrir caja
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Cargando estado de caja...
          </div>
        ) : open && session ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700 mb-1 inline-flex items-center gap-1">
                <LockKeyholeOpen size={12} /> Estado
              </p>
              <p className="text-sm font-semibold text-emerald-800">Caja abierta</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 inline-flex items-center gap-1">
                <Wallet size={12} /> Monto apertura
              </p>
              <p className="text-sm font-semibold text-gray-800">{formatMoney(session.openingAmount)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 inline-flex items-center gap-1">
                <Clock3 size={12} /> Apertura
              </p>
              <p className="text-sm font-semibold text-gray-800">{formatDateTime(session.openedAt)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 inline-flex items-center gap-1">
                <History size={12} /> Sesión
              </p>
              <p className="text-sm font-semibold text-gray-800">{session.id || "-"}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-5 text-sm text-gray-600">
            No hay caja abierta actualmente. Inicia una nueva apertura para comenzar el turno.
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Historial de cajas</h3>
          <span className="text-xs text-gray-400">Últimos {history.length} registros</span>
        </div>

        {history.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Aún no hay cierres registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3">Apertura</th>
                  <th className="py-2 pr-3">Cierre</th>
                  <th className="py-2 pr-3">Monto apertura</th>
                  <th className="py-2 pr-3">Esperado</th>
                  <th className="py-2 pr-3">Declarado</th>
                  <th className="py-2 pr-3">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const normalizedStatus = item.status.toUpperCase();
                  const isOpen = normalizedStatus === "OPEN";

                  return (
                    <tr key={`${item.id}-${item.openedAt}`} className="border-b border-gray-50 text-gray-700">
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isOpen ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isOpen ? "Abierta" : "Cerrada"}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{formatDateTime(item.openedAt)}</td>
                      <td className="py-2 pr-3">{formatDateTime(item.closedAt)}</td>
                      <td className="py-2 pr-3 font-medium">{formatMoney(item.openingAmount)}</td>
                      <td className="py-2 pr-3">{formatMoney(item.expectedClosingAmount)}</td>
                      <td className="py-2 pr-3">{formatMoney(item.declaredClosingAmount)}</td>
                      <td
                        className={`py-2 pr-3 font-semibold ${
                          (item.differenceAmount ?? 0) >= 0 ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {formatMoney(item.differenceAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
