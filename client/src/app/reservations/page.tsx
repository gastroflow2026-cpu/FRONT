"use client";

import { useEffect, useState, useContext } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import axios from "axios";
import { getToken } from "@/helpers/getToken";
import { UsersContext } from "@/context/UsersContext";
import { CalendarCheck, MapPin, Users, Clock, CheckCircle, XCircle, Clock3 } from "lucide-react";
import { ReservationsPaymentContext } from "../../context/ReservationsPayments";
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

type ReservationStatus = "PENDIENTE" | "CONFIRMADO" | "CANCELADO";

interface Reservation {
  id: string;
  customer_name: string;
  reservation_date: string;
  start_time: string;
  guests_count: number;
  status: ReservationStatus;
  notes?: string;
  restaurant: { id: string; name: string; address?: string; image_url?: string };
  table: { table_number: number; zone: string };
  payment?: { status: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock3 size={12} /> },
  CONFIRMADO: { label: "Confirmada", color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle size={12} /> },
  CANCELADO: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={12} /> },
};

export default function ReservationsPage() {
  const { isLogged, isLoading } = useContext(UsersContext);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { stripeCheckout } = useContext(ReservationsPaymentContext);
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);
  const [loadingCancel, setLoadingCancel] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isLogged?.id) {
      setLoading(false);
      return;
    }

    const fetchReservations = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const { data } = await axios.get(
          `${API_URL}/users/${isLogged.id}/reservations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReservations(data);
      } catch {
        setError("Aún no ha hecho reservas.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isLogged?.id, isLoading ]);

  async function handlePay(reservationId: string) {
    setLoadingPayment(reservationId);
    try {
        await stripeCheckout(reservationId);
    } catch {
        // manejá el error
    } finally {
        setLoadingPayment(null);
    }
}

async function handleCancel(restaurantId: string, reservationId: string) {
  setLoadingCancel(reservationId);
  try {
    const token = getToken();
    await axios.patch(
      `${API_URL}/restaurants/${restaurantId}/reservations/${reservationId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setReservations(prev =>
      prev.map(r => r.id === reservationId ? { ...r, status: "CANCELADO" } : r)
    );
  } catch {
    console.error("Error al cancelar la reserva");
  } finally {
    setLoadingCancel(null);
  }
}

if (isLoading) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </main>
      <Footer />
    </div>
  );
}

// No logueado
if (!isLogged) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow flex items-center justify-center pt-24 pb-12 px-4 bg-gray-50/50">
        <div className="max-w-md w-full text-center p-10 bg-white rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="bg-orange-100/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <span className="text-5xl">📅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            Todavía no tenés reservas
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Iniciá sesión para ver tu historial de mesas o descubrir nuevos lugares para tu próxima cena.
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/login" className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition duration-150 w-full shadow-md">
              Iniciar Sesión
            </Link>
            <Link href="/restaurants" className="text-gray-400 font-semibold py-2 hover:text-gray-700 transition-colors">
              Explorar restaurantes
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

if (loading) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando reservas...</p>
      </main>
      <Footer />
    </div>
  );
}

  // Error
  if (error) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow flex items-center justify-center pt-24 pb-12 px-4 bg-gray-50/50">
        <div className="max-w-md w-full text-center p-10 bg-white rounded-4xl shadow-xl border border-gray-100">
          <div className="bg-red-100/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Algo salió mal
          </h1>
          <p className="text-gray-500 mb-8">
            No se pudieron cargar tus reservas. Intentá de nuevo más tarde.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition w-full shadow-md"
          >
            Reintentar
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
  }

  // Sin reservas
  if (reservations.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex items-center justify-center pt-24 pb-12 px-4 bg-gray-50/50">
          <div className="max-w-md w-full text-center p-10 bg-white rounded-4xl shadow-xl border border-gray-100">
            <div className="bg-orange-100/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-5xl">📅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No tenés reservas aún
            </h1>
            <p className="text-gray-500 mb-10">
              Explorá restaurantes y hacé tu primera reserva.
            </p>
            <Link href="/restaurants" className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition w-full block shadow-md">
              Explorar restaurantes
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Con reservas
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="grow pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <CalendarCheck size={28} className="text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis reservas</h1>
              <p className="text-sm text-gray-500">{reservations.length} reserva{reservations.length !== 1 ? "s" : ""} encontrada{reservations.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="space-y-4">
            {reservations.map((reservation) => {
              const status = STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG.PENDING;
              const date = new Date(reservation.reservation_date).toLocaleDateString("es-AR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              });
              const time = new Date(reservation.start_time).toLocaleTimeString("es-AR", {
                hour: "2-digit", minute: "2-digit",
              });

              return (
              <div key={reservation.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header con imagen */}
                {reservation.restaurant.image_url && (
                  <div className="h-28 w-full overflow-hidden">
                    <img
                      src={reservation.restaurant.image_url}
                      alt={reservation.restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-bold text-gray-900 text-lg">{reservation.restaurant.name}</h2>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarCheck size={14} className="text-orange-400 shrink-0" />
                      <span className="capitalize">{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-400 shrink-0" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-orange-400 shrink-0" />
                      <span>{reservation.guests_count} persona{reservation.guests_count !== 1 ? "s" : ""}</span>
                    </div>
                    {reservation.restaurant.address && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-orange-400 shrink-0" />
                        <span className="truncate">{reservation.restaurant.address}</span>
                      </div>
                    )}
                  </div>

                  {reservation.notes && (
                    <p className="mt-3 text-xs text-gray-400 italic">"{reservation.notes}"</p>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-900">
                      Mesa {reservation.table.table_number} · {reservation.table.zone}
                    </span>
                    <div className="flex items-center gap-3">
                      {reservation.status === "PENDIENTE" && (
                        <button
                          onClick={() => handlePay(reservation.id)}
                          disabled={loadingPayment === reservation.id}
                          className="text-xs font-semibold text-white bg-linear-to-r from-orange-500 to-pink-500 px-3 py-1.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                          {loadingPayment === reservation.id ? "Procesando..." : "Completar pago"}
                        </button>
                      )}
                      {reservation.status !== "CANCELADO" && (
                      <button
                        onClick={() => handleCancel(reservation.restaurant.id, reservation.id)}
                        disabled={loadingCancel === reservation.id}
                        className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {loadingCancel === reservation.id ? "Cancelando..." : "Cancelar reserva"}
                      </button>
                    )}
                      <Link href={`/restaurant/${reservation.restaurant.id}`}>
                        <button className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition">
                          Ver restaurante →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div> 
              </div> 
            );
            })}
          </div>
        </div>
      
      
      </main>

      <Footer />
    </div>
  );
}