"use client";

import { useState, useContext } from "react";
import { Crown, Check, ArrowRight } from "lucide-react";
import { Plan, BillingCycle, ActiveSubscription } from "@/types/subscription";
import { PLANS, getPrice, getNextBillingDate } from "@/utils/subscriptionData";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { UsersContext } from "@/context/UsersContext";

interface Props {
    selectedPlan: Plan | null;
    billingCycle: BillingCycle;
    activeSubscription: ActiveSubscription | null;
    onSubscriptionSuccess: (subscription: ActiveSubscription) => void;
    onChangePlan: () => void;
}

export default function PaymentPanel({
    selectedPlan,
    billingCycle,
    activeSubscription,
    onSubscriptionSuccess,
    onChangePlan,
}: Props) {
    const { subscribeAndCheckout } = useSubscriptions();
    const { isLogged } = useContext(UsersContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubscribe() {
        if (!selectedPlan || !isLogged?.restaurant_id) return;
        setIsLoading(true);
        setError(null);
        try {
            await subscribeAndCheckout(isLogged.restaurant_id, selectedPlan.id, billingCycle);
        } catch (err: any) {
            setError(err?.response?.data?.message || "No se pudo procesar la suscripción");
        } finally {
            setIsLoading(false);
        }
    }

    // Sin plan seleccionado
    if (!selectedPlan) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex flex-col items-center text-center py-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Crown size={20} className="text-gray-300" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">Seleccioná un plan para continuar</p>
                        <p className="text-xs text-gray-400 mt-1">Elegí el plan que mejor se adapta a tu restaurante</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {PLANS.map((plan) => (
                        <button
                            key={plan.id}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors group"
                        >
                            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">{plan.name}</span>
                            <ArrowRight size={14} className="text-gray-300 group-hover:text-orange-400" />
                        </button>
                    ))}
                </div>
                <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-700">Preguntas frecuentes</p>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs font-medium text-gray-600">¿Puedo cancelar en cualquier momento?</p>
                            <p className="text-xs text-gray-400 mt-0.5">Sí, sin penalidades ni contratos de permanencia.</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">¿Qué pasa con mis datos si cancelo?</p>
                            <p className="text-xs text-gray-400 mt-0.5">Tus datos se conservan 30 días para que puedas exportarlos.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const price = getPrice(selectedPlan, billingCycle);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-5">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Crown size={16} className="text-white" />
                        <span className="text-white font-semibold text-sm">Plan {selectedPlan.name}</span>
                    </div>
                    <button
                        onClick={onChangePlan}
                        className="text-white/80 text-xs hover:text-white transition-colors underline underline-offset-2"
                    >
                        Cambiar
                    </button>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-white text-2xl font-bold">${price.toLocaleString("es-AR")}</span>
                    <span className="text-white/70 text-sm">/mes</span>
                </div>
                {billingCycle === "anual" && (
                    <p className="text-white/70 text-xs mt-0.5">
                        Ahorrás ${((selectedPlan.monthlyPrice - price) * 12).toLocaleString("es-AR")} al año
                    </p>
                )}
            </div>

            <div className="p-5 space-y-5">
                {/* Resumen */}
                <div className="space-y-2 border-b border-gray-100 pb-4">
                    {[
                        { label: "Plan", value: `Plan ${selectedPlan.name}` },
                        { label: "Ciclo de cobro", value: billingCycle === "mensual" ? "Mensual" : "Anual" },
                        { label: "Primer cobro", value: `Hoy, $${price.toLocaleString("es-AR")}` },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-xs">
                            <span className="text-gray-400">{label}</span>
                            <span className="text-gray-700 font-medium">{value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold pt-1">
                        <span className="text-gray-700">Total hoy</span>
                        <span className="text-gray-900">${price.toLocaleString("es-AR")}</span>
                    </div>
                </div>

                {/* Features incluidas */}
                <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">✓ Incluido en tu plan</p>
                    <div className="space-y-1.5">
                        {selectedPlan.features.filter((f) => f.included).slice(0, 4).map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Check size={12} className="text-teal-500 shrink-0" />
                                <span className="text-xs text-gray-500">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                {/* Botón */}
                <button
                    onClick={handleSubscribe}
                    disabled={isLoading || !isLogged?.restaurant_id}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Procesando..." : `Suscribirse · $${price.toLocaleString("es-AR")}/mes`}
                </button>

                <p className="text-center text-xs text-gray-400">
                    Cancela en cualquier momento · Sin penalidades
                </p>
            </div>
        </div>
    );
}