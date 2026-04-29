"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Crown, Check, ArrowRight } from "lucide-react";
import { Plan, BillingCycle, ActiveSubscription } from "@/types/subscription";
import { PLANS, getPrice, getNextBillingDate } from "@/utils/subscriptionData";
import PaymentForm from "@/components/subscription/PaymentForm";
import SuccessModal from "@/components/subscription/SuccessModal";

// TODO: mover a .env.local cuando el back esté listo
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<ActiveSubscription | null>(null);

  useEffect(() => {
    if (!selectedPlan) return;

    // TODO: reemplazar por llamado real al back cuando esté listo
    // Ejemplo:
    // const res = await fetch("/api/subscriptions/create-setup-intent", {
    //   method: "POST",
    //   body: JSON.stringify({ planId: selectedPlan.id, billingCycle }),
    // });
    // const { clientSecret } = await res.json();
    // setClientSecret(clientSecret);

    // MOCK: simulamos un clientSecret para desarrollo
    setClientSecret("mock_client_secret_for_development");
  }, [selectedPlan, billingCycle]);

  function handleSuccess(subscription: ActiveSubscription) {
    setSuccessData(subscription);
    onSubscriptionSuccess(subscription);
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
            <p className="text-sm font-semibold text-gray-700">
              Seleccioná un plan para continuar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Elegí el plan que mejor se adapta a tu restaurante
            </p>
          </div>
        </div>

        {/* Links rápidos a planes */}
        <div className="space-y-2">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                {plan.name}
              </span>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-orange-400" />
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-700">
            Preguntas frecuentes
          </p>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-gray-600">
                ¿Puedo cancelar en cualquier momento?
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Sí, sin penalidades ni contratos de permanencia.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">
                ¿Qué pasa con mis datos si cancelo?
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Tus datos se conservan 30 días para que puedas exportarlos.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const price = getPrice(selectedPlan, billingCycle);
  const nextBillingDate = getNextBillingDate(billingCycle);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header del panel */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-white" />
              <span className="text-white font-semibold text-sm">
                Plan {selectedPlan.name}
              </span>
            </div>
            <button
              onClick={onChangePlan}
              className="text-white/80 text-xs hover:text-white transition-colors underline underline-offset-2"
            >
              Cambiar
            </button>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white text-2xl font-bold">
              ${price.toLocaleString("es-AR")}
            </span>
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
              {
                label: "Ciclo de cobro",
                value: billingCycle === "mensual" ? "Mensual" : "Anual",
              },
              {
                label: "Primer cobro",
                value: `Hoy, $${price.toLocaleString("es-AR")}`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-700 font-medium">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-1">
              <span className="text-gray-700">Total hoy</span>
              <span className="text-gray-900">
                ${price.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Incluido en el plan */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">
              ✓ Incluido en tu plan
            </p>
            <div className="space-y-1.5">
              {selectedPlan.features
                .filter((f) => f.included)
                .slice(0, 4)
                .map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check size={12} className="text-teal-500 shrink-0" />
                    <span className="text-xs text-gray-500">{feature.text}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Stripe Payment Element */}
          {clientSecret && clientSecret !== "mock_client_secret_for_development" ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#f97316",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                  },
                },
              }}
            >
              <PaymentForm
                plan={selectedPlan}
                billingCycle={billingCycle}
                onSuccess={handleSuccess}
              />
            </Elements>
          ) : (
            // Placeholder hasta que el back provea el clientSecret real
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-700">
                  Datos de pago
                </p>
              </div>
              <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center space-y-2">
                <p className="text-xs text-gray-400 font-medium">
                  Stripe Payment Element
                </p>
                <p className="text-xs text-gray-300">
                  Se cargará cuando el back provea el clientSecret
                </p>
              </div>
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm opacity-50 cursor-not-allowed"
              >
                Suscribirse · ${price.toLocaleString("es-AR")}/mes
              </button>
              <p className="text-center text-xs text-gray-400">
                Cancela en cualquier momento · Sin penalidades
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FAQ debajo del panel */}
      <div className="mt-4 border border-gray-100 bg-white rounded-2xl p-4 space-y-3 shadow-sm">
        <p className="text-xs font-semibold text-gray-700">
          Preguntas frecuentes
        </p>
        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-gray-600">
              ¿Puedo cancelar en cualquier momento?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Sí, sin penalidades ni contratos de permanencia.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600">
              ¿Qué pasa con mis datos si cancelo?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Tus datos se conservan 30 días para que puedas exportarlos.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}