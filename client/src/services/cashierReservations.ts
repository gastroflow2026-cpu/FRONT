import axios from "axios";
import { getToken } from "@/helpers/getToken";
import { Reservation } from "@/types/cashier";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000";

export type CashierReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "PENDIENTE"
  | "CONFIRMADO"
  | "CANCELADO"
  | string;

export interface CashierReservationsFilters {
  date?: string;
  status?: string;
}

export interface CashierReservationsResult {
  date: string;
  total: number;
  data: Reservation[];
}

type BackendReservation = {
  id?: string | number | null;
  customer_name?: string | null;
  customer_phone?: string | number | null;
  guests_count?: string | number | null;
  status?: string | null;
  notes?: string | null;
  start_time?: string | null;
  table?: {
    table_number?: string | number | null;
  } | null;
};

type CashierReservationsPayload = {
  date?: string | null;
  total?: string | number | null;
  data?: BackendReservation[] | null;
};

const toNumber = (value?: string | number | null, fallback = 0) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const formatTime = (value?: string | null) => {
  if (!value) return "-";

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.slice(0, 5);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const mapReservation = (reservation: BackendReservation): Reservation => {
  return {
    id: String(reservation.id ?? ""),
    tableId: toNumber(reservation.table?.table_number, 0),
    clientName: reservation.customer_name?.trim() || "Cliente sin nombre",
    phone: String(reservation.customer_phone ?? "-").trim() || "-",
    time: formatTime(reservation.start_time),
    persons: toNumber(reservation.guests_count, 0),
    note: reservation.notes?.trim() || undefined,
    status: reservation.status || undefined,
  };
};

export const fetchCashierReservations = async (
  filters: CashierReservationsFilters = {},
): Promise<CashierReservationsResult> => {
  const token = getToken();

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;

  const params: Record<string, string> = {};

  if (filters.date) {
    params.date = filters.date;
  }

  if (filters.status && filters.status !== "ALL") {
    params.status = filters.status;
  }

  const { data } = await axios.get<CashierReservationsPayload>(`${API_URL}/reservations/cashier`, {
    headers,
    params,
  });

  const mapped = Array.isArray(data?.data)
    ? data.data.map(mapReservation).filter((reservation) => String(reservation.id).trim().length > 0)
    : [];

  return {
    date: data?.date || filters.date || new Date().toISOString().slice(0, 10),
    total: toNumber(data?.total, mapped.length),
    data: mapped,
  };
};
