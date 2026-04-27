"use client";

import { useState } from "react";
import { Clock, UtensilsCrossed, Users } from "lucide-react";
import { KitchenOrder, KitchenOrderStatus } from "@/types/kitchen";

interface Props {
  orders: KitchenOrder[];
  selectedOrderId: string | null;
  onSelectOrder: (order: KitchenOrder) => void;
}

type FilterTab = "todas" | KitchenOrderStatus;

const TABS: { value: FilterTab; label: string }[] = [
  { value: "todas", label: "Todas las órdenes" },
  { value: "pendiente", label: "En espera" },
  { value: "preparacion", label: "En proceso" },
  { value: "servido", label: "Servido" },
];

const STATUS_STYLES: Record<KitchenOrderStatus, string> = {
  pendiente: "bg-orange-100 text-orange-600",
  preparacion: "bg-blue-100 text-blue-600",
  servido: "bg-green-100 text-green-600",
};

const STATUS_LABELS: Record<KitchenOrderStatus, string> = {
  pendiente: "En espera",
  preparacion: "En proceso",
  servido: "Servido",
};

const BORDER_STYLES: Record<KitchenOrderStatus, string> = {
  pendiente: "border-l-orange-400",
  preparacion: "border-l-blue-400",
  servido: "border-l-green-400",
};

export default function KitchenOrdersList({
  orders,
  selectedOrderId,
  onSelectOrder,
}: Props) {
  const [activeTab, setActiveTab] = useState<FilterTab>("todas");

  const filteredOrders = orders
    .filter((o) => activeTab === "todas" || o.status === activeTab)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const countByStatus = (status: KitchenOrderStatus) =>
    orders.filter((o) => o.status === status).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1 mb-4">
        {TABS.map((tab) => {
          const count =
            tab.value === "todas"
              ? orders.length
              : countByStatus(tab.value as KitchenOrderStatus);

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === tab.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value
                    ? "bg-gray-100 text-gray-600"
                    : "text-gray-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-240px)] pr-1">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <UtensilsCrossed size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay órdenes en esta categoría</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isSelected={selectedOrderId === order.id}
              onClick={() => onSelectOrder(order)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  isSelected,
  onClick,
}: {
  order: KitchenOrder;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-l-4 border border-gray-100 p-3 transition-all hover:shadow-sm ${
        BORDER_STYLES[order.status]
      } ${isSelected ? "bg-orange-50 border-orange-200" : "hover:bg-gray-50"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">#{order.id}</span>
          <span className="text-xs text-gray-400">Mesa {order.tableId}</span>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            STATUS_STYLES[order.status]
          }`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-0.5 mb-2">
        {order.items.slice(0, 2).map((item, i) => (
          <p key={i} className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{item.quantity}x</span>{" "}
            {item.name}
          </p>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-gray-300">
            +{order.items.length - 2} más
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {order.createdAt}
        </span>
        {order.note && (
          <span className="flex items-center gap-1 text-orange-400">
            <Users size={10} />
            Tiene nota
          </span>
        )}
      </div>
    </button>
  );
}