import { Reserva } from "@/types/Reservation";

export const reservations: Reserva[] = [
    {
      id: "1",
      date: "2026-04-18",
      customerName: "Ana Martínez",
      time: "14:00",
      guests: 4,
      status: "confirmada",
    },
    {
      id: "2",
      date: "2026-04-18",
      customerName: "Pedro López",
      time: "20:30",
      guests: 2,
      status: "confirmada",
    },
    {
      id: "3",
      date: "2026-04-18",
      customerName: "Laura García",
      time: "19:00",
      guests: 6,
      status: "pendiente",
    },
  ];
