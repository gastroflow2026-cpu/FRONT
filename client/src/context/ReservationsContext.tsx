"use client";
import { createContext, ReactNode, useContext } from "react";
import axios from "axios";

interface ReservationValues {
    customer_name: string;
    customer_email: string;
    customer_phone: number;
    reservation_date: string;
    start_time: string;
    guest_count: number;
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
                `http:/localhost:3000/restaurants/${restaurantId}/reservations/newReservation`,
                values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
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