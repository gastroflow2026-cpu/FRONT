"use client";
import { createContext, ReactNode } from "react";
import axios from "axios";
import { getToken } from "@/helpers/getToken";
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

interface ReservationsPaymentContextType {
    stripeCheckout: (reservationId: string) => Promise<void>;
}

export const ReservationsPaymentContext = createContext<ReservationsPaymentContextType>({
    stripeCheckout: async () => {},
});

const ReservationsPaymentProvider = ({ children }: { children: ReactNode }) => {

    const stripeCheckout = async (reservationId: string) => {
        const token = getToken();
       const res = await axios.post(
        `${API_URL}/reservations-payment/${reservationId}/checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Stripe response:', res.data);
        if (!res.data.url) {
            console.error('No URL recibida'); 
            return;
        }
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