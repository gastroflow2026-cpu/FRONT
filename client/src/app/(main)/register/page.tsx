"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import RegisterForm from "@/components/RegisterForm/RegisterForm";

export default function Register() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_20%_20%,#070b18_0%,#141a33_70%)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* =========================
            PANEL IZQUIERDO DESKTOP
        ========================= */}
        <div className="relative hidden w-1/2 items-center justify-center lg:flex">
          <div className="absolute right-0 top-0 h-full w-0.5 bg-linear-to-b from-orange-500 via-pink-500 to-transparent opacity-70" />

          <Link
            href="/"
            className="absolute left-6 top-6 group inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 p-0.5"
          >
            <span className="flex items-center gap-3 rounded-2xl bg-[#0a0e1e] px-8 py-4 text-lg font-semibold text-white transition-all duration-200 group-hover:bg-transparent">
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </span>
          </Link>

          <Image
            src="/gastroflow-logo.png"
            alt="Logo GastroFlow"
            width={400}
            height={340}
            priority
            className="drop-shadow-2xl"
          />
        </div>

        {/* =========================
            CONTENEDOR MOBILE / TABLET / DESKTOP
        ========================= */}
        <div className="flex w-full flex-1 items-center justify-center px-4 py-6 sm:px-6 md:px-8 lg:w-1/2 lg:py-10">
          <div className="flex w-full max-w-xl flex-col gap-4">
            {/* =========================
                HEADER MOBILE Y TABLET
            ========================= */}
            <div className="flex flex-col items-center gap-4 lg:hidden">
              <Link
                href="/"
                className="group flex w-full max-w-sm items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 p-0.5"
              >
                <span className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a0e1e] px-4 py-4 text-sm font-semibold text-white transition-all duration-200 group-hover:bg-transparent sm:text-base">
                  <ArrowLeft className="h-5 w-5" />
                  Volver al inicio
                </span>
              </Link>

              <Image
                src="/gastroflow-logo.png"
                alt="Logo GastroFlow"
                width={110}
                height={110}
                priority
                className="object-contain"
              />
            </div>

            {/* =========================
                FORMULARIO
            ========================= */}
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
