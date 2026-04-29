import { Check, X, Star } from "lucide-react";
import { Plan, BillingCycle, ActiveSubscription } from "@/types/subscription";
import { PLANS, getPrice } from "@/utils/subscriptionData";

interface Props {
  billingCycle: BillingCycle;
  selectedPlan: Plan | null;
  activeSubscription: ActiveSubscription | null;
  onSelectPlan: (plan: Plan) => void;
}

const COMPARISON_ROWS = [
  { label: "Terminales de venta", basico: "Hasta 2", premium: "Ilimitadas", premiumHighlight: true },
  { label: "Reservas por mes", basico: "50", premium: "Ilimitadas", premiumHighlight: true },
  { label: "Comisión por pago", basico: "2.5%", premium: "1.5%", premiumHighlight: true },
  { label: "Soporte", basico: "Email (48hs)", premium: "24/7 prioritario", premiumHighlight: true },
  { label: "Analytics", basico: "Básico", premium: "Avanzado", premiumHighlight: true },
  { label: "API & integraciones", basico: "—", premium: "Incluido", premiumHighlight: true },
];

export default function PlanSelector({
  billingCycle,
  selectedPlan,
  activeSubscription,
  onSelectPlan,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Cards de planes */}
      <div className="grid grid-cols-2 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          const isActive = activeSubscription?.planId === plan.id;
          const price = getPrice(plan, billingCycle);

          return (
            <div key={plan.id} className="relative">
              {/* Badge más popular */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <Star size={10} fill="white" />
                    MÁS POPULAR
                  </div>
                </div>
              )}

              <div
                className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all h-full ${
                  isSelected
                    ? "border-orange-500 shadow-md shadow-orange-100"
                    : plan.popular
                    ? "border-orange-200 hover:border-orange-400"
                    : "border-gray-200 hover:border-gray-300"
                } ${plan.popular ? "pt-7" : ""}`}
                onClick={() => onSelectPlan(plan)}
              >
                {/* Check de seleccionado */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Header */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-xs">{plan.description}</p>
                </div>

                {/* Precio */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      ${price}
                    </span>
                    <span className="text-gray-400 text-sm">/mes</span>
                  </div>
                  {billingCycle === "anual" && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Facturación anual · ${price * 12}/año
                    </p>
                  )}
                  {billingCycle === "mensual" && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Facturación mensual · sin contrato
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-5">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check
                          size={14}
                          className={`mt-0.5 shrink-0 ${
                            plan.popular
                              ? "text-orange-500"
                              : "text-teal-500"
                          }`}
                          strokeWidth={2.5}
                        />
                      ) : (
                        <X
                          size={14}
                          className="mt-0.5 shrink-0 text-gray-300"
                          strokeWidth={2.5}
                        />
                      )}
                      <span
                        className={`text-xs ${
                          feature.included
                            ? plan.popular
                              ? "text-gray-700"
                              : "text-gray-600"
                            : "text-gray-300 line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Botón */}
                {isSelected ? (
                  <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold text-center">
                    ✓ Plan seleccionado
                  </div>
                ) : isActive ? (
                  <div className="w-full py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 text-sm font-semibold text-center">
                    ✓ Plan actual
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                      plan.popular
                        ? "border-orange-300 text-orange-500 hover:bg-orange-50"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Comenzar con {plan.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla comparativa */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="font-semibold text-gray-800 text-sm">
            Comparación de características
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-100">
              <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">
                Característica
              </th>
              <th className="text-center px-4 py-3 text-gray-700 font-semibold text-xs">
                Básico
              </th>
              <th className="text-center px-4 py-3 font-semibold text-xs bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                key={i}
                className={`border-t border-gray-50 ${
                  i % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                }`}
              >
                <td className="px-5 py-3 text-gray-600 text-xs">{row.label}</td>
                <td className="px-4 py-3 text-center text-gray-500 text-xs">
                  {row.basico}
                </td>
                <td className="px-4 py-3 text-center text-xs font-semibold text-orange-500">
                  {row.premium}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Social proof */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-center text-xs text-gray-400 font-semibold tracking-wider mb-4">
          MÁS DE 500 RESTAURANTES CONFÍAN EN NOSOTROS
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            "El Portal Grill",
            "Sushi Nakamura",
            "Trattoria Roma",
            "El Rancho",
            "Café Central",
            "La Brasa",
          ].map((name) => (
            <span key={name} className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-gray-200 inline-block" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}