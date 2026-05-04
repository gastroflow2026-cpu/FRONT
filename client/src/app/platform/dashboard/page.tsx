"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Building2, Clock3, Eye, Home, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { clearSession, getToken } from "@/helpers/getToken";
import { isPlatformSessionUser } from "@/helpers/platformSession";

type RestaurantVerificationStatus = "pending" | "approved" | "rejected" | "suspended";
type StatusFilter = "all" | RestaurantVerificationStatus;
type DashboardTab = "restaurants" | "subscriptions" | "revenue";

interface PlatformRestaurant {
  id: string;
  name: string;
  slug?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  is_active: boolean;
  verification_status: RestaurantVerificationStatus;
  created_at: string;
}

interface ActiveSubscription {
  id: string;
  restaurant: {
    id?: string;
    name?: string;
    slug?: string | null;
    email?: string | null;
  };
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string;
  next_payment_date: string | null;
  auto_renew: boolean;
  days_remaining: number;
}

interface RevenueMoneyMetric {
  currency: string;
  total: number;
  payments_count: number;
}

interface PaymentStatusCount {
  status: string;
  total: number;
}

interface SubscriptionRevenueMetrics {
  generated_at: string;
  total_revenue: RevenueMoneyMetric[];
  current_month_revenue: RevenueMoneyMetric[];
  payment_status_counts: PaymentStatusCount[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const normalizeBaseUrl = (url?: string | null) => {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "");
};

const buildApiUrl = (path: string) => {
  const base = normalizeBaseUrl(API_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!base) {
    throw new Error("API_URL_NOT_CONFIGURED");
  }

  return `${base}${normalizedPath}`;
};

const DASHBOARD_TABS: { label: string; value: DashboardTab; description: string }[] = [
  {
    label: "Revisión de restaurantes",
    value: "restaurants",
    description: "Altas, validaciones y estados de restaurantes.",
  },
  {
    label: "Suscripciones activas",
    value: "subscriptions",
    description: "Planes vigentes y tiempo restante.",
  },
  {
    label: "Métricas de ingresos",
    value: "revenue",
    description: "Ingresos por suscripciones del SaaS.",
  },
];

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Aprobados", value: "approved" },
  { label: "Rechazados", value: "rejected" },
  { label: "Suspendidos", value: "suspended" },
];

const getStatusLabel = (status: RestaurantVerificationStatus) => {
  const labels: Record<RestaurantVerificationStatus, string> = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
    suspended: "Suspendido",
  };

  return labels[status];
};

const getStatusClassName = (status: RestaurantVerificationStatus) => {
  const classes: Record<RestaurantVerificationStatus, string> = {
    pending: "bg-orange-500/15 text-orange-300",
    approved: "bg-green-500/15 text-green-300",
    rejected: "bg-red-500/15 text-red-300",
    suspended: "bg-gray-500/20 text-gray-300",
  };

  return classes[status];
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

const formatMoneyMetrics = (metrics: RevenueMoneyMetric[]) => {
  if (metrics.length === 0) return "$0.00";

  return metrics
    .map((metric) => formatCurrency(metric.total, metric.currency))
    .join(" / ");
};

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: "Completado",
    pending: "Pendiente",
    failed: "Fallido",
    refunded: "Reembolsado",
  };

  return labels[status] ?? status;
};

const getSubscriptionTimeLabel = (daysRemaining: number) => {
  if (daysRemaining === 0) return "Vence hoy";
  if (daysRemaining <= 7) return `Por vencer: ${daysRemaining} días`;
  return `${daysRemaining} días`;
};

const getSubscriptionTimeClassName = (daysRemaining: number) => {
  if (daysRemaining === 0) {
    return "bg-red-500/15 text-red-300";
  }

  if (daysRemaining <= 7) {
    return "bg-yellow-500/15 text-yellow-300";
  }

  return "bg-green-500/15 text-green-300";
};

export default function PlatformDashboardPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<PlatformRestaurant[]>([]);
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>("restaurants");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [subscriptionsErrorMessage, setSubscriptionsErrorMessage] = useState<string | null>(null);

  const [revenueMetrics, setRevenueMetrics] = useState<SubscriptionRevenueMetrics | null>(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [revenueErrorMessage, setRevenueErrorMessage] = useState<string | null>(null);

  const expiringSubscriptionsCount = activeSubscriptions.filter(
    (subscription) => subscription.days_remaining <= 7,
  ).length;

  const autoRenewSubscriptionsCount = activeSubscriptions.filter(
    (subscription) => subscription.auto_renew,
  ).length;

  const fetchRestaurants = useCallback(
    async (status: StatusFilter = selectedStatus) => {
      const token = getToken();

      if (!token || !isPlatformSessionUser()) {
        clearSession();
        router.push("/platform/login");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const endpoint = status === "all" ? "/platform/restaurants" : `/platform/restaurants?status=${status}`;

        const response = await axios.get<PlatformRestaurant[]>(buildApiUrl(endpoint), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRestaurants(response.data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          clearSession();
          router.push("/platform/login");
          return;
        }

        setErrorMessage("No fue posible cargar los restaurantes.");
      } finally {
        setIsLoading(false);
      }
    },
    [router, selectedStatus],
  );

  const fetchActiveSubscriptions = useCallback(async () => {
    const token = getToken();

    if (!token || !isPlatformSessionUser()) {
      clearSession();
      router.push("/platform/login");
      return;
    }

    try {
      setIsLoadingSubscriptions(true);
      setSubscriptionsErrorMessage(null);

      const response = await axios.get<ActiveSubscription[]>(
        buildApiUrl("/platform/subscriptions/active"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setActiveSubscriptions(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        clearSession();
        router.push("/platform/login");
        return;
      }

      setSubscriptionsErrorMessage("No fue posible cargar las suscripciones activas.");
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, [router]);

  const fetchRevenueMetrics = useCallback(async () => {
    const token = getToken();

    if (!token || !isPlatformSessionUser()) {
      clearSession();
      router.push("/platform/login");
      return;
    }

    try {
      setIsLoadingRevenue(true);
      setRevenueErrorMessage(null);

      const response = await axios.get<SubscriptionRevenueMetrics>(
        buildApiUrl("/platform/revenue/subscriptions"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRevenueMetrics(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        clearSession();
        router.push("/platform/login");
        return;
      }

      setRevenueErrorMessage("No fue posible cargar las métricas de ingresos.");
    } finally {
      setIsLoadingRevenue(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRestaurants(selectedStatus);
  }, [selectedStatus, fetchRestaurants]);

  useEffect(() => {
    if (activeDashboardTab === "subscriptions") {
      fetchActiveSubscriptions();
    }
  }, [activeDashboardTab, fetchActiveSubscriptions]);

  useEffect(() => {
    if (activeDashboardTab === "revenue") {
      fetchRevenueMetrics();
    }
  }, [activeDashboardTab, fetchRevenueMetrics]);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-gray-900/80 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
                GastroFlow Platform
              </p>
              <h1 className="text-xl font-bold">Panel de plataforma</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10"
            >
              <Home className="h-4 w-4" />
              Inicio
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
            Panel interno de colaboradores
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            Gestión general de la plataforma GastroFlow
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65">
            Este espacio es para revisar altas de restaurantes, dar seguimiento a suscripciones activas y consultar
            ingresos propios de la plataforma. Los pagos de comensales por reservas pertenecen al dashboard de cada
            restaurante y no se mezclan con estas métricas.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-3 px-6 pb-6 md:grid-cols-3">
        {DASHBOARD_TABS.map((tab) => {
          const isActive = activeDashboardTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveDashboardTab(tab.value)}
              className={`rounded-2xl border p-5 text-left transition ${
                isActive
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <p className="text-base font-bold">{tab.label}</p>
              <p className={`mt-2 text-sm ${isActive ? "text-white/80" : "text-white/45"}`}>
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>

      <div
        className={`mx-auto max-w-7xl flex-wrap justify-center gap-3 px-6 pb-6 ${
          activeDashboardTab === "restaurants" ? "flex" : "hidden"
        }`}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeDashboardTab === "restaurants" && (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold">Restaurantes registrados</h2>
              <p className="mt-2 text-sm text-white/50">
                Consulta, revisa y administra el estado de los restaurantes en la plataforma.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchRestaurants(selectedStatus)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-950 transition hover:bg-orange-100"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Clock3 className="mb-3 h-6 w-6 text-orange-300" />
              <p className="text-sm text-white/50">
                {selectedStatus === "all" ? "Total mostrado" : "Resultado del filtro"}
              </p>
              <p className="mt-1 text-3xl font-bold">{restaurants.length}</p>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Cargando restaurantes...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && restaurants.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <Building2 className="mx-auto mb-4 h-10 w-10 text-white/40" />
              <h3 className="text-xl font-bold">No hay restaurantes para mostrar</h3>
              <p className="mt-2 text-sm text-white/50">
                Cambia el filtro o espera a que se registren nuevos restaurantes.
              </p>
            </div>
          )}

          {!isLoading && !errorMessage && restaurants.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-white/10 text-white/70">
                  <tr>
                    <th className="px-5 py-4">Restaurante</th>
                    <th className="px-5 py-4">Contacto</th>
                    <th className="px-5 py-4">Ubicación</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="border-t border-white/10">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">{restaurant.name}</p>
                        <p className="text-xs text-white/40">{restaurant.slug || "Sin slug"}</p>
                      </td>

                      <td className="px-5 py-4 text-white/70">
                        <p>{restaurant.email || "Sin email"}</p>
                        <p className="text-xs text-white/40">{restaurant.phone || "Sin teléfono"}</p>
                      </td>

                      <td className="px-5 py-4 text-white/70">
                        {[restaurant.city, restaurant.country].filter(Boolean).join(", ") || "Sin ubicación"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(
                            restaurant.verification_status,
                          )}`}
                        >
                          {getStatusLabel(restaurant.verification_status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/platform/restaurants/${restaurant.id}`)}
                          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                        >
                          <Eye className="h-4 w-4" />
                          Revisar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeDashboardTab === "subscriptions" && (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-bold">Suscripciones activas</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
                  Restaurantes con plan activo, fecha de finalización y días restantes.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchActiveSubscriptions}
                className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-950 transition hover:bg-orange-100"
              >
                Actualizar
              </button>
            </div>

            {isLoadingSubscriptions && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                Cargando suscripciones activas...
              </div>
            )}

            {!isLoadingSubscriptions && subscriptionsErrorMessage && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
                {subscriptionsErrorMessage}
              </div>
            )}

            {!isLoadingSubscriptions && !subscriptionsErrorMessage && activeSubscriptions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/45">
                No hay suscripciones activas registradas.
              </div>
            )}

            {!isLoadingSubscriptions && !subscriptionsErrorMessage && activeSubscriptions.length > 0 && (
              <>
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/50">Suscripciones activas</p>
                    <p className="mt-2 text-3xl font-bold">{activeSubscriptions.length}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/50">Por vencer</p>
                    <p className="mt-2 text-3xl font-bold">{expiringSubscriptionsCount}</p>
                    <p className="mt-2 text-xs text-white/40">7 días o menos</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/50">Auto renovación</p>
                    <p className="mt-2 text-3xl font-bold">{autoRenewSubscriptionsCount}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-white/10 text-white/70">
                      <tr>
                        <th className="px-5 py-4">Restaurante</th>
                        <th className="px-5 py-4">Plan</th>
                        <th className="px-5 py-4">Inicio</th>
                        <th className="px-5 py-4">Finaliza</th>
                        <th className="px-5 py-4">Días restantes</th>
                        <th className="px-5 py-4">Auto renovación</th>
                      </tr>
                    </thead>

                    <tbody>
                      {activeSubscriptions.map((subscription) => (
                        <tr key={subscription.id} className="border-t border-white/10">
                          <td className="px-5 py-4">
                            <p className="font-bold text-white">
                              {subscription.restaurant?.name || "Restaurante sin nombre"}
                            </p>
                            <p className="text-xs text-white/40">
                              {subscription.restaurant?.email || "Sin email"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-white/70">{subscription.plan_type}</td>

                          <td className="px-5 py-4 text-white/70">
                            {new Date(subscription.start_date).toLocaleDateString("es-MX")}
                          </td>

                          <td className="px-5 py-4 text-white/70">
                            {new Date(subscription.end_date).toLocaleDateString("es-MX")}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${getSubscriptionTimeClassName(
                                subscription.days_remaining,
                              )}`}
                            >
                              {getSubscriptionTimeLabel(subscription.days_remaining)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-white/70">
                            {subscription.auto_renew ? "Sí" : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {activeDashboardTab === "revenue" && (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-bold">Métricas de ingresos</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
                  Ingresos propios de la plataforma por suscripciones de restaurantes. No incluye pagos de comensales
                  por reservas.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchRevenueMetrics}
                className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-950 transition hover:bg-orange-100"
              >
                Actualizar
              </button>
            </div>

            {isLoadingRevenue && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                Cargando métricas de ingresos...
              </div>
            )}

            {!isLoadingRevenue && revenueErrorMessage && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
                {revenueErrorMessage}
              </div>
            )}

            {!isLoadingRevenue && !revenueErrorMessage && revenueMetrics && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/50">Ingresos totales</p>
                    <p className="mt-2 text-3xl font-bold">
                      {formatMoneyMetrics(revenueMetrics.total_revenue)}
                    </p>
                    <p className="mt-2 text-xs text-white/40">Pagos completados acumulados</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/50">Ingresos del mes</p>
                    <p className="mt-2 text-3xl font-bold">
                      {formatMoneyMetrics(revenueMetrics.current_month_revenue)}
                    </p>
                    <p className="mt-2 text-xs text-white/40">Pagos completados desde inicio de mes</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/50">Última actualización</p>
                    <p className="mt-2 text-xl font-bold">
                      {new Date(revenueMetrics.generated_at).toLocaleString("es-MX")}
                    </p>
                    <p className="mt-2 text-xs text-white/40">Datos calculados desde pagos de suscripción</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-white/10 text-white/70">
                      <tr>
                        <th className="px-5 py-4">Estado del pago</th>
                        <th className="px-5 py-4">Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {revenueMetrics.payment_status_counts.map((statusCount) => (
                        <tr key={statusCount.status} className="border-t border-white/10">
                          <td className="px-5 py-4 font-bold text-white">
                            {getPaymentStatusLabel(statusCount.status)}
                          </td>
                          <td className="px-5 py-4 text-white/70">{statusCount.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {!isLoadingRevenue && !revenueErrorMessage && !revenueMetrics && (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/45">
                No hay métricas disponibles.
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}