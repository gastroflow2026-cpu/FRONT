import axios from "axios";
import { getToken } from "@/helpers/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000";

export interface AssignmentWaiter {
  id: string;
  name: string;
  email?: string;
  isActive?: boolean;
}

export interface TableAssignment {
  tableId: string;
  tableNumber: number;
  zone: string;
  status: string;
  isActive: boolean;
  assignedWaiter: AssignmentWaiter | null;
}

type RawWaiter = {
  id?: string | null;
  name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  is_active?: boolean | null;
  isActive?: boolean | null;
};

type RawTableAssignment = {
  id?: string | null;
  table_id?: string | null;
  tableId?: string | null;
  table_number?: string | number | null;
  tableNumber?: string | number | null;
  number?: string | number | null;
  zone?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  isActive?: boolean | null;
  assigned_waiter?: RawWaiter | null;
  assignedWaiter?: RawWaiter | null;
  waiter?: RawWaiter | null;
};

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const toNumber = (value?: string | number | null, fallback = 0) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const toWaiter = (raw?: RawWaiter | null): AssignmentWaiter | null => {
  if (!raw) return null;

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) return null;

  const firstName = typeof raw.first_name === "string" ? raw.first_name.trim() : "";
  const lastName = typeof raw.last_name === "string" ? raw.last_name.trim() : "";
  const fullName = `${firstName} ${lastName}`.trim();

  const nameCandidates = [raw.name, raw.full_name, fullName];
  let name = "Mozo";

  for (const candidate of nameCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      name = candidate.trim();
      break;
    }
  }

  return {
    id,
    name,
    email: typeof raw.email === "string" ? raw.email : undefined,
    isActive:
      typeof raw.is_active === "boolean"
        ? raw.is_active
        : typeof raw.isActive === "boolean"
          ? raw.isActive
          : undefined,
  };
};

const toTableAssignment = (raw: RawTableAssignment): TableAssignment => {
  const tableIdCandidates = [raw.table_id, raw.tableId, raw.id];
  let tableId = "";

  for (const candidate of tableIdCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      tableId = candidate.trim();
      break;
    }
  }

  return {
    tableId,
    tableNumber: toNumber(raw.table_number ?? raw.tableNumber ?? raw.number, 0),
    zone: typeof raw.zone === "string" ? raw.zone : "-",
    status: typeof raw.status === "string" ? raw.status : "UNKNOWN",
    isActive:
      typeof raw.is_active === "boolean"
        ? raw.is_active
        : typeof raw.isActive === "boolean"
          ? raw.isActive
          : true,
    assignedWaiter: toWaiter(raw.assigned_waiter || raw.assignedWaiter || raw.waiter),
  };
};

const extractArray = <T>(payload: unknown, keys: string[]): T[] => {
  if (Array.isArray(payload)) return payload as T[];

  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
};

export const getWaiters = async (restaurantId: string): Promise<AssignmentWaiter[]> => {
  const headers = getAuthHeaders();
  const response = await axios.get(
    `${API_URL}/restaurants/${restaurantId}/tables/waiters`,
    { headers },
  );

  const list = extractArray<RawWaiter>(response.data, ["waiters", "data", "items"]);

  return list
    .map((raw) => toWaiter(raw))
    .filter((waiter): waiter is AssignmentWaiter => Boolean(waiter));
};

export const getTableAssignments = async (restaurantId: string): Promise<TableAssignment[]> => {
  const headers = getAuthHeaders();
  const response = await axios.get(
    `${API_URL}/restaurants/${restaurantId}/tables/assignments`,
    { headers },
  );

  const list = extractArray<RawTableAssignment>(response.data, ["assignments", "tables", "data", "items"]);

  return list
    .map((raw) => toTableAssignment(raw))
    .filter((table) => Boolean(table.tableId));
};

export const assignWaiter = async (
  restaurantId: string,
  tableId: string,
  waiterId: string,
): Promise<TableAssignment | null> => {
  const headers = getAuthHeaders();
  const response = await axios.patch(
    `${API_URL}/restaurants/${restaurantId}/tables/${tableId}/assign-waiter`,
    { waiter_id: waiterId },
    { headers },
  );

  if (!response.data || typeof response.data !== "object") return null;
  return toTableAssignment(response.data as RawTableAssignment);
};

export const unassignWaiter = async (
  restaurantId: string,
  tableId: string,
): Promise<TableAssignment | null> => {
  const headers = getAuthHeaders();
  const response = await axios.patch(
    `${API_URL}/restaurants/${restaurantId}/tables/${tableId}/unassign-waiter`,
    {},
    { headers },
  );

  if (!response.data || typeof response.data !== "object") return null;
  return toTableAssignment(response.data as RawTableAssignment);
};