"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  UtensilsCrossed,
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
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { loginUser, loginUserGoogle } = useContext(UsersContext);

  const handleSubmit = async (
    values: typeof loginInitialValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
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
      if (roles.includes("waiter") || roles.includes("mesero")) {
        router.push("/waiter");
      } else if (roles.includes("cashier") || roles.includes("cajero")) {
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
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_20%_20%,#070b18_0%,#141a33_70%)]">
      <div className="hidden lg:flex w-1/2 items-center justify-center relative">
        <div className="absolute right-0 top-0 h-full w-0.5 bg-linear-to-b from-orange-500 via-pink-500 to-transparent opacity-70" />
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute top-6 left-6 group inline-flex items-center justify-center p-1 rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 cursor-pointer"
        >
          <span className="flex items-center gap-3 px-10 py-4 bg-[#0a0e1e] rounded-xl text-white text-lg font-semibold transition-all duration-200 group-hover:bg-transparent">
            <ArrowLeft className="w-5 h-5" />
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

      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-4 py-10 md:px-10">
        <div className="flex lg:hidden flex-col items-center mb-6 gap-3 w-full">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute top-6 left-6 group inline-flex items-center justify-center p-1 rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 cursor-pointer"
          >
            <span className="flex items-center gap-3 px-10 py-4 bg-[#0a0e1e] rounded-xl text-white text-lg font-semibold transition-all duration-200 group-hover:bg-transparent">
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio
            </span>
          </button>
          <Image
            src="/logo.png"
            alt="GastroFlow Logo"
            width={120}
            height={120}
            className="mt-2"
          />
        </div>

        {/* ↓ overflow:hidden para que la barra respete el border-radius del card */}
        <div
          className="w-full max-w-lg min-h-150 rounded-2xl flex flex-col justify-center"
          style={{
            background: "rgba(10, 14, 30, 0.85)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          {/* ↓ BARRA SUPERIOR - REGISTRO RESTAURANTE */}
          <Link
            href="/owner/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: "linear-gradient(90deg, #f97316 0%, #ec4899 100%)",
              padding: "0.7rem 1.25rem",
              textDecoration: "none",
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* <UtensilsCrossed size={15} color="white" />
            <span
              style={{
                color: "white",
                fontSize: "13px",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              ¿Sos dueño de un restaurante? Registralo aquí
            </span> */}
            <div className="inline-flex items-center gap-4 px-4 py-1 mb-1 rounded-full border border-orange-500 bg-orange-500/10 text-sm font-semibold text-white hover:bg-orange-800 transition cursor-pointer">
              <Building2 className="w-4 h-4" />
              ¿Sos dueño de un restaurante? {""}Acceso para socios
            </div>
          </Link>
          {/* ↑ FIN BARRA SUPERIOR */}

          {/* ↓ Contenido del card con padding */}
          <div className="px-12 py-14">
            <div className="text-center mb-8">
              <h2
                className="text-4xl font-bold mb-2"
                style={{
                  background: "linear-gradient(to right, #f97316, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                GastroFlow
              </h2>
              <p className="text-white/50">Inicia sesion para continuar</p>
            </div>

            <Formik
              initialValues={loginInitialValues}
              validationSchema={loginValidationSchema}
              onSubmit={handleSubmit}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-5 items-center">
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <label className="text-sm font-semibold text-white/80">
                      Email
                    </label>
                    <div
                      className="flex items-center rounded-md px-4 py-4 gap-3 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "2px solid rgba(249,115,22,0.4)",
                      }}
                    >
                      <Mail className="text-gray-400 w-5 h-5 shrink-0" />
                      <Field
                        type="email"
                        name="email"
                        placeholder="tucorreo@ejemplo.com"
                        className="flex-1 outline-none text-md text-white bg-transparent placeholder:text-white/25"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-400 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <label className="text-sm font-semibold text-white/80">
                      Contrasena
                    </label>
                    <div
                      className="flex items-center rounded-md px-4 py-4 gap-3 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "2px solid rgba(249,115,22,0.4)",
                      }}
                    >
                      <Lock className="text-gray-400 w-5 h-5 shrink-0" />
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        className="flex-1 outline-none text-md text-white bg-transparent placeholder:text-white/25"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-orange-400 transition cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-red-400 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between w-full max-w-xs">
                    <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer">
                      <Field
                        type="checkbox"
                        name="rememberMe"
                        className="accent-orange-400 w-4 h-4"
                      />
                      Recordarme
                    </label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-orange-400 hover:text-orange-300 transition hover:underline cursor-pointer"
                    >
                      Olvidaste tu contrasena?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-5 w-full max-w-xs py-5 rounded-md text-white font-semibold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1 cursor-pointer"
                    style={{
                      background: "linear-gradient(to right, #f97316, #ec4899)",
                      boxShadow: isSubmitting
                        ? "none"
                        : "0 4px 15px rgba(249,115,22,0.3)",
                    }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Iniciando sesion...
                      </div>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Iniciar Sesion
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-white/40">
                    No tienes una cuenta?{" "}
                    <a
                      href="/register"
                      className="text-orange-400 font-semibold hover:text-orange-300 transition hover:underline"
                    >
                      Registrate aqui
                    </a>
                  </p>

                  <div className="flex items-center gap-3">
                    <hr className="flex-1 border-white/10" />
                    <span className="text-xs text-white/30">
                      o continua con
                    </span>
                    <hr className="flex-1 border-white/10" />
                  </div>

                  <button
                    onClick={async () => {
                      loginUserGoogle();
                    }}
                    type="button"
                    className="flex items-center justify-center gap-2 w-auto max-w-xs py-3 px-5 border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 rounded-md text-sm font-semibold text-white/70 hover:text-white transition-all cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    Google
                  </button>
                </Form>
              )}
            </Formik>
          </div>
          {/* ↑ FIN contenido con padding */}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
