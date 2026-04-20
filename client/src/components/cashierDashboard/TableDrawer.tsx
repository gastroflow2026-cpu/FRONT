"use client";

import { X, UtensilsCrossed, Users, MapPin, Clock, Phone, Info, CheckCircle } from "lucide-react";
import { Table } from "@/types/cashier";

interface TableDrawerProps {
  table: Table | null;
  onClose: () => void;
  onCloseOrder: (table: Table) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  libre: { bg: "bg-teal-50", text: "text-teal-600", dot: "bg-teal-500" },
  ocupada: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  reservada: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400" },
};

const STATUS_LABELS: Record<string, string> = {
  libre: "Libre",
  ocupada: "Ocupada",
  reservada: "Reservada",
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-orange-100 text-orange-600",
  preparacion: "bg-blue-100 text-blue-600",
  servido: "bg-purple-100 text-purple-600",
  pagado: "bg-green-100 text-green-600",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  preparacion: "En preparación",
  servido: "Servido",
  pagado: "Pagado",
};

const ZONE_LABELS: Record<string, string> = {
  salon: "Salón",
  terraza: "Terraza",
  privado: "Privado",
};

export default function TableDrawer({ table, onClose, onCloseOrder }: TableDrawerProps) {
  if (!table) return null;

  const statusStyle = STATUS_STYLES[table.status];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className={`p-5 border-b border-gray-100 ${statusStyle.bg}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <UtensilsCrossed size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 text-base">
                  Mesa {table.id}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                  <span className={`text-xs font-medium ${statusStyle.text}`}>
                    {STATUS_LABELS[table.status]}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            {table.persons && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {table.persons} personas
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {ZONE_LABELS[table.zone]}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Mesa LIBRE */}
          {table.status === "libre" && (
            <LibreContent table={table} />
          )}

          {/* Mesa OCUPADA */}
          {table.status === "ocupada" && table.currentOrder && (
            <OcupadaContent table={table} />
          )}

          {/* Mesa RESERVADA */}
          {table.status === "reservada" && table.reservation && (
            <ReservadaContent table={table} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          {table.status === "ocupada" && table.currentOrder &&
            (table.currentOrder.status === "servido" || table.currentOrder.status === "preparacion") && (
            <button
              onClick={() => onCloseOrder(table)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <CheckCircle size={16} />
              Cobrar y cerrar orden
            </button>
          )}
          {(table.status === "libre" || table.status === "reservada") && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
              Cerrar panel
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function LibreContent({ table }: { table: Table }) {
  return (
    <div className="space-y-3">
      {table.lastPaidOrder ? (
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-teal-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-teal-700">
              Orden #{table.lastPaidOrder.id} pagada
            </p>
            <p className="text-xs text-teal-500">
              ${table.lastPaidOrder.total.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
        <Clock size={15} className="text-gray-400 shrink-0" />
        <p className="text-sm text-gray-400">Sin reserva para esta mesa</p>
      </div>
    </div>
  );
}

function OcupadaContent({ table }: { table: Table }) {
  const order = table.currentOrder!;

  return (
    <div className="space-y-3">
      {/* Header orden */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-800">
            Orden #{order.id}
          </span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_STYLES[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-600">
            <span>
              <span className="font-medium text-gray-700">{item.quantity}</span>{" "}
              {item.name}
            </span>
            <span>${item.price.toLocaleString("es-AR")}</span>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="border-t border-gray-100 pt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Subtotal</span>
          <span>${order.subtotal.toLocaleString("es-AR")}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>IVA (15%)</span>
          <span>${order.iva.toLocaleString("es-AR")}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-gray-800 pt-1">
          <span>Total</span>
          <span>${order.total.toLocaleString("es-AR")}</span>
        </div>
      </div>

      {/* Nota */}
      {order.note && (
        <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
          <Info size={13} className="text-orange-400 mt-0.5 shrink-0" />
          <p className="text-xs text-orange-600">{order.note}</p>
        </div>
      )}

      {/* Hora */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Clock size={11} />
        <span>Ingresada a las {order.createdAt}</span>
      </div>
    </div>
  );
}

function ReservadaContent({ table }: { table: Table }) {
  const reservation = table.reservation!;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={14} className="text-gray-400" />
        <span className="text-sm font-semibold text-gray-700">Reserva</span>
      </div>

      <div className="border border-gray-100 rounded-xl p-4 space-y-3">
        {/* Nombre */}
        <p className="text-sm font-semibold text-gray-800">
          {reservation.clientName}
        </p>

        {/* Teléfono */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone size={12} />
          <span>{reservation.phone}</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {reservation.time} hs
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {reservation.persons} personas
          </span>
        </div>

        {/* Nota */}
        {reservation.note && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <Info size={12} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-600">{reservation.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}