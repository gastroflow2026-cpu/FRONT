"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Building2, Clock3, Eye, Home, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { clearSession, getToken } from "@/helpers/getToken";
import { isPlatformSessionUser } from "@/helpers/platformSession";

type RestaurantVerificationStatus = "pending" | "approved" | "rejected" | "suspended";
type StatusFilter = "all" | RestaurantVerificationStatus;

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

export default function PlatformDashboardPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<PlatformRestaurant[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRestaurants = async (status: StatusFilter = selectedStatus) => {
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
  };

  useEffect(() => {
    fetchRestaurants(selectedStatus);
  }, [selectedStatus]);

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
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">GastroFlow Platform</p>
              <h1 className="text-xl font-bold">Revisión de restaurantes</h1>
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

      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-6 py-6">
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
            Cargando restaurantes pendientes...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">{errorMessage}</div>
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
    </main>
  );
}
