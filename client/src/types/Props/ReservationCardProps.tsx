interface ReservationCardProps {
  reservation: {
    id: string;
    customerName: string;
    time: string;
    guests: number;
    status: "confirmada" | "pendiente" | "cancelada";
  };
}