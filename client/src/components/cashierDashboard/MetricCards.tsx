import { ShoppingBag, UtensilsCrossed, CalendarDays } from "lucide-react";
import { CashierMetrics } from "@/types/cashier";

interface MetricCardsProps {
  metrics: CashierMetrics;
}

function MetricCard({
  icon,
  iconBg,
  badgeValue,
  badgeColor,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  badgeValue: string | number;
  badgeColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between flex-1">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <span className={`text-lg font-bold rounded-lg px-2 py-0.5 ${badgeColor}`}>
        {badgeValue}
      </span>
    </div>
  );
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="flex gap-4 mb-6">
      <MetricCard
        icon={<ShoppingBag size={20} className="text-blue-500" />}
        iconBg="bg-blue-50"
        badgeValue={metrics.activeOrders}
        badgeColor="bg-blue-500 text-white"
        title="Órdenes activas"
        subtitle={`${metrics.ordersInPreparation} en preparación`}
      />
      <MetricCard
        icon={<UtensilsCrossed size={20} className="text-red-400" />}
        iconBg="bg-red-50"
        badgeValue={`${metrics.occupiedTables}/${metrics.totalTables}`}
        badgeColor="bg-red-400 text-white"
        title="Mesas ocupadas"
        subtitle={`${metrics.reservedTables} reservadas`}
      />
      <MetricCard
        icon={<CalendarDays size={20} className="text-orange-400" />}
        iconBg="bg-orange-50"
        badgeValue={metrics.reservationsToday}
        badgeColor="bg-orange-400 text-white"
        title="Reservas hoy"
        subtitle={`${metrics.reservationsToday} señadas`}
      />
    </div>
  );
}