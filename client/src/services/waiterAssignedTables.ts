import axios from "axios";
import { getToken } from "@/helpers/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000";

export interface WaiterAssignedTable {
  id: string;
  table_number: number;
  status: string;
  zone?: string;
  is_active?: boolean;
}

type RawAssignedTable = {
  id?: string | null;
  table_number?: string | number | null;
  tableNumber?: string | number | null;
  status?: string | null;
  zone?: string | null;
  is_active?: boolean | null;
};

const toNumber = (value?: string | number | null, fallback = 0) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const toAssignedTable = (raw: RawAssignedTable): WaiterAssignedTable | null => {
  if (!raw || typeof raw !== "object") return null;

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) return null;

  return {
    id,
    table_number: toNumber(raw.table_number ?? raw.tableNumber, 0),
    status: typeof raw.status === "string" ? raw.status : "DISPONIBLE",
    zone: typeof raw.zone === "string" ? raw.zone : undefined,
    is_active: typeof raw.is_active === "boolean" ? raw.is_active : undefined,
  };
};

const extractTables = (payload: unknown): RawAssignedTable[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const candidates = [record.tables, record.data, record.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as RawAssignedTable[];
    }
  }

  return [];
};

export const fetchMyAssignedTables = async (
  restaurantId: string,
  date?: string,
  time?: string,
): Promise<WaiterAssignedTable[]> => {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const params = date || time ? { date, time } : undefined;

  const response = await axios.get(
    `${API_URL}/restaurants/${restaurantId}/tables/my-assigned`,
    { headers, params },
  );

  return extractTables(response.data)
    .map(toAssignedTable)
    .filter((table): table is WaiterAssignedTable => Boolean(table));
};