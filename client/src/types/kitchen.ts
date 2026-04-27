import { OrderItem } from "@/types/cashier";

export type KitchenOrderStatus = "pendiente" | "preparacion" | "servido";

export interface KitchenOrder {
  id: string;
  tableId: number;
  status: KitchenOrderStatus;
  items: OrderItem[];
  note?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}