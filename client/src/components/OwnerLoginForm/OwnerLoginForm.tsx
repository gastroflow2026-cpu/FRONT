"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { ArrowLeft, Building2, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { loginInitialValues, loginValidationSchema } from "@/validations/loginSchema";
import { UsersContext } from "@/context/UsersContext";

interface OwnerLoginFormProps {
  embedded?: boolean;
  hideRegisterLink?: boolean;
  compact?: boolean;
}

const OwnerLoginForm = ({
  embedded = false,
  hideRegisterLink = false,
  compact = false,
}: OwnerLoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { loginOwner } = useContext(UsersContext);

  const handleSubmit = async (
    values: typeof loginInitialValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      const result = await loginOwner({
        email: values.email,
        password: values.password,
      });

      if (result.status === 200 && result.data && "user" in result.data) {
        await Swal.fire({
          theme: "dark",
          icon: "success",
          title: "Acceso correcto",
          text: "Ingresaste como owner correctamente.",
          confirmButtonColor: "#f97316",
          timer: 1800,
          showConfirmButton: false,
        });

        if (result.data.user.requires_restaurant_onboarding) {
          router.push("/owner/onboarding");
          return;
        }

        router.push("/admin");
        return;
      }

      const backendMessage =
        result.data &&
        "message" in result.data &&
        typeof result.data.message === "string"
          ? result.data.message
          : "El usuario no pertenece al rol REST_ADMIN o las credenciales son invalidas.";

      await Swal.fire({
        theme: "dark",
        icon: "error",
        title: "No fue posible iniciar sesion",
        text: backendMessage,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const card = (
    <div
      className={`w-full max-w-lg rounded-2xl flex flex-col justify-center ${compact ? "px-9 py-9" : "px-10 py-10"}`}
      style={{
        background: "rgba(10, 14, 30, 0.85)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      }}
      >
        <div className={`text-center ${compact ? "mb-6" : "mb-6"}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 rounded-full border border-orange-500/30 bg-orange-500/10 text-sm font-semibold text-orange-300">
          <Building2 className="w-4 h-4" />
          Acceso para socios
        </div>
        <h2
          className={`${compact ? "text-3xl" : "text-4xl"} font-bold mb-2`}
          style={{
            background: "linear-gradient(to right, #f97316, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Inicia sesion
        </h2>
        <p className="text-white/50">
          Accede con tu cuenta administradora del restaurante
        </p>
      </div>

      <Formik
        initialValues={loginInitialValues}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isSubmitting }) => (
          <Form className={`flex flex-col items-center ${compact ? "gap-4" : "gap-4"}`}>
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
              Si tu cuenta aun no tiene restaurante vinculado, te enviaremos al onboarding despues del login.
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <label className="text-sm font-semibold text-white/80">Email</label>
              <div
                className="flex items-center rounded-md px-4 py-3.5 gap-3 transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "2px solid rgba(249,115,22,0.4)",
                }}
              >
                <Mail className="text-gray-400 w-5 h-5 shrink-0" />
                <Field
                  type="email"
                  name="email"
                  placeholder="owner@restaurante.com"
                  className="flex-1 outline-none text-md text-white bg-transparent placeholder:text-white/25"
                />
              </div>
              <ErrorMessage name="email" component="p" className="text-red-400 text-xs" />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <label className="text-sm font-semibold text-white/80">Contrasena</label>
              <div
                className="flex items-center rounded-md px-4 py-3.5 gap-3 transition-all"
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
              <ErrorMessage name="password" component="p" className="text-red-400 text-xs" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-5 w-full max-w-xs py-4 rounded-md text-white font-semibold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1 cursor-pointer"
              style={{
                background: "linear-gradient(to right, #f97316, #ec4899)",
                boxShadow: isSubmitting ? "none" : "0 4px 15px rgba(249,115,22,0.3)",
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
                  Iniciar sesion para socios
                </>
              )}
            </button>

            {!hideRegisterLink && (
              <p className="text-center text-sm text-white/40">
                Aun no tienes acceso?{" "}
                <Link
                  href="/owner/register"
                  className="text-orange-400 font-semibold hover:text-orange-300 transition hover:underline"
                >
                  Registra tu restaurante
                </Link>
              </p>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );

  if (embedded) {
    return card;
  }

  return (
    <div className="h-dvh overflow-hidden flex bg-[radial-gradient(circle_at_20%_20%,#070b18_0%,#141a33_70%)]">
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
          width={340}
          height={290}
          className="drop-shadow-2xl"
        />
      </div>

      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-4 py-6 md:px-8">
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

        {card}
      </div>
    </div>
  );
};

export default OwnerLoginForm;
