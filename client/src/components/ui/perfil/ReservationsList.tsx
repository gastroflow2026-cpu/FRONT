"use client";

import style from "./ReservationsList.module.css";
import { Reserva } from "@/types/Reserva";

export default function ReservList({ reserva }: { reserva: Reserva[] }) {
  return (
    <div className={style.reservaContainer}>
      <h1>Historial de Reservas</h1>
      
      <div className={style.cardsGrid}>
        {reserva.map((res: Reserva) => (
          <div key={res.id} className={style.reservCard}>
            
            {/* Header con ID y Marca */}
            <div className={style.cardHeader}>
              <div className={style.headerLeft}>
                <div className={style.idBadge}>A{res.id}</div>
                <div>
                  <h4 className={style.reservaTitle}>Reserva de Mesa</h4>
                  <p className={style.orderNum}>ID #{res.id * 100} / GastroFlow</p>
                </div>
              </div>
              <div className={`${style.statusBadge} ${res.status === 'Activa' ? style.statusActiva : style.statusCancelada}`}>
                {res.status}
              </div>
            </div>

            {/* Fecha y Hora centralizada */}
            <div className={style.dateTime}>
              {res.date} | {res.time}
            </div>

            {/* Fila de Comensales y Precio con línea divisoria */}
            <div className={style.detailsRow}>
              <div className={style.detailItem}>
                <span className={style.detailLabel}>Comensales</span>
                <span className={style.detailValue}>{res.guests_count}</span>
              </div>
              
              <div className={style.verticalDivider}></div>

              <div className={style.detailItem}>
                <span className={style.detailLabel}>Total</span>
                <span className={style.priceValue}>{res.total}</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}