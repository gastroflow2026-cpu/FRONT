"use client";
import { createContext, ReactNode } from "react";
import axios from "axios";

interface ReservationsPaymentContextType {
    stripeCheckout: (reservationId: string) => Promise<void>;
}

export const ReservationsPaymentContext = createContext<ReservationsPaymentContextType>({
    stripeCheckout: async () => {},
});

const ReservationsPaymentProvider = ({ children }: { children: ReactNode }) => {

    const stripeCheckout = async (reservationId: string) => {
        const res = await axios.post("http://localhost:3000/reservations-payment/:reservationId/checkout");
        window.location.href = res.data.url
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