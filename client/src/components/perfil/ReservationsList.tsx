"use client";

import style from "./ReservationsList.module.css";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { Reserva } from "@/types/Reserva";

export default function ReservList({ reserva }: { reserva: Reserva[] }) {
  return (
    <div className={style.reservaContainer}>
      <h3>Historial de Reservas</h3>
      <div className={style.cardsGrid}>
        {reserva.map((res: Reserva) => (
          <div className={style.reservCard} key={res.id}>

            {/* Sección Superior */}
            <div className={style.cardSection}>
              <div className={style.headerContent}>
                <GiForkKnifeSpoon className={style.mainIcon} />
                <div className={style.titleInfo}>
                  <h4>RESERVA DE MESA</h4>
                  <p>Id #{res.id * 100} / GastroFlow</p>
                </div>
              </div>
            </div>

            {/* Sección Media */}
            <div className={style.cardSectionBorder}>
              <div className={style.dateTimeRow}>
                <div className={style.half}>
                  <span>{res.date}</span>
                </div>
                <div className={style.half}>
                  <span>{res.time}</span>
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
                  <span className={style.label}>TOTAL</span>
                  <span className={style.value}>{res.total}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
