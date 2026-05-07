"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  Building2,
} from "lucide-react";

import Swal from "sweetalert2";
import Image from "next/image";

import {
  loginInitialValues,
  loginValidationSchema,
} from "@/validations/loginSchema";

import { UsersContext } from "../../context/UsersContext";

import Link from "next/link";

const LoginForm = () => {
  // =========================
  // ESTADOS
  // =========================
  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // ROUTER
  // =========================
  const router = useRouter();

  // =========================
  // CONTEXTO
  // =========================
  const { loginUser, loginUserGoogle } = useContext(UsersContext);

  // =========================
  // ROLES
  // =========================
  const WAITER_ROLES = new Set(["waiter", "mesero", "mozo", "staff_waiter"]);

  const CASHIER_ROLES = new Set(["cashier", "cajero", "staff_cashier"]);

  const CHEF_ROLES = new Set([
    "chef",
    "cocinero",
    "staff_chef",
    "kitchen",
    "kitchen_staff",
  ]);

  // =========================
  // MANEJO DE ERRORES
  // =========================
  const getBackendErrorMessage = (error: unknown): string | null => {
    if (!axios.isAxiosError(error)) return null;

    const data = error.response?.data as
      | { message?: unknown; error?: unknown }
      | undefined;

    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.map((item) => String(item)).join(" | ");
    }

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    return null;
  };

  // =========================
  // LOGIN
  // =========================
  const handleSubmit = async (
    values: typeof loginInitialValues,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    },
  ) => {
    try {
      const { user } = await loginUser(values);

      await Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: "Iniciaste sesion correctamente.",
        confirmButtonColor: "#f97316",
        timer: 2000,
        showConfirmButton: false,
      });

      const roles: string[] = user?.roles ?? [];

      if (roles.some((role) => WAITER_ROLES.has(role))) {
        router.push("/waiter");
      } else if (roles.some((role) => CHEF_ROLES.has(role))) {
        router.push("/kitchen");
      } else if (roles.some((role) => CASHIER_ROLES.has(role))) {
        router.push("/cashier");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message === "OWNER_LOGIN_RESTRICTED"
          ? "Esta cuenta owner debe iniciar sesion desde el acceso para socios."
          : "El correo no esta registrado o las credenciales son incorrectas.";

      if (
        (typeof error === "object" && error !== null && "response" in error) ||
        error instanceof Error
      ) {
        await Swal.fire({
          icon: "error",
          title: "Error al iniciar sesion",
          text: message,
          confirmButtonColor: "#f97316",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_20%_20%,#070b18_0%,#141a33_70%)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* =========================
            PANEL IZQUIERDO DESKTOP
        ========================= */}
        <div className="relative hidden w-1/2 items-center justify-center lg:flex">
          <div className="absolute right-0 top-0 h-full w-[2px] bg-linear-to-b from-orange-500 via-pink-500 to-transparent opacity-70" />

          {/* =========================
              BOTÓN VOLVER
          ========================= */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute left-6 top-6 group inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 p-[2px]"
          >
            <span className="flex items-center gap-3 rounded-2xl bg-[#0a0e1e] px-8 py-4 text-lg font-semibold text-white transition-all duration-200 group-hover:bg-transparent">
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </span>
          </button>

          <Image
            src="/logo.png"
            alt="GastroFlow Logo"
            width={400}
            height={340}
            className="drop-shadow-2xl"
          />
        </div>

        {/* =========================
            CONTENEDOR DERECHO
        ========================= */}
        <div className="flex w-full flex-1 items-center justify-center px-4 py-6 sm:px-6 md:px-8 lg:w-1/2 lg:py-10">
          <div className="flex w-full max-w-xl flex-col gap-4">
            {/* =========================
                HEADER MOBILE
            ========================= */}
            <div className="flex flex-col items-center gap-4 lg:hidden">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="group flex w-full max-w-sm items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 p-[2px]"
              >
                <span className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a0e1e] px-4 py-4 text-sm font-semibold text-white transition-all duration-200 group-hover:bg-transparent sm:text-base">
                  <ArrowLeft className="h-5 w-5" />
                  Volver al inicio
                </span>
              </button>

              <Image
                src="/logo.png"
                alt="GastroFlow Logo"
                width={110}
                height={110}
                className="object-contain"
              />
            </div>

            {/* =========================
                CARD LOGIN
            ========================= */}
            <div
              className="overflow-hidden rounded-3xl"
              style={{
                background: "rgba(10, 14, 30, 0.85)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            >
              {/* =========================
                  BARRA SUPERIOR
              ========================= */}
              <Link
                href="/owner/login"
                className="flex items-center justify-center bg-linear-to-r from-orange-500 to-pink-500 px-4 py-4 text-center"
              >
                <div className="inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-full border border-orange-400 bg-orange-500/10 px-4 py-3 text-xs font-semibold text-white transition hover:bg-orange-800 sm:text-sm">
                  <Building2 className="h-4 w-4 shrink-0" />

                  <span>¿Sos dueño de un restaurante? Acceso para socios</span>
                </div>
              </Link>

              {/* =========================
                  CONTENIDO
              ========================= */}
              <div className="px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14">
                {/* =========================
                    TITULOS
                ========================= */}
                <div className="mb-8 text-center">
                  <h2
                    className="mb-3 text-4xl font-bold sm:text-5xl"
                    style={{
                      background: "linear-gradient(to right, #f97316, #ec4899)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    GastroFlow
                  </h2>

                  <p className="text-sm text-white/50 sm:text-base">
                    Inicia sesion para continuar
                  </p>
                </div>

                {/* =========================
                    FORMULARIO
                ========================= */}
                <Formik
                  initialValues={loginInitialValues}
                  validationSchema={loginValidationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="flex flex-col items-center gap-5">
                      {/* =========================
                          EMAIL
                      ========================= */}
                      <div className="flex w-full flex-col gap-2">
                        <label className="text-sm font-semibold text-white/80">
                          Email
                        </label>

                        <div
                          className="flex items-center gap-3 rounded-xl px-4 py-4 transition-all"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "2px solid rgba(249,115,22,0.4)",
                          }}
                        >
                          <Mail className="h-5 w-5 shrink-0 text-gray-400" />

                          <Field
                            type="email"
                            name="email"
                            placeholder="tucorreo@ejemplo.com"
                            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25 sm:text-base"
                          />
                        </div>

                        <ErrorMessage
                          name="email"
                          component="p"
                          className="text-xs text-red-400"
                        />
                      </div>

                      {/* =========================
                          PASSWORD
                      ========================= */}
                      <div className="flex w-full flex-col gap-2">
                        <label className="text-sm font-semibold text-white/80">
                          Contrasena
                        </label>

                        <div
                          className="flex items-center gap-3 rounded-xl px-4 py-4 transition-all"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "2px solid rgba(249,115,22,0.4)",
                          }}
                        >
                          <Lock className="h-5 w-5 shrink-0 text-gray-400" />

                          <Field
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="••••••••"
                            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25 sm:text-base"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 transition hover:text-orange-400"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        <ErrorMessage
                          name="password"
                          component="p"
                          className="text-xs text-red-400"
                        />
                      </div>

                      {/* =========================
                          OPCIONES
                      ========================= */}
                      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/50">
                          <Field
                            type="checkbox"
                            name="rememberMe"
                            className="h-4 w-4 accent-orange-400"
                          />
                          Recordarme
                        </label>

                        <a
                          href="/forgot-password"
                          className="text-sm text-orange-400 transition hover:text-orange-300 hover:underline"
                        >
                          Olvidaste tu contrasena?
                        </a>
                      </div>

                      {/* =========================
                          BOTÓN LOGIN
                      ========================= */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 flex w-full items-center justify-center gap-4 rounded-xl py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:text-lg"
                        style={{
                          background:
                            "linear-gradient(to right, #f97316, #ec4899)",
                          boxShadow: isSubmitting
                            ? "none"
                            : "0 4px 15px rgba(249,115,22,0.3)",
                        }}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Iniciando sesion...
                          </div>
                        ) : (
                          <>
                            <LogIn className="h-5 w-5" />
                            Iniciar Sesion
                          </>
                        )}
                      </button>

                      {/* =========================
                          REGISTER
                      ========================= */}
                      <p className="text-center text-sm text-white/40">
                        No tienes una cuenta?{" "}
                        <a
                          href="/register"
                          className="font-semibold text-orange-400 transition hover:text-orange-300 hover:underline"
                        >
                          Registrate aqui
                        </a>
                      </p>

                      {/* =========================
                          DIVISOR
                      ========================= */}
                      <div className="flex w-full items-center gap-3">
                        <hr className="flex-1 border-white/10" />

                        <span className="text-xs text-white/30">
                          o continua con
                        </span>

                        <hr className="flex-1 border-white/10" />
                      </div>

                      {/* =========================
                          GOOGLE LOGIN
                      ========================= */}
                      <button
                        onClick={async () => {
                          loginUserGoogle();
                        }}
                        type="button"
                        className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-white/5 bg-white/5 px-5 py-4 text-sm font-semibold text-white/70 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continuar con Google
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
