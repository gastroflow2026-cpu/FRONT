"use client";

import { Phone, Users, MapPin, Clock, Info, RefreshCw } from "lucide-react";
import { Reservation } from "@/types/cashier";

interface ReservationsTabProps {
  reservations: Reservation[];
  total: number;
  date: string;
  status: string;
  isLoading: boolean;
  error: string | null;
  onDateChange: (nextDate: string) => void;
  onStatusChange: (nextStatus: string) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADO", label: "Confirmada" },
  { value: "CANCELADO", label: "Cancelada" },
];

const STATUS_BADGE_STYLES: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700 border border-amber-200",
  CONFIRMADO: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CANCELADO: "bg-red-100 text-red-700 border border-red-200",
};

const normalizeStatus = (status?: string) => {
  const normalized = (status || "").trim().toUpperCase();
  if (normalized === "PENDING") return "PENDIENTE";
  if (normalized === "CONFIRMED") return "CONFIRMADO";
  if (normalized === "CANCELLED") return "CANCELADO";
  return normalized || "PENDIENTE";
};

const statusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);

  if (normalized === "CONFIRMADO") return "Confirmada";
  if (normalized === "CANCELADO") return "Cancelada";
  return "Pendiente";
};

export default function ReservationsTab({
  reservations,
  total,
  date,
  status,
  isLoading,
  error,
  onDateChange,
  onStatusChange,
  onRefresh,
}: ReservationsTabProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-full space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>

        <div className="ml-auto text-xs text-gray-500 font-medium">
          {total} reservas
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-400 py-8">Cargando reservas...</div>
      ) : reservations.length === 0 ? (
        <div className="text-sm text-gray-400 py-8">No hay reservas para los filtros seleccionados.</div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-360px)] pr-1">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const normalizedStatus = normalizeStatus(reservation.status);
  const badgeClass = STATUS_BADGE_STYLES[normalizedStatus] || "bg-gray-100 text-gray-700 border border-gray-200";

  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-800">
              {reservation.clientName}
            </p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}`}>
              {statusLabel(reservation.status)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone size={11} />
            <span>{reservation.phone}</span>
          </div>
          {reservation.note ? (
            <div className="flex items-start gap-1.5 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1.5">
              <Info size={11} className="mt-0.5 shrink-0" />
              <span>{reservation.note}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-300 italic">Sin observaciones</p>
          )}
        </div>

        <div className="space-y-1.5 text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <Clock size={11} />
            <span>{reservation.time} hs</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <MapPin size={11} />
            <span>Mesa {reservation.tableId > 0 ? reservation.tableId : "-"}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <Users size={11} />
            <span>{reservation.persons} pers.</span>
          </div>
        </div>
      </div>
    </div>
  );
}