"use client";
import { createContext, ReactNode } from "react";
import axios from "axios";
import { getToken } from "@/helpers/getToken";
import {
    buildHeadersWithRequestId,
    clearRequestId,
    CRITICAL_OPERATION_TIMEOUT_MS,
    getOrCreateRequestId,
    logAsyncOperation,
} from "@/helpers/asyncOperations";
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

interface ReservationsPaymentContextType {
    stripeCheckout: (reservationId: string) => Promise<void>;
}

export const ReservationsPaymentContext = createContext<ReservationsPaymentContextType>({
    stripeCheckout: async () => {},
});

const ReservationsPaymentProvider = ({ children }: { children: ReactNode }) => {

    const stripeCheckout = async (reservationId: string) => {
        const actionKey = `reservation:checkout:${reservationId}`;
        const requestId = getOrCreateRequestId(actionKey);
        const endpoint = `${API_URL}/reservations-payment/${reservationId}/checkout`;
        const startedAt = performance.now();
        const token = getToken();
       const res = await axios.post(
        endpoint,
        {},
        {
            headers: buildHeadersWithRequestId(
                token ? { Authorization: `Bearer ${token}` } : undefined,
                requestId,
            ),
            timeout: CRITICAL_OPERATION_TIMEOUT_MS,
        }
        );

        logAsyncOperation({
            requestId,
            endpoint,
            durationMs: performance.now() - startedAt,
            ok: true,
        });
        clearRequestId(actionKey);

        if (!res.data.url) {
            throw new Error("Estamos verificando el estado de tu operación. Intenta de nuevo en unos segundos.");
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