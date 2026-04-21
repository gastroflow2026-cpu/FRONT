"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import { Building2, Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react";
import { UsersContext } from "@/context/UsersContext";
import {
  ownerRegisterInitialValues,
  ownerRegisterValidationSchema,
  OwnerRegisterFormValues,
} from "@/validations/ownerRegisterSchema";
import "./OwnerRegisterForm.css";

interface OwnerRegisterFormProps {
  hideFooterLink?: boolean;
}

export default function OwnerRegisterForm({
  hideFooterLink = false,
}: OwnerRegisterFormProps) {
  const router = useRouter();
  const { registerOwner } = useContext(UsersContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik<OwnerRegisterFormValues>({
    initialValues: ownerRegisterInitialValues,
    validationSchema: ownerRegisterValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await registerOwner(values);

        if (
          result.status === 201 &&
          result.data &&
          "user" in result.data
        ) {
          await Swal.fire({
            theme: "dark",
            icon: "success",
            title: "Registro completado",
            text: "Tu acceso owner fue creado correctamente. Inicia sesion para configurar tu restaurante.",
            confirmButtonColor: "#f97316",
          });

          router.push("/owner/login");
          return;
        }

        if (result.status === 400 || result.status === 409) {
          const backendMessage =
            result.data &&
            "message" in result.data &&
            typeof result.data.message === "string"
              ? result.data.message
              : "No se pudo registrar el owner. Verifica si el email ya existe o si ya hay un REST_ADMIN creado.";

          await Swal.fire({
            theme: "dark",
            icon: "error",
            title: "No fue posible registrarte",
            text: backendMessage,
            confirmButtonColor: "#f97316",
          });
          return;
        }

        await Swal.fire({
          theme: "dark",
          icon: "error",
          title: "Error inesperado",
          text: "Intentalo nuevamente en unos minutos.",
          confirmButtonColor: "#f97316",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="owner-register-form">
      <div className="owner-register-form__header">
        <span className="owner-register-form__eyebrow">
          Acceso para aliados GastroFlow
        </span>
        <h1 className="owner-register-form__title">Crea tu cuenta owner</h1>
        <p className="owner-register-form__subtitle">
          Crea el acceso administrativo principal de tu restaurante para
          comenzar la configuracion inicial de la operacion dentro de
GastroFlow.
        </p>
      </div>

      <form className="owner-register-form__form" onSubmit={formik.handleSubmit}>
        <div className="owner-register-form__row">
          <div className="owner-register-form__field">
            <label className="owner-register-form__label" htmlFor="first_name">
              Nombre
            </label>
            <div className="owner-register-form__input-wrapper">
              <User className="owner-register-form__input-icon" />
              <input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="Hiram"
                className="owner-register-form__input"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.first_name && formik.errors.first_name && (
              <p className="owner-register-form__error">{formik.errors.first_name}</p>
            )}
          </div>

          <div className="owner-register-form__field">
            <label className="owner-register-form__label" htmlFor="last_name">
              Apellido
            </label>
            <div className="owner-register-form__input-wrapper">
              <User className="owner-register-form__input-icon" />
              <input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Perez"
                className="owner-register-form__input"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.last_name && formik.errors.last_name && (
              <p className="owner-register-form__error">{formik.errors.last_name}</p>
            )}
          </div>
        </div>

        <div className="owner-register-form__field">
          <label className="owner-register-form__label" htmlFor="email">
            Email corporativo
          </label>
          <div className="owner-register-form__input-wrapper">
            <Mail className="owner-register-form__input-icon" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="owner@restaurante.com"
              className="owner-register-form__input"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <p className="owner-register-form__helper">
            Este correo sera el acceso principal de administracion.
          </p>
          {formik.touched.email && formik.errors.email && (
            <p className="owner-register-form__error">{formik.errors.email}</p>
          )}
        </div>

        <div className="owner-register-form__row">
          <div className="owner-register-form__field">
            <label className="owner-register-form__label" htmlFor="password">
              Contrasena
            </label>
            <div className="owner-register-form__input-wrapper">
              <Lock className="owner-register-form__input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="owner-register-form__input"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                tabIndex={-1}
                className="owner-register-form__eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="owner-register-form__error">{formik.errors.password}</p>
            )}
          </div>

          <div className="owner-register-form__field">
            <label
              className="owner-register-form__label"
              htmlFor="confirmPassword"
            >
              Confirmar contrasena
            </label>
            <div className="owner-register-form__input-wrapper">
              <Lock className="owner-register-form__input-icon" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="owner-register-form__input"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                tabIndex={-1}
                className="owner-register-form__eye-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="owner-register-form__error">
                {formik.errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="owner-register-form__submit"
          disabled={formik.isSubmitting}
        >
          <span className="owner-register-form__submit-text">
            {formik.isSubmitting ? (
              "Creando cuenta..."
            ) : (
              <>
                <Building2 size={18} />
                <UserPlus size={18} />
                Crear acceso owner
              </>
            )}
          </span>
        </button>
      </form>

      {!hideFooterLink && (
        <p className="owner-register-form__footer">
          Ya tienes acceso?{" "}
          <a href="/owner/login" className="owner-register-form__link">
            Inicia sesion para socios
          </a>
        </p>
      )}
    </div>
  );
}
