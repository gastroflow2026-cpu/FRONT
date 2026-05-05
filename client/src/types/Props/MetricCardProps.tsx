import { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: "orange" | "blue" | "emerald" | "violet";
  trend?: {
    value: string;
    isPositive: boolean;
  };
}