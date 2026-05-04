import { Plan } from "@/types/subscription";

export const PLANS: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    description: "Ideal para comenzar a digitalizar tu local.",
    monthlyPrice: 50,
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
  },
  {
    id: "premium",
    name: "Premium",
    description: "Control total y analíticas avanzadas para tu negocio.",
    monthlyPrice: 80,
    popular: true,
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
  },
];

export function getAnnualTotal(plan: Plan): number {
  return plan.monthlyPrice * 10;
}

export function getAnnualMonthlyPrice(plan: Plan): number {
  return Math.round(getAnnualTotal(plan) / 12);
}

export function getPrice(plan: Plan, cycle: "mensual" | "anual"): number {
  return cycle === "mensual" ? plan.monthlyPrice : getAnnualTotal(plan);
}

export function getNextBillingDate(cycle: "mensual" | "anual"): string {
  const date = new Date();
  if (cycle === "mensual") {
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}