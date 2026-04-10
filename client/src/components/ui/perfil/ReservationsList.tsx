"use client";

import style from "./ReservationsList.module.css";

import { Reserva } from "@/types/Reserva";

export default function ReservList({ reserva }: { reserva: Reserva[] }) {


  return (
    <ul className={style.reservaContainer}>
      <h1>Lista de reservas</h1>
      {reserva.map((res: Reserva) => {
        return (
          <li key={res.id} className={style.reservCard}>
            <h4>Reservation #{res.id}</h4>
            <p>{res.date}, {res.time}</p>
            <p>Comensales: {res.guests_count}</p>
            <p>{res.status}</p>
            <p>Total: {res.total}</p>
          </li>
        );
      })}
    </ul>
  );
}
