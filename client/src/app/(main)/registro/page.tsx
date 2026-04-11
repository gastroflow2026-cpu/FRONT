import { ArrowLeft } from "lucide-react";
import "../../css/RegisterFormPage.css";
import RegisterForm from "@/components/RegisterForm/RegisterForm";

/**
 * Register Page - Página de registro de nuevos usuarios
 * Incluye formulario de registro con fondo degradado y decoraciones
 */
export default function Register() {
  return (
    <div className="register-page">
      {/* Fondo degradado animado */}
      <div className="register-page__background">
        {/* Círculos decorativos con blur */}
        <div className="register-page__circle register-page__circle--1"></div>
        <div className="register-page__circle register-page__circle--2"></div>
        <div className="register-page__circle register-page__circle--3"></div>
      </div>

      {/* Botón para volver al inicio */}
      <a href="/" className="register-page__back">
        <ArrowLeft className="register-page__back-icon" />
        <span>Volver al inicio</span>
      </a>

      {/* Contenedor del formulario */}
      <div className="register-page__container">
        {/* Imagen decorativa de fondo (solo desktop) */}
        <div className="register-page__image-section">
          <div className="register-page__image-overlay">
            <h2 className="register-page__image-title">
              Únete a{" "}
              <span className="register-page__image-title--gradient">
                GastroFlow
              </span>
            </h2>
            <p className="register-page__image-text">
              Crea tu cuenta y accede a una experiencia gastronómica única
            </p>

            {/* Beneficios decorativos */}
            <div className="register-page__benefits">
              <div className="register-page__benefit">
                <div className="register-page__benefit-icon">🎁</div>
                <div className="register-page__benefit-content">
                  <h3 className="register-page__benefit-title">
                    Bono de Bienvenida
                  </h3>
                  <p className="register-page__benefit-text">
                    20% de descuento en tu primera reserva
                  </p>
                </div>
              </div>

              <div className="register-page__benefit">
                <div className="register-page__benefit-icon">⭐</div>
                <div className="register-page__benefit-content">
                  <h3 className="register-page__benefit-title">Recompensas</h3>
                  <p className="register-page__benefit-text">
                    Acumula puntos en cada reserva
                  </p>
                </div>
              </div>

              <div className="register-page__benefit">
                <div className="register-page__benefit-icon">🔔</div>
                <div className="register-page__benefit-content">
                  <h3 className="register-page__benefit-title">
                    Ofertas Exclusivas
                  </h3>
                  <p className="register-page__benefit-text">
                    Acceso anticipado a promociones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección del formulario */}
        <div className="register-page__form-section">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
