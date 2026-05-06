"use client";
import { createContext, ReactNode, useContext } from "react";
import axios from "axios";
import { getToken } from "@/helpers/getToken";
import {
    buildHeadersWithRequestId,
    clearRequestId,
    CRITICAL_OPERATION_TIMEOUT_MS,
    extractAsyncErrorInfo,
    getOrCreateRequestId,
    logAsyncOperation,
    mapAsyncErrorToUserMessage,
} from "@/helpers/asyncOperations";

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
        const actionKey = `reservation:create:${restaurantId}:${values.table_id}:${values.start_time}`;
        const requestId = getOrCreateRequestId(actionKey);
        const endpoint = `${API_URL}/restaurants/${restaurantId}/reservations/newReservation`;
        const startedAt = performance.now();

        try {
            if (!API_URL || !restaurantId) {
                throw new Error('API URL o Restaurant ID no están configurados');
            }

            const token = getToken();
            const response = await axios.post(
                endpoint,
                values,
                {
                    headers: buildHeadersWithRequestId(token ? {
                        Authorization: `Bearer ${token}`,
                    } : undefined, requestId),
                    timeout: CRITICAL_OPERATION_TIMEOUT_MS,
                }
            );
            logAsyncOperation({
                requestId,
                endpoint,
                durationMs: performance.now() - startedAt,
                ok: true,
            });

            const { url } = response.data;  
            clearRequestId(actionKey);
            if (url) return { url };
            return response.data;
        } catch (error: unknown) {
            logAsyncOperation({
                requestId,
                endpoint,
                durationMs: performance.now() - startedAt,
                ok: false,
            });

            const info = extractAsyncErrorInfo(error);
            throw new Error(
                mapAsyncErrorToUserMessage(
                    info,
                    "No se pudo crear la reserva para la mesa y horario seleccionados.",
                ),
            );
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