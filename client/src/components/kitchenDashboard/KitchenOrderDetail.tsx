"use client";

import { X, Clock, UtensilsCrossed, Info, Play, CheckCircle, Loader2 } from "lucide-react";
import { KitchenOrder, KitchenOrderStatus } from "@/types/kitchen";

interface Props {
  order: KitchenOrder | null;
  displayId: number | null;
  isLoading: boolean;
  onChangeStatus: (orderId: string, newStatus: KitchenOrderStatus) => void;
  onClose: () => void;
}

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

export default function KitchenOrderDetail({
  order,
  displayId,
  isLoading,
  onChangeStatus,
  onClose,
}: Props) {
  if (!order) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
          <UtensilsCrossed size={36} className="text-gray-200" />
        </div>
        <p className="text-sm font-medium text-gray-400">
          Seleccioná una orden para ver el detalle
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Hacé click en cualquier orden de la lista
        </p>
      </div>
    );
  }

  const canStart = order.status === "pendiente";
  const canFinish = order.status === "preparacion";
  const isServido = order.status === "servido";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-gray-800">
              Orden {displayId ?? "-"}
            </h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                STATUS_STYLES[order.status]
              }`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-xs text-gray-400">{order.tableLabel}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Tiempos */}
      <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          Ingresó: {order.createdAt}
        </span>
        {order.startedAt && (
          <span className="flex items-center gap-1">
            <Play size={11} />
            Iniciado: {order.startedAt}
          </span>
        )}
        {order.finishedAt && (
          <span className="flex items-center gap-1">
            <CheckCircle size={11} />
            Finalizado: {order.finishedAt}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Productos
        </p>
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
          >
            <span className="w-7 h-7 rounded-lg bg-linear-to-br from-orange-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {item.quantity}
            </span>
            <span className="text-sm text-gray-700">{item.name}</span>
          </div>
        ))}

        {/* Nota */}
        {order.note && (
          <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 mt-3">
            <Info size={13} className="text-orange-400 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-600">{order.note}</p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="p-5 border-t border-gray-100 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-3 gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Actualizando...
          </div>
        ) : (
          <>
            {canStart && (
              <button
                onClick={() => onChangeStatus(order.id, "preparacion")}
                className="w-full py-3 rounded-xl bg-linear-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Play size={15} />
                Iniciar preparación
              </button>
            )}
            {canFinish && (
              <button
                onClick={() => onChangeStatus(order.id, "servido")}
                className="w-full py-3 rounded-xl bg-linear-to-r from-teal-500 to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <CheckCircle size={15} />
                Finalizar orden
              </button>
            )}
            {isServido && (
              <div className="w-full py-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle size={15} />
                Orden servida
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}