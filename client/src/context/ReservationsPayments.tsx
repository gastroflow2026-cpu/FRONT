"use client";
import { createContext, ReactNode } from "react";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

interface ReservationsPaymentContextType {
    stripeCheckout: (reservationId: string) => Promise<void>;
}

export const ReservationsPaymentContext = createContext<ReservationsPaymentContextType>({
    stripeCheckout: async () => {},
});

const ReservationsPaymentProvider = ({ children }: { children: ReactNode }) => {

    const stripeCheckout = async (reservationId: string) => {
        const res = await axios.post(`${API_URL}/reservations-payment/${reservationId}/checkout`);
        window.location.href = res.data.url;
    };

    const value: ReservationsPaymentContextType = {
        stripeCheckout,
    };

    return (
        <ReservationsPaymentContext.Provider value={value}>
            {children}
        </ReservationsPaymentContext.Provider>
    );
};

export default ReservationsPaymentProvider;