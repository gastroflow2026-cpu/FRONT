"use client";

import style from "./ReservationsList.module.css";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { Reserva } from "@/types/Reservation";

const formatDate = (value: string) => {
  if (!value) return "-";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
};

const formatTime = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReservList({ reserva }: { reserva: Reserva[] }) {
  return (
    <div className={style.reservaContainer}>
      <h3>Historial de Reservas</h3>
      <div className={style.cardsGrid}>
        {reserva.map((res: Reserva) => {
          const displayId = res.id.slice(0, 8).toUpperCase();

          return (
            <div className={style.reservCard} key={res.id}>

            {/* Sección Superior */}
            <div className={style.cardSection}>
              <div className={style.headerContent}>
                <GiForkKnifeSpoon className={style.mainIcon} />
                <div className={style.titleInfo}>
                  <h4>RESERVA DE MESA</h4>
                  <p>Id #{displayId} / GastroFlow</p>
                </div>
              </div>
            </div>

            {/* Sección Media */}
            <div className={style.cardSectionBorder}>
              <div className={style.dateTimeRow}>
                <div className={style.half}>
                  <span>{formatDate(res.reservation_date)}</span>
                </div>
                <div className={style.half}>
                  <span>{formatTime(res.start_time)}</span>
                </div>
              </div>
            </div>

            {/* Sección Inferior */}
            <div className={style.cardSection}>
              <div className={style.detailsRow}>
                <div className={style.half}>
                  <span className={style.label}>COMENSALES</span>
                  <span className={style.value}>{res.guests_count}</span>
                </div>
                <div className={style.half}>
                  <span className={style.label}>ESTADO</span>
                  <span className={style.value}>{res.status}</span>
                </div>
              </div>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
