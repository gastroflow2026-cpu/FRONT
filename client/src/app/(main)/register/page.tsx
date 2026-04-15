"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import "../../css/RegisterFormPage.css";
import RegisterForm from "@/components/RegisterForm/RegisterForm";

export default function Register() {
  return (
    <div className="register-page">
      <div className="register-page__background">
        <div className="register-page__circle register-page__circle--1"></div>
        <div className="register-page__circle register-page__circle--2"></div>
        <div className="register-page__circle register-page__circle--3"></div>
      </div>

      {/* BOTÓN VOLVER UNIFICADO */}
      <Link
        href="/"
        className="register-back-btn group"
        style={{ zIndex: 20, position: 'absolute', top: '1.5rem', left: '1.5rem' }}
      >
        <span className="flex items-center gap-3 px-10 py-4 bg-[#0a0e1e] rounded-xl text-white text-lg font-semibold transition-all duration-200 group-hover:bg-transparent">
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </span>
      </Link>

      <div className="register-page__container">
        {/* IZQUIERDA */}
        <div className="register-page__image-section">
          <img
            src="/gastroflow-logo.png"
            alt="Logo GastroFlow"
            className="register-page__logo-image"
          />
        </div>

        {/* DERECHA */}
        <div className="register-page__form-section">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}