"use client";
import {
  RegisterFormValues,
  registerInitialValues,
  registerValidationSchema,
} from "@/validations/registerSchema";
import { useFormik } from "formik";
import "./RegisterForm.css";
import {
  Lock,
  Mail,
  User,
  UserPlus,
  Eye,
  EyeOff,
  UtensilsCrossed,
} from "lucide-react"; // ← agregado UtensilsCrossed
import { useContext, useState } from "react";
import { UsersContext } from "../../context/UsersContext";
import Swal from "sweetalert2";
import Link from "next/link"; // ← agregado Link

export default function RegisterForm() {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { registerNewUser } = useContext(UsersContext);
  const { registerUserGoogle } = useContext(UsersContext);

  const formik = useFormik<RegisterFormValues>({
    initialValues: registerInitialValues,
    validationSchema: registerValidationSchema,
    validateOnMount: false,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { resetForm }) => {
      const newErrors: Record<string, string> = {};

      if (!acceptTerms) {
        newErrors.terms = "Debes aceptar los términos y condiciones";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const result = await registerNewUser(values);

      if (result.status === 201) {
        Swal.fire({
          theme: "dark",
          title: "Éxito!",
          text: "Usuario registrado correctamente",
          icon: "success",
        });

        resetForm();
        return;
      }

      const backendMessageRaw =
        result.data && "message" in result.data ? result.data.message : undefined;
      const backendMessage = Array.isArray(backendMessageRaw)
        ? backendMessageRaw.map((item) => String(item)).join(" | ")
        : typeof backendMessageRaw === "string"
          ? backendMessageRaw
          : null;

      const normalizedBackendMessage = backendMessage?.toLowerCase() ?? "";
      const isEmailAlreadyRegistered =
        normalizedBackendMessage.includes("email ya esta registrado") ||
        normalizedBackendMessage.includes("email ya está registrado");

      Swal.fire({
        theme: "dark",
        title: "Error!",
        text: isEmailAlreadyRegistered
          ? "El email ya está registrado"
          : backendMessage || "No fue posible registrar el usuario. Revisa los datos ingresados.",
        icon: "error",
      });
    },
  });

  return (
    // ↓ agregado overflow: hidden para que la barra respete el border-radius
    <div className="register-form" style={{ padding: 0, overflow: "hidden" }}>
      {/* ↓ BARRA SUPERIOR NUEVA - REGISTRO RESTAURANTE */}
      <Link
        href="/owner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          background: "linear-gradient(90deg, #f97316 0%, #ec4899 100%)",
          padding: "1.7rem 1.25rem",
          textDecoration: "none",
          position: "relative",
        }}
      >
        <UtensilsCrossed size={15} color="white" />
        <span
          style={{
            color: "white",
            fontSize: "13px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          ¿Sos dueño de un restaurante? Registralo aquí
        </span>
      </Link>
      {/* ↑ FIN BARRA SUPERIOR */}

      {/* ↓ Wrapper con el padding original del formulario */}
      <div style={{ padding: "1.5rem 1.25rem" }}>
        <div className="register-form__header">
          <h1 className="register-form__logo">
            <span className="register-form__logo-text">GastroFlow</span>
          </h1>
          <p className="register-form__subtitle">
            Crea tu cuenta y descubre los mejores restaurantes
          </p>
        </div>
        <form className="register-form__form" onSubmit={formik.handleSubmit}>
          {/* NOMBRE */}
          <div className="register-form__field">
            <label className="register-form__label">Nombre Completo</label>
            <div className="register-form__input-wrapper">
              <User className="register-form__input-icon" />
              <input
                className="register-form__input"
                id="first_name"
                name="first_name"
                type="text"
                placeholder="Juan"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.errors.first_name && formik.touched.first_name && (
              <div className="register-form__error">
                {formik.errors.first_name}
              </div>
            )}
          </div>

          {/* APELLIDO */}
          <div className="register-form__field">
            <label className="register-form__label">Apellido</label>
            <div className="register-form__input-wrapper">
              <User className="register-form__input-icon" />
              <input
                className="register-form__input"
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Perez"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.errors.last_name && formik.touched.last_name && (
              <div className="register-form__error">
                {formik.errors.last_name}
              </div>
            )}
          </div>

          {/* CIUDAD */}
          <div className="register-form__field">
            <label className="register-form__label">Ciudad</label>
            <div className="register-form__input-wrapper">
              <User className="register-form__input-icon" />
              <input
                className="register-form__input"
                id="city"
                name="city"
                type="text"
                placeholder="Ciudad"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.errors.city && formik.touched.city && (
              <div className="register-form__error">{formik.errors.city}</div>
            )}
          </div>

          {/* PAIS */}
          <div className="register-form__field">
            <label className="register-form__label">Pais</label>
            <div className="register-form__input-wrapper">
              <User className="register-form__input-icon" />
              <input
                className="register-form__input"
                id="country"
                name="country"
                type="text"
                placeholder="País"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.errors.country && formik.touched.country && (
              <div className="register-form__error">
                {formik.errors.country}
              </div>
            )}
          </div>

          {/* EMAIL */}
          <div className="register-form__field">
            <label className="register-form__label">Email</label>
            <div className="register-form__input-wrapper">
              <Mail className="register-form__input-icon" />
              <input
                className="register-form__input"
                id="email"
                name="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.errors.email && formik.touched.email && (
              <div className="register-form__error">{formik.errors.email}</div>
            )}
          </div>

          {/* PASSWORD */}
          <div className="register-form__field">
            <label className="register-form__label">Contraseña</label>
            <div
              className="register-form__input-wrapper"
              style={{ position: "relative" }}
            >
              <Lock className="register-form__input-icon" />
              <input
                className="register-form__input"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                tabIndex={-1}
                className="register-form__eye-btn"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.errors.password && formik.touched.password && (
              <div className="register-form__error">
                {formik.errors.password}
              </div>
            )}
            <div className="register-form__error">
              La contraseña debe tener 8 a 15 caracteres, mayúscula, minúscula, número y carácter especial.
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="register-form__field">
            <label className="register-form__label">Confirmar Contraseña</label>
            <div
              className="register-form__input-wrapper"
              style={{ position: "relative" }}
            >
              <Lock className="register-form__input-icon" />
              <input
                className="register-form__input"
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                tabIndex={-1}
                className="register-form__eye-btn"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.errors.confirmPassword &&
              formik.touched.confirmPassword && (
                <div className="register-form__error">
                  {formik.errors.confirmPassword}
                </div>
              )}
          </div>

          {/* Términos y condiciones */}
          <div className="register-form__terms">
            <label className="register-form__checkbox-label">
              <input
                type="checkbox"
                className="register-form__checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={isLoading}
              />
              <span>
                Acepto los{" "}
                <a href="#" className="register-form__link">
                  términos y condiciones
                </a>{" "}
                y la{" "}
                <a href="#" className="register-form__link">
                  política de privacidad
                </a>
              </span>
            </label>
            {errors.terms && (
              <p className="register-form__error">{errors.terms}</p>
            )}
          </div>
          {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
            <p className="register-form__error">
              Revisa los campos marcados antes de crear la cuenta.
            </p>
          )}

          <button type="submit" className="register-form__submit">
            <span className="register-form__submit-text">
              <UserPlus className="register-form__submit-icon" />
              Crear Cuenta
            </span>
          </button>

          {/* Enlace a login */}
          <p className="register-form__login">
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className="register-form__login-link">
              Inicia sesión aquí
            </a>
          </p>

          {/* ↓ ELIMINADO el segundo enlace de restaurante, ahora está en la barra superior */}
        </form>

        {/* Separador */}
        <div className="register-form__divider">
          <span className="register-form__divider-text">o regístrate con</span>
        </div>

        {/* Botones de redes sociales */}
        <div className="register-form__social"></div>
        <button
          onClick={async () => {
            registerUserGoogle();
          }}
          className="register-form__social-button register-form__social-button--google"
        >
          <svg className="register-form__social-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
      </div>
      {/* ↑ FIN Wrapper con padding */}
    </div>
  );
}
