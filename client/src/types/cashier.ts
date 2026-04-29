export type TableStatus = "libre" | "ocupada" | "reservada";
export type TableZone = "salon" | "terraza" | "privado";
export type OrderStatus = "pendiente" | "preparacion" | "servido" | "pagado";
export type PaymentMethod = "efectivo" | "transferencia" | "qr" | "debito" | "credito";

export interface OrderItem {
  quantity: number;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  tableId: number;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  iva: number;
  total: number;
  createdAt: string;
  note?: string;
}

export interface Reservation {
  id: number;
  tableId: number;
  clientName: string;
  phone: string;
  time: string;
  persons: number;
  note?: string;
}

export interface Table {
  id: number;
  zone: TableZone;
  status: TableStatus;
  persons?: number;
  currentOrder?: Order;
  reservation?: Reservation;
  lastPaidOrder?: Order;
}

export interface CashierMetrics {
  activeOrders: number;
  ordersInPreparation: number;
  occupiedTables: number;
  totalTables: number;
  reservedTables: number;
  reservationsToday: number;
}