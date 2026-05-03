export interface Reserva {
  id: string;

  table: {
    id: string;
    table_number: number;
    capacity: number;
    zone: string;
    status: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };

  user: {
    id: string;
    restaurant_id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
    imgUrl: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };

  customer_name: string;
  customer_email: string;
  customer_phone: string;

  reservation_date: string;
  start_time: string;
  end_time: string;

  guests_count: number;
  status: "CONFIRMADO" | "PENDIENTE" | "CANCELADO";

  notes: string;
  deposit_amount: number | null;

  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ReservaUI {
  id: string;
  date: string;
  customerName: string;
  time: string;
  guests: number;
  status: "confirmado" | "pendiente" | "cancelado";
}