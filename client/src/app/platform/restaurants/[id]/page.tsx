"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Ban,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { clearSession, getToken } from "@/helpers/getToken";
import { isPlatformSessionUser } from "@/helpers/platformSession";

type RestaurantVerificationStatus = "pending" | "approved" | "rejected" | "suspended";

interface PlatformRestaurant {
  id: string;
  name: string;
  slug?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  category?: string | null;
  is_active: boolean;
  verification_status: RestaurantVerificationStatus;
  verification_notes?: string | null;
  created_at: string;
}

interface VerificationDocument {
  id: string;
  restaurant_id: string;
  document_type: string;
  file_url: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

interface RestaurantReviewDetail {
  restaurant: PlatformRestaurant;
  documents: VerificationDocument[];
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

const getDocumentLabel = (type: string) => {
  const labels: Record<string, string> = {
    official_id: "Identificación oficial",
    tax_or_business_document: "Comprobante fiscal o documento comercial",
    proof_of_address: "Comprobante de domicilio",
  };

  return labels[type] ?? type;
};

const formatFileSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
};

export default function PlatformRestaurantReviewPage() {
  const router = useRouter();
  const params = useParams();

  const restaurantId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [detail, setDetail] = useState<RestaurantReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRestaurantDetail = async () => {
    const token = getToken();

    if (!token || !isPlatformSessionUser()) {
      clearSession();
      router.push("/platform/login");
      return;
    }

    if (!restaurantId) {
      setErrorMessage("ID de restaurante inválido.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await axios.get<RestaurantReviewDetail>(buildApiUrl(`/platform/restaurants/${restaurantId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDetail(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        clearSession();
        router.push("/platform/login");
        return;
      }

      setErrorMessage("No fue posible cargar el detalle del restaurante.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetail();
  }, [restaurantId]);

  const handleApprove = async () => {
    if (!restaurantId) return;

    const result = await Swal.fire({
      theme: "dark",
      icon: "question",
      title: "Aprobar restaurante",
      text: "El restaurante quedará activo y podrá usar el panel administrativo.",
      input: "textarea",
      inputLabel: "Notas de aprobación",
      inputPlaceholder: "Ej: Documentación validada correctamente.",
      showCancelButton: true,
      confirmButtonText: "Aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#22c55e",
    });

    if (!result.isConfirmed) return;

    await submitReviewAction("approve", result.value || "Documentación validada correctamente.");
  };

  const handleReject = async () => {
    if (!restaurantId) return;

    const result = await Swal.fire({
      theme: "dark",
      icon: "warning",
      title: "Rechazar solicitud",
      text: "El restaurante no será activado.",
      input: "textarea",
      inputLabel: "Motivo del rechazo",
      inputPlaceholder: "Ej: Documentación incompleta o ilegible.",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Debes escribir el motivo del rechazo.";
        }

        return null;
      },
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    await submitReviewAction("reject", result.value);
  };

  const handleSuspend = async () => {
    if (!restaurantId) return;

    const result = await Swal.fire({
      theme: "dark",
      icon: "warning",
      title: "Suspender restaurante",
      text: "El restaurante dejará de estar activo en la plataforma.",
      input: "textarea",
      inputLabel: "Motivo de suspensión",
      inputPlaceholder: "Ej: Incumplimiento de requisitos o revisión administrativa.",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Debes escribir el motivo de suspensión.";
        }

        return null;
      },
      showCancelButton: true,
      confirmButtonText: "Suspender",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    await submitReviewAction("suspend", result.value);
  };

  const submitReviewAction = async (action: "approve" | "reject" | "suspend", notes: string) => {
    const token = getToken();

    if (!token || !isPlatformSessionUser()) {
      clearSession();
      router.push("/platform/login");
      return;
    }

    try {
      setIsSubmittingAction(true);

      await axios.patch(
        buildApiUrl(`/platform/restaurants/${restaurantId}/${action}`),
        { notes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await Swal.fire({
        theme: "dark",
        icon: "success",
        title:
          action === "approve"
            ? "Restaurante aprobado"
            : action === "reject"
              ? "Solicitud rechazada"
              : "Restaurante suspendido",
        text:
          action === "approve"
            ? "El restaurante fue activado correctamente."
            : action === "reject"
              ? "La solicitud fue rechazada correctamente."
              : "El restaurante fue suspendido correctamente.",
        confirmButtonColor: "#f97316",
      });

      router.push("/platform/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        clearSession();
        router.push("/platform/login");
        return;
      }

      await Swal.fire({
        theme: "dark",
        icon: "error",
        title: "No fue posible completar la acción",
        text: "Intenta nuevamente o revisa la sesión.",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-950 p-6 text-white">
        <p className="text-white/70">Cargando detalle del restaurante...</p>
      </main>
    );
  }

  if (errorMessage || !detail) {
    return (
      <main className="min-h-screen bg-gray-950 p-6 text-white">
        <button
          type="button"
          onClick={() => router.push("/platform/dashboard")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {errorMessage || "No se encontró información del restaurante."}
        </div>
      </main>
    );
  }

  const { restaurant, documents } = detail;
  const canApprove = restaurant.verification_status !== "approved";
  const canReject = restaurant.verification_status === "pending";
  const canSuspend = restaurant.verification_status === "approved";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-gray-900/80 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/platform/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-orange-300">
            <ShieldCheck className="h-4 w-4" />
            Revisión de plataforma
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5">
              <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-300">
                {restaurant.verification_status}
              </span>

              <h1 className="mt-4 text-3xl font-bold">{restaurant.name}</h1>

              <p className="mt-2 text-sm text-white/45">{restaurant.slug || "Sin slug"}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-gray-900 p-4">
                <Mail className="mb-2 h-5 w-5 text-orange-300" />
                <p className="text-xs text-white/40">Email</p>
                <p className="font-semibold">{restaurant.email || "Sin email"}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gray-900 p-4">
                <Phone className="mb-2 h-5 w-5 text-orange-300" />
                <p className="text-xs text-white/40">Teléfono</p>
                <p className="font-semibold">{restaurant.phone || "Sin teléfono"}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gray-900 p-4 md:col-span-2">
                <MapPin className="mb-2 h-5 w-5 text-orange-300" />
                <p className="text-xs text-white/40">Ubicación</p>
                <p className="font-semibold">
                  {[restaurant.address, restaurant.city, restaurant.country].filter(Boolean).join(", ") ||
                    "Sin ubicación"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-gray-900 p-4">
              <p className="mb-2 text-xs text-white/40">Descripción</p>
              <p className="leading-7 text-white/75">{restaurant.description || "Sin descripción registrada."}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-xl font-bold">Documentos enviados</h2>

            {documents.length === 0 ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
                Este restaurante no tiene documentos cargados.
              </div>
            ) : (
              <div className="grid gap-4">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-gray-900 p-4 md:flex-row md:items-center"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 text-orange-300" />

                      <div>
                        <p className="font-bold">{getDocumentLabel(document.document_type)}</p>
                        <p className="mt-1 text-xs text-white/45">
                          {document.original_name} · {formatFileSize(document.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.open(document.file_url, "_blank", "noopener,noreferrer")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-950 transition hover:bg-orange-100"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-white/10 bg-gray-900 p-6">
          <h2 className="mb-3 text-xl font-bold">Acciones de revisión</h2>

          <p className="mb-6 text-sm leading-6 text-white/55">
            Revisa que la documentación corresponda al restaurante antes de aprobar la activación.
          </p>

          <div className="grid gap-3">
            {canApprove && (
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleApprove}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="h-5 w-5" />
                Aprobar y activar
              </button>
            )}

            {canReject && (
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleReject}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle className="h-5 w-5" />
                Rechazar solicitud
              </button>
            )}

            {canSuspend && (
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleSuspend}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Ban className="h-5 w-5" />
                Suspender restaurante
              </button>
            )}
          </div>

          {restaurant.verification_notes && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 text-xs font-semibold text-orange-300">Notas previas</p>
              <p className="text-sm text-white/70">{restaurant.verification_notes}</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
