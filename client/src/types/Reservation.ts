interface Reservation {
  id: string;
  date: string;
  customerName: string;
  time: string;
  guests: number;
  status: "confirmada" | "pendiente" | "cancelada";
}