"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../../ui/Calendar";
import { ReservationCard } from "./ReservationCard";
import styles from "./Reservations.module.css";
import { UsersContext } from "@/context/UsersContext";
import { Reserva, ReservaUI } from "@/types/Reservation";
import { adminService } from "@/services/adminService";

export function Reservations() {
  const [reservations, setReservations] = useState<ReservaUI[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const { isLogged } = useContext(UsersContext);

  const restaurantId = useMemo(() => {
    return isLogged?.restaurant_id ?? null;
  }, [isLogged]);

  const mapReservaToUI = (reserva: Reserva): ReservaUI => ({
    id: reserva.id,
    date: reserva.reservation_date.split("T")[0],
    customerName: reserva.customer_name,
    time: reserva.start_time.split("T")[1].slice(0, 5),
    guests: reserva.guests_count,
    status: reserva.status.toLowerCase() as ReservaUI["status"],
  });

const fetchReservations = async () => {
  if (!restaurantId) return;

  try {
    const response = await adminService.getAllReservations(restaurantId);

    const reservasArray = Array.isArray(response)
      ? response
      : response?.data ?? [];

    const mapped = reservasArray.map(mapReservaToUI);

    setReservations(mapped);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchReservations();
  }, [restaurantId]);

  const filteredReservations = useMemo(() => {
    if (!selectedDate) return [];

    const selected = format(selectedDate, "yyyy-MM-dd");

    return reservations.filter((res) => res.date === selected);
  }, [reservations, selectedDate]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Gestión de Reservas</h2>
        <p>Administra las reservas del restaurante</p>
      </header>

      <div className={styles.grid}>
        <aside className={styles.calendarSection}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Seleccionar Fecha</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={es}
              className="rounded-md border-none"
            />
          </div>
        </aside>

        <section className={styles.listSection}>
          <div className={styles.listHeader}>
            <h3 className={styles.cardTitle}>
              Reservas para{" "}
              {selectedDate
                ? format(selectedDate, "PPPP", { locale: es })
                : "..."}
            </h3>

            <span className={styles.badge}>
              {filteredReservations.length} reservas
            </span>
          </div>

          {filteredReservations.length > 0 ? (
            <div className={styles.reservationList}>
              {filteredReservations.map((res) => (
                <ReservationCard key={res.id} reservation={res} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No hay reservas para esta fecha</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}