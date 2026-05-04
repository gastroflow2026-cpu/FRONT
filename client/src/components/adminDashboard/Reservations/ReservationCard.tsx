"use client";

import { Clock, Users } from "lucide-react";
import styles from "./ReservationCard.module.css";
import { ReservaUI } from "@/types/Reservation";

interface ReservationCardProps {
  reservation: ReservaUI;
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  const statusClass = styles[reservation.status];

  const formatStatus = (status: ReservaUI["status"]) => {
    switch (status) {
      case "confirmado":
        return "Confirmado";
      case "pendiente":
        return "Pendiente";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h4 className={styles.customerName}>
          {reservation.customerName}
        </h4>

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
        {formatStatus(reservation.status)}
      </span>
    </div>
  );
}