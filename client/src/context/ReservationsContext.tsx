"use client";
import { createContext, ReactNode, useContext } from "react";
import axios from "axios";

interface ReservationValues {
    customer_name: string;
    customer_email: string;
    customer_phone: number;
    reservation_date: string;
    start_time: string;
    guests_count: number;
    notes?: string;
    table_id: string;
}

interface ReservationsContextType {
    handleReservation: (restaurantId: string, values: ReservationValues) => Promise<void>;
}

export const ReservationsContext = createContext<ReservationsContextType>({
    handleReservation: async () => {},
});

const ReservationsProvider = ({ children }: { children: ReactNode }) => {

    const handleReservation = async (restaurantId: string, values: ReservationValues) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:3000/restaurants/11111111-1111-1111-1111-111111111111/reservations/newReservation`,
                values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const { url } = response.data;
            console.log(url);
            if (url) {
            window.location.href = url; // redirige a Stripe
            }
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al crear la reserva');
        }
    };

    const value: ReservationsContextType = {
        handleReservation,
    };

    return (
        <ReservationsContext.Provider value={value}>
            {children}
        </ReservationsContext.Provider>
    );
};

export default ReservationsProvider;