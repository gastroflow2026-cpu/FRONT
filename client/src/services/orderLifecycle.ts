import axios from "axios";
import { getToken } from "@/helpers/getToken";
import { Order, OrderItem, PaymentMethod, Table } from "@/types/cashier";
import { KitchenOrder, KitchenOrderStatus } from "@/types/kitchen";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000";

export type OrderLifecycleStatus =
  | "pendiente"
  | "preparacion"
  | "servido"
  | "lista_para_pagar"
  | "cerrado"
  | "pagado";

export interface RestaurantOrderSummary {
  id: string;
  tableId: string;
  tableNumber: number;
  status: OrderLifecycleStatus;
  items: OrderItem[];
  note?: string;
  total: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  deliveredAt?: string;
  closedAt?: string;
}

export interface DailySummaryMethodTotal {
  count: number;
  total: number;
}

export interface DailySummaryReceipt {
  orderId: string;
  displayId?: string;
  tableId?: string;
  tableNumber: number;
  total: number;
  paymentMethod: string;
  paidAt: string;
  paidBy?: string;
  closedAt?: string;
  waiterName?: string;
}

export interface CashierDailySummary {
  day: string;
  range: {
    start: string;
    end: string;
  };
  totals: {
    gross: number;
    ordersCount: number;
    averageTicket: number;
  };
  byPaymentMethod: {
    efectivo: DailySummaryMethodTotal;
    tarjeta: DailySummaryMethodTotal;
    transferencia: DailySummaryMethodTotal;
    qr: DailySummaryMethodTotal;
    unknown: DailySummaryMethodTotal;
  };
  receipts: DailySummaryReceipt[];
}

export interface CashRegisterSalesByMethod {
  efectivo: number;
  tarjeta: number;
  transferencia: number;
  qr: number;
  unknown: number;
}

export interface CashRegisterSession {
  id: string;
  status: "OPEN" | "CLOSED" | string;
  openingAmount: number;
  declaredClosingAmount: number | null;
  expectedClosingAmount: number | null;
  differenceAmount: number | null;
  salesByMethod: CashRegisterSalesByMethod;
  openedAt: string;
  closedAt: string | null;
  notes?: string;
}

export interface CashRegisterHistoryResult {
  items: CashRegisterSession[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderItemInput {
  menuItemId: string;
  name: string;
  quantity: number;
  notes?: string;
}

type BackendOrderItem = {
  quantity?: number | string | null;
  qty?: number | string | null;
  name?: string | null;
  title?: string | null;
  price?: number | string | null;
  menu_item?: {
    id?: string | null;
    name?: string | null;
    price?: number | string | null;
  } | null;
  menuItem?: {
    id?: string | null;
    name?: string | null;
    price?: number | string | null;
  } | null;
};

type BackendOrder = {
  id?: string | null;
  order_id?: string | null;
  status?: string | null;
  notes?: string | null;
  observations?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  started_at?: string | null;
  served_at?: string | null;
  delivered_at?: string | null;
  waiter_delivered_at?: string | null;
  waiter_confirmed_at?: string | null;
  deliveredAt?: string | null;
  waiterDeliveredAt?: string | null;
  waiterConfirmedAt?: string | null;
  closed_at?: string | null;
  table_id?: string | null;
  table_number?: number | string | null;
  tableNumber?: number | string | null;
  number?: number | string | null;
  table_no?: number | string | null;
  table?: {
    id?: string | null;
    table_number?: number | string | null;
    number?: number | string | null;
    tableNumber?: number | string | null;
    no?: number | string | null;
  } | null;
  items?: BackendOrderItem[] | null;
  order_items?: BackendOrderItem[] | null;
  total_amount?: number | string | null;
  totalAmount?: number | string | null;
  amount?: number | string | null;
  price?: number | string | null;
};

type OrdersPayload =
  | BackendOrder[]
  | {
      orders?: BackendOrder[] | null;
      data?: BackendOrder[] | null;
    };

type DailySummaryPayload = {
  day?: string | null;
  range?: {
    start?: string | null;
    end?: string | null;
  } | null;
  totals?: {
    gross?: number | string | null;
    ordersCount?: number | string | null;
    averageTicket?: number | string | null;
  } | null;
  byPaymentMethod?: {
    efectivo?: { count?: number | string | null; total?: number | string | null } | null;
    tarjeta?: { count?: number | string | null; total?: number | string | null } | null;
    transferencia?: { count?: number | string | null; total?: number | string | null } | null;
    qr?: { count?: number | string | null; total?: number | string | null } | null;
    unknown?: { count?: number | string | null; total?: number | string | null } | null;
  } | null;
  receipts?: Array<{
    orderId?: string | null;
    displayId?: string | null;
    tableId?: string | null;
    tableNumber?: number | string | null;
    total?: number | string | null;
    paymentMethod?: string | null;
    paidAt?: string | null;
    paidBy?: string | null;
    closedAt?: string | null;
    waiterName?: string | null;
  }> | null;
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

const extractOrdersArray = (payload: OrdersPayload): BackendOrder[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.orders)) return payload.orders;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const normalizeStatus = (status?: string | null): OrderLifecycleStatus => {
  const normalized = (status || "").trim().toUpperCase();

  if (["IN_PROGRESS", "EN_PROGRESO", "PREPARACION", "PREPARING", "EN_PREPARACION"].includes(normalized)) {
    return "preparacion";
  }

  if (["SERVED", "SERVIDO", "READY", "LISTO", "LISTO_PARA_ENTREGAR"].includes(normalized)) {
    return "servido";
  }

  if (["READY_FOR_PAYMENT", "LISTA_PARA_PAGAR", "WAITING_PAYMENT"].includes(normalized)) {
    return "lista_para_pagar";
  }

  if (["CLOSED", "CERRADO"].includes(normalized)) {
    return "cerrado";
  }

  if (["PAID", "PAGADO"].includes(normalized)) {
    return "pagado";
  }

  return "pendiente";
};

const formatClock = (value?: string | null) => {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return value;
};

const formatClockOptional = (value?: string | null) => {
  if (!value) return undefined;
  return formatClock(value);
};

const mapOrderItem = (item: BackendOrderItem): OrderItem => {
  const nestedItem = item.menu_item || item.menuItem;
  return {
    quantity: toNumber(item.quantity ?? item.qty, 1),
    name: item.name || item.title || nestedItem?.name || "Item sin nombre",
    price: toNumber(item.price ?? nestedItem?.price, 0),
  };
};

export const resolveRestaurantId = (
  user: Record<string, unknown> | null,
): string | null => {
  if (!user) return null;

  const candidates = [
    user.restaurant_id,
    user.restaurantId,
    (user.restaurant as Record<string, unknown>)?.id,
    (user.restaurant as Record<string, unknown>)?.restaurant_id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
};

export const mapOrderStatusToTableStatus = (
  status?: OrderLifecycleStatus | null,
): "ocupada" | "listo" | null => {
  if (status === "servido") return "listo";
  if (status === "pendiente" || status === "preparacion") return "ocupada";
  return null;
};

export const isOrderEditableByWaiter = (
  status?: OrderLifecycleStatus | null,
) => !status || status === "pendiente";

export const canOrderBeClosedByWaiter = (
  status?: OrderLifecycleStatus | null,
) => status === "servido" || status === "lista_para_pagar";

export const mapBackendOrderSummary = (
  order: BackendOrder,
): RestaurantOrderSummary => {
  const rawItems = order.order_items || order.items || [];
  const items = rawItems.map(mapOrderItem);
  const totalFromItems = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return {
    id: order.id || order.order_id || "",
    tableId: order.table_id || order.table?.id || "",
    tableNumber: toNumber(
      order.table_number ??
        order.tableNumber ??
        order.number ??
        order.table_no ??
        order.table?.table_number ??
        order.table?.number ??
        order.table?.tableNumber ??
        order.table?.no,
      0,
    ),
    status: normalizeStatus(order.status),
    items,
    note: order.notes || order.observations || undefined,
    total: toNumber(
      order.total_amount ?? order.totalAmount ?? order.amount ?? order.price,
      totalFromItems,
    ),
    createdAt: formatClock(order.created_at),
    startedAt: formatClock(order.started_at),
    finishedAt: formatClock(order.served_at),
    deliveredAt: formatClockOptional(
      order.delivered_at ??
        order.waiter_delivered_at ??
        order.waiter_confirmed_at ??
        order.deliveredAt ??
        order.waiterDeliveredAt ??
        order.waiterConfirmedAt,
    ),
    closedAt: formatClock(order.closed_at ?? order.updated_at),
  };
};

export const mapOrderSummaryToKitchenOrder = (
  order: RestaurantOrderSummary,
): KitchenOrder => ({
  id: order.id,
  tableId:
    order.tableNumber > 0
      ? String(order.tableNumber)
      : order.tableId
        ? order.tableId.slice(0, 8)
        : "s/n",
  tableLabel:
    order.tableNumber > 0
      ? `Mesa ${order.tableNumber}`
      : order.tableId
        ? `Mesa ${order.tableId.slice(0, 8)}`
        : "Mesa s/n",
  status:
    order.status === "preparacion" || order.status === "servido"
      ? order.status
      : "pendiente",
  items: order.items,
  note: order.note,
  createdAt: order.createdAt,
  startedAt: order.startedAt,
  finishedAt: order.finishedAt,
});

const getOrders = async (endpoint: string): Promise<RestaurantOrderSummary[]> => {
  const headers = getAuthHeaders();
  const { data } = await axios.get<OrdersPayload>(`${API_URL}${endpoint}`, {
    headers,
  });

  return extractOrdersArray(data)
    .map(mapBackendOrderSummary)
    .filter((order) => Boolean(order.id));
};

export const fetchKitchenOrderSummaries = async (): Promise<RestaurantOrderSummary[]> =>
  getOrders("/order/kitchen");

export const fetchKitchenOrders = async (): Promise<KitchenOrder[]> => {
  const orders = await fetchKitchenOrderSummaries();
  return orders
    .filter(
      (order) =>
        order.status !== "cerrado" &&
        order.status !== "pagado" &&
        order.status !== "lista_para_pagar",
    )
    .map(mapOrderSummaryToKitchenOrder);
};

export const fetchOrdersByTable = async (
  tableId: string,
): Promise<RestaurantOrderSummary[]> => {
  const headers = getAuthHeaders();
  const endpoints = [`/order/table/${tableId}`, `/table/${tableId}`];

  for (const endpoint of endpoints) {
    try {
      const { data } = await axios.get<OrdersPayload>(`${API_URL}${endpoint}`, {
        headers,
      });

      return extractOrdersArray(data)
        .map(mapBackendOrderSummary)
        .filter((order) => Boolean(order.id));
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        [403, 404, 500, 501, 502, 503, 504].includes(error.response?.status ?? 0)
      ) {
        continue;
      }

      throw error;
    }
  }

  return [];
};

export const openOrder = async (tableId: string): Promise<string> => {
  const headers = getAuthHeaders();
  const { data } = await axios.post<{ id?: string; order_id?: string }>(
    `${API_URL}/order/open`,
    { tableId },
    { headers },
  );

  const orderId = data.id || data.order_id;
  if (!orderId) {
    throw new Error("No se recibió el id de la orden");
  }

  return orderId;
};

export const addItemsToOrder = async (
  orderId: string,
  items: OrderItemInput[],
): Promise<void> => {
  const headers = getAuthHeaders();

  for (const item of items) {
    await axios.post(
      `${API_URL}/order/${orderId}/items`,
      {
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        notes: item.notes || "",
      },
      { headers },
    );
  }
};

export const updateKitchenOrderStatus = async (
  orderId: string,
  status: KitchenOrderStatus,
): Promise<KitchenOrderStatus> => {
  const headers = getAuthHeaders();

  const statusCandidates: Record<KitchenOrderStatus, string[]> = {
    pendiente: ["pendiente", "PENDIENTE"],
    preparacion: ["preparacion", "PREPARACION", "IN_PROGRESS", "EN_PROGRESO"],
    servido: ["servido", "SERVIDO", "SERVED", "LISTO"],
  };

  const endpointCandidates = [
    `${API_URL}/order/kitchen/${orderId}/status`,
    `${API_URL}/order/${orderId}/status`,
  ];

  const bodyBuilders = [
    (value: string) => ({ status: value }),
    (value: string) => ({ newStatus: value }),
    (value: string) => ({ state: value }),
  ];

  let lastError: unknown;

  for (const endpoint of endpointCandidates) {
    for (const candidate of statusCandidates[status]) {
      for (const bodyBuilder of bodyBuilders) {
        try {
          await axios.patch(endpoint, bodyBuilder(candidate), { headers });
          return status;
        } catch (error) {
          lastError = error;

          if (
            axios.isAxiosError(error) &&
            [400, 404, 405, 422].includes(error.response?.status ?? 0)
          ) {
            continue;
          }

          throw error;
        }
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return status;
};

export const closeOrder = async (orderId: string): Promise<void> => {
  const headers = getAuthHeaders();
  await axios.patch(`${API_URL}/order/${orderId}/close`, {}, { headers });
};

export const confirmOrderDelivered = async (orderId: string): Promise<void> => {
  const headers = getAuthHeaders();
  const endpointCandidates = [
    `${API_URL}/order/${orderId}/delivered`,
    `${API_URL}/order/${orderId}/confirm-delivery`,
    `${API_URL}/order/${orderId}/waiter-delivered`,
  ];

  const bodyCandidates = [{}, { delivered: true }, { deliveredAt: new Date().toISOString() }];
  let lastError: unknown;

  for (const endpoint of endpointCandidates) {
    for (const body of bodyCandidates) {
      try {
        await axios.patch(endpoint, body, { headers });
        return;
      } catch (error) {
        lastError = error;

        if (
          axios.isAxiosError(error) &&
          [400, 404, 405, 422].includes(error.response?.status ?? 0)
        ) {
          continue;
        }

        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
};

export const fetchCashierOrders = async (): Promise<RestaurantOrderSummary[]> => {
  const headers = getAuthHeaders();
  const { data } = await axios.get<OrdersPayload>(`${API_URL}/order/cashier`, { headers });
  const raw = extractOrdersArray(data);
  // Debug: log raw cashier response to diagnose missing fields
  if (raw.length > 0) {
    console.log("[cashier] raw orders from backend:", JSON.stringify(raw[0], null, 2));
  }
  return raw.map(mapBackendOrderSummary).filter((order) => Boolean(order.id));
};

const mapLifecycleStatusToCashierStatus = (
  status: OrderLifecycleStatus,
): Order["status"] => {
  if (status === "lista_para_pagar") return "lista_para_pagar";
  if (status === "preparacion") return "preparacion";
  if (status === "pendiente") return "pendiente";
  return "servido";
};

export const mapCashierOrdersToTables = (
  orders: RestaurantOrderSummary[],
): Table[] => {
  return orders.map((order, index) => {
    const subtotal = Math.round(order.total / 1.15);
    const iva = order.total - subtotal;
    // Use tableNumber when available; otherwise fall back to index+1 to keep IDs unique
    const tableId = order.tableNumber > 0 ? order.tableNumber : index + 1;

    return {
      id: tableId,
      zone: "salon",
      status: "ocupada",
      currentOrder: {
        id: order.id,
        tableId: tableId,
        status: mapLifecycleStatusToCashierStatus(order.status),
        items: order.items,
        subtotal,
        iva,
        total: order.total,
        createdAt: order.closedAt || order.createdAt,
        note: order.note,
      },
    };
  });
};

export const payOrder = async (
  orderId: string,
  paymentMethod: PaymentMethod,
): Promise<void> => {
  const headers = getAuthHeaders();
  const endpointCandidates = [
    `${API_URL}/order/${orderId}/pay`,
    `${API_URL}/order/pay/${orderId}`,
    `${API_URL}/order/${orderId}/paid`,
  ];

  const methodCandidatesByInput: Record<PaymentMethod, string[]> = {
    efectivo: ["efectivo", "cash", "CASH", "EFECTIVO"],
    transferencia: ["transferencia", "transfer", "TRANSFER", "TRANSFERENCIA"],
    qr: ["qr", "QR"],
    debito: ["tarjeta", "card", "debit", "DEBIT", "TARJETA"],
    credito: ["tarjeta", "card", "credit", "CREDIT", "TARJETA"],
  };

  const bodyBuilders = [
    (value: string) => ({ paymentMethod: value }),
    (value: string) => ({ payment_method: value }),
    (value: string) => ({ method: value }),
    (value: string) => ({ type: value }),
  ];

  let lastError: unknown;

  for (const endpoint of endpointCandidates) {
    for (const methodCandidate of methodCandidatesByInput[paymentMethod]) {
      for (const bodyBuilder of bodyBuilders) {
        try {
          await axios.patch(endpoint, bodyBuilder(methodCandidate), { headers });
          return;
        } catch (patchError) {
          lastError = patchError;

          if (
            axios.isAxiosError(patchError) &&
            [404, 405].includes(patchError.response?.status ?? 0)
          ) {
            try {
              await axios.post(endpoint, bodyBuilder(methodCandidate), { headers });
              return;
            } catch (postError) {
              lastError = postError;

              if (
                axios.isAxiosError(postError) &&
                [400, 404, 405, 422, 500].includes(postError.response?.status ?? 0)
              ) {
                continue;
              }

              throw postError;
            }
          }

          if (
            axios.isAxiosError(patchError) &&
            [400, 404, 405, 422, 500].includes(patchError.response?.status ?? 0)
          ) {
            continue;
          }

          throw patchError;
        }
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
};

const mapDailySummaryMethod = (
  method?: { count?: number | string | null; total?: number | string | null } | null,
): DailySummaryMethodTotal => ({
  count: toNumber(method?.count, 0),
  total: toNumber(method?.total, 0),
});

const mapSalesByMethodKey = (key: string): keyof CashRegisterSalesByMethod => {
  const normalized = key.trim().toLowerCase();

  if (["efectivo", "cash"].includes(normalized)) return "efectivo";
  if (["tarjeta", "card", "debito", "credito", "debit", "credit"].includes(normalized)) {
    return "tarjeta";
  }
  if (["transferencia", "transfer", "bank_transfer"].includes(normalized)) return "transferencia";
  if (["qr"].includes(normalized)) return "qr";
  return "unknown";
};

const normalizeSalesByMethod = (input: unknown): CashRegisterSalesByMethod => {
  const totals: CashRegisterSalesByMethod = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    qr: 0,
    unknown: 0,
  };

  if (!input || typeof input !== "object") {
    return totals;
  }

  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    const mappedKey = mapSalesByMethodKey(key);

    if (typeof value === "number" || typeof value === "string") {
      totals[mappedKey] += toNumber(value, 0);
      return;
    }

    if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;
      totals[mappedKey] += toNumber(
        (nested.total as string | number | null | undefined) ??
          (nested.amount as string | number | null | undefined) ??
          (nested.value as string | number | null | undefined),
        0,
      );
    }
  });

  return totals;
};

const extractCashRegisterSessionPayload = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as Record<string, unknown>;
  const directCandidates = [root, root.session, root.data, root.current, root.cashRegisterSession];

  for (const candidate of directCandidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const current = candidate as Record<string, unknown>;

    if (
      "openingAmount" in current ||
      "opening_amount" in current ||
      "openedAt" in current ||
      "opened_at" in current ||
      "status" in current
    ) {
      return current;
    }

    const nested = current.session;
    if (nested && typeof nested === "object") {
      return nested as Record<string, unknown>;
    }
  }

  return null;
};

const normalizeCashRegisterSession = (input: unknown): CashRegisterSession | null => {
  const raw = extractCashRegisterSessionPayload(input);
  if (!raw) return null;

  const statusRaw =
    (raw.status as string | undefined) ??
    (raw.state as string | undefined) ??
    "";

  const status = String(statusRaw || "").toUpperCase() || "OPEN";

  const declaredClosingAmount =
    raw.declaredClosingAmount ??
    raw.declared_closing_amount ??
    raw.closingAmount ??
    raw.declared_amount ??
    null;

  const expectedClosingAmount =
    raw.expectedClosingAmount ??
    raw.expected_closing_amount ??
    raw.expectedAmount ??
    null;

  const differenceAmount =
    raw.differenceAmount ??
    raw.difference_amount ??
    raw.difference ??
    null;

  return {
    id: String(raw.id ?? raw.sessionId ?? raw.session_id ?? ""),
    status,
    openingAmount: toNumber(
      (raw.openingAmount as string | number | null | undefined) ??
        (raw.opening_amount as string | number | null | undefined),
      0,
    ),
    declaredClosingAmount:
      declaredClosingAmount === null || declaredClosingAmount === undefined
        ? null
        : toNumber(declaredClosingAmount as string | number, 0),
    expectedClosingAmount:
      expectedClosingAmount === null || expectedClosingAmount === undefined
        ? null
        : toNumber(expectedClosingAmount as string | number, 0),
    differenceAmount:
      differenceAmount === null || differenceAmount === undefined
        ? null
        : toNumber(differenceAmount as string | number, 0),
    salesByMethod: normalizeSalesByMethod(raw.salesByMethod ?? raw.sales_by_method),
    openedAt: String(raw.openedAt ?? raw.opened_at ?? ""),
    closedAt:
      raw.closedAt === null || raw.closed_at === null
        ? null
        : String(raw.closedAt ?? raw.closed_at ?? "") || null,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
  };
};

export const fetchCurrentCashRegisterSession = async (): Promise<CashRegisterSession | null> => {
  const headers = getAuthHeaders();
  const { data } = await axios.get<unknown>(`${API_URL}/cash-register/current`, { headers });

  if (data === null) return null;
  if (typeof data === "object" && data && "session" in (data as Record<string, unknown>)) {
    const session = (data as Record<string, unknown>).session;
    if (!session) return null;
  }

  return normalizeCashRegisterSession(data);
};

export const openCashRegister = async (openingAmount: number): Promise<CashRegisterSession> => {
  const headers = getAuthHeaders();
  const { data } = await axios.post<unknown>(
    `${API_URL}/cash-register/open`,
    { openingAmount },
    { headers },
  );

  const session = normalizeCashRegisterSession(data);
  if (!session) {
    throw new Error("No se recibió una sesión de caja válida en la apertura.");
  }

  return session;
};

export const closeCashRegister = async (
  declaredClosingAmount: number,
  notes?: string,
): Promise<CashRegisterSession> => {
  const headers = getAuthHeaders();
  const payload = {
    declaredClosingAmount,
    ...(notes && notes.trim() ? { notes: notes.trim() } : {}),
  };

  const { data } = await axios.post<unknown>(`${API_URL}/cash-register/close`, payload, {
    headers,
  });

  const session = normalizeCashRegisterSession(data);
  if (!session) {
    throw new Error("No se recibió una sesión de caja válida en el cierre.");
  }

  return session;
};

export const fetchCashRegisterHistory = async (
  page = 1,
  limit = 20,
): Promise<CashRegisterHistoryResult> => {
  const headers = getAuthHeaders();
  const { data } = await axios.get<unknown>(`${API_URL}/cash-register/history`, {
    headers,
    params: { page, limit },
  });

  const payload = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const rawItems =
    (Array.isArray(payload) ? payload : null) ||
    (Array.isArray(payload.items) ? payload.items : null) ||
    (Array.isArray(payload.sessions) ? payload.sessions : null) ||
    (Array.isArray(payload.data) ? payload.data : null) ||
    (payload.data && typeof payload.data === "object" && Array.isArray((payload.data as Record<string, unknown>).items)
      ? ((payload.data as Record<string, unknown>).items as unknown[])
      : null) ||
    [];

  const items = rawItems
    .map((item) => normalizeCashRegisterSession(item))
    .filter((item): item is CashRegisterSession => Boolean(item));

  const meta =
    (payload.meta && typeof payload.meta === "object" ? payload.meta : null) ||
    (payload.pagination && typeof payload.pagination === "object" ? payload.pagination : null) ||
    null;

  const pageValue = toNumber(
    (meta as Record<string, unknown> | null)?.page as string | number | null | undefined,
    toNumber(payload.page as string | number | null | undefined, page),
  );
  const limitValue = toNumber(
    (meta as Record<string, unknown> | null)?.limit as string | number | null | undefined,
    toNumber(payload.limit as string | number | null | undefined, limit),
  );
  const totalValue = toNumber(
    (meta as Record<string, unknown> | null)?.total as string | number | null | undefined,
    toNumber(payload.total as string | number | null | undefined, items.length),
  );
  const totalPagesValue = toNumber(
    (meta as Record<string, unknown> | null)?.totalPages as string | number | null | undefined,
    toNumber(payload.totalPages as string | number | null | undefined, Math.max(1, Math.ceil(totalValue / Math.max(limitValue, 1)))),
  );

  return {
    items,
    page: pageValue,
    limit: limitValue,
    total: totalValue,
    totalPages: totalPagesValue,
  };
};

export const fetchCashierDailySummary = async (
  date?: string,
): Promise<CashierDailySummary> => {
  const headers = getAuthHeaders();
  const params = date ? { date } : undefined;

  const { data } = await axios.get<DailySummaryPayload>(
    `${API_URL}/order/cashier/daily-summary`,
    { headers, params },
  );

  const gross = toNumber(data.totals?.gross, 0);
  const ordersCount = toNumber(data.totals?.ordersCount, 0);
  const averageTicket =
    toNumber(data.totals?.averageTicket, ordersCount > 0 ? gross / ordersCount : 0);

  return {
    day: data.day || date || new Date().toISOString().slice(0, 10),
    range: {
      start: data.range?.start || "",
      end: data.range?.end || "",
    },
    totals: {
      gross,
      ordersCount,
      averageTicket,
    },
    byPaymentMethod: {
      efectivo: mapDailySummaryMethod(data.byPaymentMethod?.efectivo),
      tarjeta: mapDailySummaryMethod(data.byPaymentMethod?.tarjeta),
      transferencia: mapDailySummaryMethod(data.byPaymentMethod?.transferencia),
      qr: mapDailySummaryMethod(data.byPaymentMethod?.qr),
      unknown: mapDailySummaryMethod(data.byPaymentMethod?.unknown),
    },
    receipts: (data.receipts || []).map((receipt) => ({
      orderId: receipt.orderId || "",
      displayId: receipt.displayId || undefined,
      tableId: receipt.tableId || undefined,
      tableNumber: toNumber(receipt.tableNumber, 0),
      total: toNumber(receipt.total, 0),
      paymentMethod: (receipt.paymentMethod || "unknown").toLowerCase(),
      paidAt: receipt.paidAt || "",
      paidBy: receipt.paidBy || undefined,
      closedAt: receipt.closedAt || undefined,
      waiterName: receipt.waiterName || undefined,
    })),
  };
};