"use client";

import { useState } from "react";
import { CalendarDays, Phone, Users, MapPin, Clock, Info } from "lucide-react";
import { Reservation } from "@/types/cashier";
import { mockReservations } from "@/utils/cashierMockData";

type FilterTab = "todas" | "señadas" | "pendientes";

const TABS: { value: FilterTab; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "señadas", label: "Señadas" },
  { value: "pendientes", label: "Pendientes" },
];

const today = new Date().toLocaleDateString("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function ReservationsList() {
  const [activeTab, setActiveTab] = useState<FilterTab>("todas");

  // Por ahora con mocks mostramos todas en "todas" y simulamos tabs
  const filteredReservations =
    activeTab === "todas" ? mockReservations : mockReservations;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-gray-600" />
          <h2 className="font-semibold text-gray-800 text-sm">
            Reservas del día
          </h2>
        </div>
        <span className="text-xs text-gray-400 capitalize">{today}</span>
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
              <span
                className={`text-[10px] font-bold ${
                  activeTab === "todas" ? "text-white" : "text-gray-400"
                }`}
              >
                {mockReservations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filteredReservations.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            No hay reservas en esta categoría
          </p>
        ) : (
          filteredReservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))
        )}
      </div>
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <div className="border-l-4 border-orange-400 bg-orange-50 rounded-r-xl px-3 py-3 space-y-2">
      {/* Nombre */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">
          {reservation.clientName}
        </span>
      </div>

      {/* Teléfono */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Phone size={11} />
        <span>{reservation.phone}</span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {reservation.time} hs
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} />
          {reservation.persons} pers.
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          Mesa {reservation.tableId}
        </span>
      </div>

      {/* Nota */}
      {reservation.note && (
        <div className="flex items-start gap-1 text-xs text-orange-600 bg-orange-100 rounded-lg px-2 py-1.5">
          <Info size={11} className="mt-0.5 shrink-0" />
          <span>{reservation.note}</span>
        </div>
      )}
    </div>
  );
}