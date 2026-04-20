import { Check, X } from 'lucide-react';
import { useState } from 'react';

const PricingTable = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Básico",
      monthlyPrice: 50,
      annualPrice: 500,
      description: "Ideal para comenzar a digitalizar tu local.",
      features: [
        { text: "Reservas Online", included: true },
        { text: "Menú digital (1 foto por plato)", included: true },
        { text: "Gestión de Órdenes/comandas", included: true },
        { text: "Métricas de Facturación Total", included: true },
        { text: "Hasta 5 usuarios", included: true },
        { text: "Reseñas de clientes", included: true },
        { text: "Reserva de mesa por diagrama", included: false },
        { text: "Métricas avanzadas (tiempos/Excel)", included: false },
      ],
      cta: "Elegir Plan Básico",
      featured: false
    },
    {
      name: "Premium",
      monthlyPrice: 80,
      annualPrice: 800,
      description: "Control total y analíticas avanzadas para tu negocio.",
      features: [
        { text: "Todo lo del plan Básico", included: true },
        { text: "Reserva de mesa por diagrama (Admin)", included: true },
        { text: "Reservas con seña de pago", included: true },
        { text: "Métricas avanzadas (Cocina/Pagos)", included: true },
        { text: "Descarga de métricas en Excel", included: true },
        { text: "Usuarios ilimitados", included: true },
        { text: "3 fotos por platillo", included: true },
        { text: "Recordatorios multi-canal", included: true },
      ],
      cta: "Elegir Plan Premium",
      featured: true
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900">Planes diseñados para tu crecimiento</h2>
          
          {/* Switch de Facturación */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Mensual</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-slate-200 rounded-full transition-colors focus:outline-none"
            >
              <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform bg-linear-to-r from-orange-500 to-pink-500 ${isAnnual ? 'translate-x-7' : ''}`}></div>
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
              Anual <span className="text-green-600 font-bold ml-1">(Ahorra hasta 2 meses)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-3xl bg-white ${plan.featured ? 'p-0.5 bg-linear-to-r from-orange-500 to-pink-500 shadow-xl relative scale-105' : 'p-0 border border-slate-200'}`}>
              <div className={`rounded-3xl p-8 h-full w-full bg-white ${plan.featured ? 'relative' : ''}`}>
              {plan.featured && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  MÁS POPULAR
                </span>
              )}
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">
                  ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className="text-slate-500 font-medium text-sm">
                  /{isAnnual ? 'año' : 'mes'}
                </span>
              </div>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">{plan.description}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {feature.included ? (
                      <Check className="text-green-500 shrink-0" size={18} />
                    ) : (
                      <X className="text-slate-300 shrink-0" size={18} />
                    )}
                    <span className={feature.included ? "text-slate-700" : "text-slate-400"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* <button className={`w-full py-4 rounded-xl font-bold transition-all shadow-md active:scale-95 ${plan.featured ? 'bg-linear-to-r from-orange-500 to-pink-500 text-white hover:opacity-90' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                {plan.cta}
              </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingTable;