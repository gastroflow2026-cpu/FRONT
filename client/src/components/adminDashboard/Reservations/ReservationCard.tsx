"use client";

import { Clock, Users } from "lucide-react";
import styles from "./ReservationCard.module.css";

interface Reservation {
  id: string;
  customerName: string;
  time: string;
  guests: number;
  status: "confirmada" | "pendiente" | "cancelada";
}

interface ReservationCardProps {
  reservation: Reservation;
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  const statusClass = styles[reservation.status];

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h4 className={styles.customerName}>{reservation.customerName}</h4>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <Clock size={16} />
            <span>{reservation.time}</span>
          </div>
          <div className={styles.detailItem}>
            <Users size={16} />
            <span>{reservation.guests} personas</span>
          </div>
        </div>
      </div>

      <span className={`${styles.badge} ${statusClass}`}>
        {reservation.status}
      </span>
    </div>
  );
}