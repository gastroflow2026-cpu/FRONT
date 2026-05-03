"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex grow items-center justify-center px-4 py-24">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-lg">
          {/* Ícono */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle size={44} className="text-red-500" />
            </div>
          </div>

          {/* Título */}
          <h1 className="mb-3 text-3xl font-bold text-slate-900">
            Pago cancelado
          </h1>

          {/* Subtítulo */}
          <p className="mb-2 text-gray-500">
            No se realizó ningún cargo a tu cuenta.
          </p>
          <p className="mb-8 text-gray-500">
            Podés intentarlo nuevamente cuando quieras.
          </p>

          {/* Detalle visual */}
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-left">
            <RefreshCw size={22} className="shrink-0 text-orange-500" />
            <p className="text-sm text-orange-800">
              Tu reserva quedó <strong>pendiente de pago</strong>. Podés completarla desde la sección de reservas.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Link href="/reservations">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-pink-600 py-3 font-bold text-white shadow-md transition hover:scale-[1.02]">
                <RefreshCw size={18} />
                Reintentar pago
              </button>
            </Link>
            <Link href="/restaurants">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 font-semibold text-gray-700 transition hover:bg-gray-100">
                <ArrowLeft size={18} />
                Volver a restaurantes
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}