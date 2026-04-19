import { DollarSign, ShoppingCart, TrendingUp, CreditCard } from "lucide-react";

export const metrics = [
  {
    title: "Ventas Totales",
    value: "$12,345",
    icon: DollarSign,
    trend: { value: "12.5%", isPositive: true },
  },
  {
    title: "Número de Pedidos",
    value: "248",
    icon: ShoppingCart,
    trend: { value: "8.2%", isPositive: true },
  },
  {
    title: "Ingresos Diarios",
    value: "$1,850",
    icon: TrendingUp,
    trend: { value: "3.1%", isPositive: false },
  },
  {
    title: "Ticket Promedio",
    value: "$49.78",
    icon: CreditCard,
    trend: { value: "5.4%", isPositive: true },
  },
];

export const transactions = [
  {
    id: "1",
    amount: 125.5,
    date: "18/04/2026 14:32",
    method: "Tarjeta",
    status: "completada",
  },
  {
    id: "2",
    amount: 78.2,
    date: "18/04/2026 13:15",
    method: "Efectivo",
    status: "completada",
  },
  {
    id: "3",
    amount: 234.0,
    date: "18/04/2026 12:45",
    method: "Tarjeta",
    status: "pendiente",
  },
  {
    id: "4",
    amount: 156.75,
    date: "18/04/2026 11:20",
    method: "Transferencia",
    status: "completada",
  },
];
