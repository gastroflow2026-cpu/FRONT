export type BillingCycle = "mensual" | "anual";

export type PlanId = "basico" | "premium";

export interface PlanFeature {
  text: string;
  included: boolean;
  highlighted?: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature[];
  popular?: boolean;
}

export interface SubscriptionSummary {
  plan: Plan;
  billingCycle: BillingCycle;
  price: number;
  nextBillingDate: string;
}

export interface ActiveSubscription {
  planId: PlanId;
  planName: string;
  billingCycle: BillingCycle;
  price: number;
  nextBillingDate: string;
  status: "activa" | "cancelada" | "vencida";
}