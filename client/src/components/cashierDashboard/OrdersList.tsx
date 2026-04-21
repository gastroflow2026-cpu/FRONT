"use client";

import { useState } from "react";
import { CalendarClock, UtensilsCrossed } from "lucide-react";
import { Order, OrderStatus } from "@/types/cashier";
import { mockTables } from "@/utils/cashierMockData";

type FilterTab = "todas" | "pendientes" | "preparacion";

const TABS: { value: FilterTab; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendientes", label: "Pendientes" },
  { value: "preparacion", label: "Preparación" },
];

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-orange-100 text-orange-600",
  preparacion: "bg-blue-100 text-blue-600",
  servido: "bg-purple-100 text-purple-600",
  pagado: "bg-green-100 text-green-600",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  preparacion: "En preparación",
  servido: "Servido",
  pagado: "Pagado",
};

export default function OrdersList() {
  const [activeTab, setActiveTab] = useState<FilterTab>("todas");

  const allOrders = mockTables
    .filter((t) => t.currentOrder)
    .map((t) => ({ order: t.currentOrder!, tableId: t.id }));

  const filteredOrders = allOrders.filter(({ order }) => {
    if (activeTab === "todas") return true;
    if (activeTab === "pendientes") return order.status === "pendiente";
    if (activeTab === "preparacion") return order.status === "preparacion";
    return true;
  });

  const pendingCount = allOrders.filter(
    ({ order }) => order.status === "pendiente"
  ).length;
  const prepCount = allOrders.filter(
    ({ order }) => order.status === "preparacion"
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock size={16} className="text-gray-600" />
        <h2 className="font-semibold text-gray-800 text-sm">Órdenes</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === tab.value
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            {tab.value === "todas" && (
              <span className={`text-[10px] font-bold ${activeTab === "todas" ? "text-white" : "text-gray-400"}`}>
                {allOrders.length}
              </span>
            )}
            {tab.value === "pendientes" && pendingCount > 0 && (
              <span className={`text-[10px] font-bold ${activeTab === "pendientes" ? "text-white" : "text-gray-400"}`}>
                {pendingCount}
              </span>
            )}
            {tab.value === "preparacion" && prepCount > 0 && (
              <span className={`text-[10px] font-bold ${activeTab === "preparacion" ? "text-white" : "text-gray-400"}`}>
                {prepCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filteredOrders.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            No hay órdenes en esta categoría
          </p>
        ) : (
          filteredOrders.map(({ order, tableId }) => (
            <OrderCard key={order.id} order={order} tableId={tableId} />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, tableId }: { order: Order; tableId: number }) {
  const visibleItems = order.items.slice(0, 2);
  const extraItems = order.items.length - 2;

  return (
    <div className="border border-gray-100 rounded-xl p-3 space-y-2">
      {/* Header de la orden */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">
            #{order.id}
          </span>
          <span className="text-xs text-gray-400">Mesa {tableId}</span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <UtensilsCrossed size={11} />
          {order.items.length} productos
        </span>
        <span className="flex items-center gap-1">
          <CalendarClock size={11} />
          {order.createdAt}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {visibleItems.map((item, i) => (
          <div key={i} className="flex justify-between text-xs text-gray-600">
            <span>
              {item.quantity} {item.name}
            </span>
            <span>${item.price.toLocaleString("es-AR")}</span>
          </div>
        ))}
        {extraItems > 0 && (
          <p className="text-xs text-gray-400">+{extraItems} más</p>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
        <span className="text-xs text-gray-400">Total</span>
        <span className="text-sm font-semibold text-gray-800">
          ${order.total.toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  );
}