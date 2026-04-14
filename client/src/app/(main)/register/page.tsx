import { ArrowLeft } from "lucide-react";
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

      <a href="/" className="register-page__back">
        <ArrowLeft className="register-page__back-icon" />
        <span>Volver al inicio</span>
      </a>

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
