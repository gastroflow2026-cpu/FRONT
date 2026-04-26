import { Phone, Users, MapPin, Clock, Info } from "lucide-react";
import { Reservation } from "@/types/cashier";
import { mockReservations } from "@/utils/cashierMockData";

export default function ReservationsTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-full">
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {mockReservations.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        {/* Izquierda: nombre, teléfono, observaciones */}
        <div className="space-y-1.5 flex-1">
          <p className="text-sm font-semibold text-gray-800">
            {reservation.clientName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone size={11} />
            <span>{reservation.phone}</span>
          </div>
          {reservation.note ? (
            <div className="flex items-start gap-1.5 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1.5">
              <Info size={11} className="mt-0.5 shrink-0" />
              <span>{reservation.note}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-300 italic">Sin observaciones</p>
          )}
        </div>

        {/* Derecha: hora, mesa, personas */}
        <div className="space-y-1.5 text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <Clock size={11} />
            <span>{reservation.time} hs</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <MapPin size={11} />
            <span>Mesa {reservation.tableId}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <Users size={11} />
            <span>{reservation.persons} pers.</span>
          </div>
        </div>
      </div>
    </div>
  );
}