import { CheckCircle } from "lucide-react";
import { ActiveSubscription } from "@/types/subscription";

interface Props {
  subscription: ActiveSubscription;
}

export default function ActiveSubscriptionBanner({ subscription }: Props) {
  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} />
          <div>
            <p className="font-semibold text-sm">Suscripción activa</p>
            <p className="text-teal-100 text-xs">
              {subscription.planName} · Próximo cobro:{" "}
              {subscription.nextBillingDate}
            </p>
          </div>
        </div>
        <button className="border border-white/40 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
          Administrar plan
        </button>
      </div>
    </div>
  );
}