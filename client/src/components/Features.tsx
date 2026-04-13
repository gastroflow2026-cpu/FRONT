import React from 'react';
import { Utensils, Calendar, Star, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: "Reservas al Instante",
    description: "Olvídate de las esperas telefónicas. Reserva tu mesa en segundos desde cualquier dispositivo."
  },
  {
    icon: Utensils,
    title: "Menús Digitales",
    description: "Explora la carta actualizada de cada restaurante con fotos reales y precios al día."
  },
  {
    icon: Star,
    title: "Experiencias Reales",
    description: "Lee opiniones de otros comensales y comparte la tuya para ayudar a la comunidad."
  },
  {
    icon: ShieldCheck,
    title: "Gestión Segura",
    description: "Tus datos y reservas están protegidos. Recibe recordatorios para que nunca pierdas una mesa."
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Llevamos tu experiencia al siguiente nivel
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Descubre por qué miles de personas eligen GastroFlow para planificar sus salidas gastronómicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group rounded-2xl border border-white/10 bg-gray-50 p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:bg-white hover:shadow-[0_28px_70px_rgba(0,0,0,0.18)]"
            >
              <div className="mb-4 inline-block rounded-xl bg-orange-50 p-3 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
               
                <feature.icon className="w-8 h-8 text-orange-500 transition-colors duration-300 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;