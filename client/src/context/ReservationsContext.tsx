"use client";
import { createContext, ReactNode, useContext } from "react";
import axios from "axios";
import { getToken } from "@/helpers/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

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
    handleReservation: (restaurantId: string, values: ReservationValues) => Promise<{ url?: string } | undefined>;
}

export const ReservationsContext = createContext<ReservationsContextType>({
    handleReservation: async () => undefined,
});

const ReservationsProvider = ({ children }: { children: ReactNode }) => {

    const handleReservation = async (restaurantId: string, values: ReservationValues) => {
        try {
            if (!API_URL || !restaurantId) {
                throw new Error('API URL o Restaurant ID no están configurados');
            }

            const token = getToken();
            const response = await axios.post(
                `${API_URL}/restaurants/${restaurantId}/reservations/newReservation`,
                values,
                {
                    headers: token ? {
                        Authorization: `Bearer ${token}`,
                    } : undefined,
                }
            );
            const { url } = response.data;  
            console.log(url);
            if (url) {
                window.location.href = url; 
                return { url };
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