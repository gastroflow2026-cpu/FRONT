"use client";
import { createContext, useContext, ReactNode } from "react";
import axios from "axios";
import { getToken } from "@/helpers/getToken";
import { BillingCycle, PlanId } from "@/types/subscription";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

const PLAN_TYPE_MAP: Record<PlanId, string> = {
    basico: "BASIC",
    premium: "PREMIUM",
};

interface SubscriptionsContextType {
    subscribeAndCheckout: (restaurantId: string, planId: PlanId, billingCycle: BillingCycle) => Promise<void>;
}

export const SubscriptionsContext = createContext<SubscriptionsContextType>({
    subscribeAndCheckout: async () => {},
});

const SubscriptionsProvider = ({ children }: { children: ReactNode }) => {

    const subscribeAndCheckout = async (
        restaurantId: string,
        planId: PlanId,
        billingCycle: BillingCycle
    ) => {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const interval = billingCycle === "mensual" ? "monthly" : "yearly";
        const plan_type = PLAN_TYPE_MAP[planId];

        // 1. Crear la suscripción
        const now = new Date();
        const endDate = new Date(now);
        interval === "yearly"
            ? endDate.setFullYear(endDate.getFullYear() + 1)
            : endDate.setMonth(endDate.getMonth() + 1);

        const { data: subscription } = await axios.post(
            `${API_URL}/subscriptions`,
            {
                restaurant_id: restaurantId,
                plan_type,
                start_date: now.toISOString(),
                end_date: endDate.toISOString(),
            },
            { headers }
        );

        console.log("Suscripción creada:", subscription);

        // 2. Llamar al checkout
        const { data } = await axios.post(
            `${API_URL}/subscriptions-payment/${subscription.id}/checkout`,
            { interval },
            { headers }
        );

        console.log("Checkout:", data);

        // 3. Redirigir a Stripe
        if (data?.url) {
            window.location.href = data.url;
        }
    };

    return (
        <SubscriptionsContext.Provider value={{ subscribeAndCheckout }}>
            {children}
        </SubscriptionsContext.Provider>
    );
};

export const useSubscriptions = () => useContext(SubscriptionsContext);
export default SubscriptionsProvider;