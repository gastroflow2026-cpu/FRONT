"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShieldCheck } from "lucide-react";
import { Plan, BillingCycle, ActiveSubscription } from "@/types/subscription";
import { getPrice, getNextBillingDate } from "@/utils/subscriptionData";

interface Props {
  plan: Plan;
  billingCycle: BillingCycle;
  onSuccess: (subscription: ActiveSubscription) => void;
}

export default function PaymentForm({ plan, billingCycle, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const price = getPrice(plan, billingCycle);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message ?? "Ocurrió un error al procesar el pago.");
        return;
      }

      // TODO: cuando el back esté listo, reemplazar por llamado real
      // Ejemplo:
      // const res = await fetch("/api/subscriptions/confirm", {
      //   method: "POST",
      //   body: JSON.stringify({ planId: plan.id, billingCycle }),
      // });
      // const data = await res.json();

      onSuccess({
        planId: plan.id,
        planName: plan.name,
        billingCycle,
        price,
        nextBillingDate: getNextBillingDate(billingCycle),
        status: "activa",
      });
    } catch {
      setErrorMessage("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-700">Datos de pago</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <ShieldCheck size={12} className="text-gray-400" />
          Cifrado SSL
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="border border-gray-200 rounded-xl p-3">
        <PaymentElement
          options={{
            layout: "tabs",
            fields: {
              billingDetails: {
                name: "auto",
              },
            },
          }}
        />
      </div>

      {/* Error */}
      {errorMessage && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {errorMessage}
        </p>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? "Procesando..."
          : `Suscribirse · $${price.toLocaleString("es-AR")}/mes`}
      </button>

      <p className="text-center text-xs text-gray-400">
        Cancela en cualquier momento · Sin penalidades
      </p>
    </form>
  );
}