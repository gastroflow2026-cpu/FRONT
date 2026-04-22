"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Crown } from "lucide-react";
import { ActiveSubscription } from "@/types/subscription";

interface Props {
  subscription: ActiveSubscription;
}

export default function SuccessModal({ subscription }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center space-y-5">
        {/* Ícono */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Título */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            ¡Suscripción activada! 🎉
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Tu plan{" "}
            <span className="font-semibold text-gray-700">
              {subscription.planName}
            </span>{" "}
            está activo y listo para usar.
          </p>
        </div>

        {/* Detalle */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={14} className="text-orange-500" />
            <span className="text-sm font-semibold text-orange-600">
              Plan {subscription.planName}
            </span>
          </div>
          {[
            {
              label: "Precio",
              value: `$${subscription.price.toLocaleString("es-AR")}/mes`,
            },
            {
              label: "Próximo cobro",
              value: subscription.nextBillingDate,
            },
            {
              label: "Estado",
              value: "✓ Activo",
              valueClass: "text-teal-600 font-semibold",
            },
          ].map(({ label, value, valueClass }) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-gray-400">{label}</span>
              <span className={valueClass ?? "text-gray-700 font-medium"}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Botón */}
        <button
          onClick={() => router.push("/admin")}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Ir al dashboard
        </button>
      </div>
    </div>
  );
}