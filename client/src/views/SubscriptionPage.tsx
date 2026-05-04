"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Plan, BillingCycle, ActiveSubscription } from "@/types/subscription";
import PlanSelector from "@/components/subscription/PlanSelector";
import PaymentPanel from "@/components/subscription/PaymentPanel";
import ActiveSubscriptionBanner from "@/components/subscription/ActiveSubscriptionBanner";

// MOCK - reemplazar por datos reales del back cuando estén listos
// Ejemplo: const { data: activeSubscription } = useFetch('/api/subscriptions/current')
const MOCK_ACTIVE_SUBSCRIPTION: ActiveSubscription | null = null;

export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("mensual");
  const [activeSubscription, setActiveSubscription] =
    useState<ActiveSubscription | null>(MOCK_ACTIVE_SUBSCRIPTION);

  function handleSubscriptionSuccess(subscription: ActiveSubscription) {
    setActiveSubscription(subscription);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner suscripción activa */}
      {activeSubscription && (
        <ActiveSubscriptionBanner subscription={activeSubscription} />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al Home
        </button>
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Planes y suscripciones
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Elige el plan perfecto
            <br />
            para tu restaurante
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Sin compromisos. Cancela cuando quieras. Todos los planes incluyen
            acceso completo a la pasarela de pagos integrada con Stripe.
          </p>
        </div>

        {/* Toggle mensual/anual */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setBillingCycle("mensual")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === "mensual"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle("anual")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === "anual"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Anual
          </button>
          {billingCycle === "anual" && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              Ahorrás 2 meses
            </span>
          )}
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <PlanSelector
              billingCycle={billingCycle}
              selectedPlan={selectedPlan}
              activeSubscription={activeSubscription}
              onSelectPlan={setSelectedPlan}
            />
          </div>
          <div className="col-span-1">
            <PaymentPanel
              selectedPlan={selectedPlan}
              billingCycle={billingCycle}
              activeSubscription={activeSubscription}
              onSubscriptionSuccess={handleSubscriptionSuccess}
              onChangePlan={() => setSelectedPlan(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}