"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import OwnerRegisterForm from "@/components/OwnerRegisterForm/OwnerRegisterForm";
import "./OwnerAuthView.css";

const OwnerAuthView = () => {
  return (
    <section className="owner-auth-view">
      <Link
        href="/"
        className="register-back-btn group"
        style={{
          zIndex: 20,
          position: "absolute",
          top: "1.5rem",
          left: "1.5rem",
        }}
      >
        <span className="flex items-center gap-3 px-10 py-4 bg-[#0a0e1e] rounded-xl text-white text-lg font-semibold transition-all duration-200 group-hover:bg-transparent">
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </span>
      </Link>

      <div className="owner-auth-view__shell">
        <aside className="owner-auth-view__left">
          <div className="owner-auth-view__content">
            <Image
              src="/gastroflow-logo.png"
              alt="Logo GastroFlow"
              width={180}
              height={180}
              className="owner-auth-view__logo"
            />

            <span className="owner-auth-view__tag">Plataforma para restaurantes</span>

            <h1 className="owner-auth-view__title">
              Gestiona tu restaurante
              <span>de punta a punta</span>
            </h1>

            <p className="owner-auth-view__description">
              Optimiza la operación de tu restaurante con una plataforma diseñada
              para centralizar reservas, mesas, órdenes, cocina, pagos y análisis
              del negocio. Desde la captación de clientes en tu landing hasta el
              cierre de cuenta, GastroFlow te ayuda a ofrecer una experiencia más
              ágil, profesional y rentable.
            </p>

            <div className="owner-auth-view__features">
              <div className="owner-auth-view__feature">
                <strong>Reservas y mesas</strong>
                Organiza la ocupación y reduce fricción en sala.
              </div>
              <div className="owner-auth-view__feature">
                <strong>Operación integrada</strong>
                Conecta cocina, órdenes, cobros y seguimiento.
              </div>
              <div className="owner-auth-view__feature">
                <strong>Visibilidad del negocio</strong>
                Revisa métricas clave para decidir mejor.
              </div>
            </div>
          </div>
        </aside>

        <div className="owner-auth-view__right">
          <div className="owner-auth-view__forms">
            <OwnerRegisterForm hideFooterLink />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerAuthView;
