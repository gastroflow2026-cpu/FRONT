"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../../ui/Calendar";
import { ReservationCard } from "./ReservationCard";
import styles from "./Reservations.module.css";
import { reservations } from "@/utils/reserveInfo"

export function Reservations() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const filteredReservations = reservations.filter((res) => {
    if (!selectedDate) return false;
    return res.date === format(selectedDate, "yyyy-MM-dd");
  });

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
              Reservas para {selectedDate ? format(selectedDate, "PPPP", { locale: es }) : "..."}
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