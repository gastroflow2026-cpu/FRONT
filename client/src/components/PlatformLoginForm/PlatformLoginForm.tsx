"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Image from "next/image";
import Swal from "sweetalert2";
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { UsersContext } from "@/context/UsersContext";
import { loginInitialValues, loginValidationSchema } from "@/validations/loginSchema";

const PlatformLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { loginPlatform } = useContext(UsersContext);

  const getBackendErrorMessage = (data: unknown): string | null => {
    if (!data || typeof data !== "object") return null;

    const parsed = data as { message?: unknown; error?: unknown };

    if (Array.isArray(parsed.message)) {
      return parsed.message.map(String).join(" | ");
    }

    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }

    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error;
    }

    return null;
  };

  const handleSubmit = async (
    values: typeof loginInitialValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      const result = await loginPlatform({
        email: values.email,
        password: values.password,
      });

      if (result.status === 200 && result.data && "user" in result.data) {
        await Swal.fire({
          theme: "dark",
          icon: "success",
          title: "Acceso correcto",
          text: "Ingresaste como administrador de plataforma.",
          confirmButtonColor: "#f97316",
          timer: 1400,
          showConfirmButton: false,
        });

        router.push("/platform/dashboard");
        return;
      }

      await Swal.fire({
        theme: "dark",
        icon: "error",
        title: "No fue posible iniciar sesión",
        text: getBackendErrorMessage(result.data) || "La cuenta no pertenece a un administrador de plataforma.",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#181022_0%,#0d1224_45%,#080b14_100%)] px-4 py-6">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </button>

      <main className="mx-auto grid min-h-[calc(100vh-120px)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <section className="hidden lg:block">
          <div className="mb-8 flex items-center gap-4">
            <Image src="/logo.png" alt="GastroFlow" width={90} height={90} priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">GastroFlow Platform</p>
              <h1 className="mt-2 text-5xl font-bold text-white">Panel interno</h1>
            </div>
          </div>

          <p className="max-w-xl text-lg leading-8 text-white/65">
            Acceso exclusivo para el equipo de plataforma. Desde aquí se revisarán restaurantes, documentación y
            activaciones.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0b1020]/90 p-8 shadow-2xl">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-300">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <h2 className="text-3xl font-bold text-white">Acceso plataforma</h2>

            <p className="mt-2 text-sm text-white/50">Ingresa con tu cuenta de super administrador.</p>
          </div>

          <Formik initialValues={loginInitialValues} validationSchema={loginValidationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">Email</label>
                  <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-white/5 px-4 py-3">
                    <Mail className="h-5 w-5 text-white/40" />
                    <Field
                      type="email"
                      name="email"
                      placeholder="superadmin@gastroflow.com"
                      className="w-full bg-transparent text-white outline-none placeholder:text-white/25"
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-2 text-sm text-red-400" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">Contraseña</label>
                  <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-white/5 px-4 py-3">
                    <Lock className="h-5 w-5 text-white/40" />
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className="w-full bg-transparent text-white outline-none placeholder:text-white/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-white/40 transition hover:text-orange-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-2 text-sm text-red-400" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 text-base font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogIn className="h-5 w-5" />
                  {isSubmitting ? "Validando acceso..." : "Entrar al panel"}
                </button>
              </Form>
            )}
          </Formik>
        </section>
      </main>
    </div>
  );
};

export default PlatformLoginForm;
