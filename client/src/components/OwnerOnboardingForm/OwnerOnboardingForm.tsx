"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import Image from "next/image";
import Swal from "sweetalert2";
import { Building2, Globe, ImageIcon, Mail, MapPin, Phone, Save, ScrollText } from "lucide-react";
import { UsersContext } from "@/context/UsersContext";
import {
  ownerOnboardingInitialValues,
  ownerOnboardingValidationSchema,
  OwnerOnboardingFormValues,
} from "@/validations/ownerOnboardingSchema";

const fieldClassName =
  "w-full rounded-xl border border-orange-500/30 bg-[#111526] px-4 py-3 text-white outline-none transition focus:border-orange-400";

export default function OwnerOnboardingForm() {
  const router = useRouter();
  const { completeOwnerOnboarding, isLogged } = useContext(UsersContext);

  const formik = useFormik<OwnerOnboardingFormValues>({
    initialValues: ownerOnboardingInitialValues,
    validationSchema: ownerOnboardingValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = Object.fromEntries(
          Object.entries(values).filter(([key, value]) => {
            if (key === "name" || key === "is_active") {
              return true;
            }

            return typeof value === "string" ? value.trim() !== "" : value !== undefined;
          }),
        );

        const result = await completeOwnerOnboarding(payload);

        if (
          (result.status === 200 || result.status === 201) &&
          result.data &&
          "user" in result.data
        ) {
          localStorage.setItem("restaurantName", values.name.trim());

          await Swal.fire({
            theme: "dark",
            icon: "success",
            title: "Restaurante creado",
            text: "Tu restaurante fue configurado correctamente.",
            confirmButtonColor: "#f97316",
          });

          router.push("/admin");
          return;
        }

        const backendMessage =
          result.data &&
          "message" in result.data &&
          typeof result.data.message === "string"
            ? result.data.message
            : "No fue posible completar el onboarding del restaurante.";

        await Swal.fire({
          theme: "dark",
          icon: "error",
          title: "No se pudo continuar",
          text: backendMessage,
          confirmButtonColor: "#f97316",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#120b18_0%,#0d1224_45%,#090d1b_100%)] px-4 py-4 lg:flex lg:items-center">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-white/10 bg-[#0b1020]/92 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:p-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
              <Image
                src="/gastroflow-logo.png"
                alt="Logo GastroFlow"
                width={76}
                height={76}
                className="h-14 w-auto"
                priority
              />
            </div>

            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-300">
                <Building2 className="h-4 w-4" />
                Onboarding del restaurante
              </div>
              <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                Configura tu restaurante
              </h1>
              <p className="text-sm leading-6 text-white/70 md:text-base">
                {isLogged?.name ? `Hola ${isLogged.name}. ` : ""}
                Este paso usa el contrato real de creacion de restaurante del backend.
                Solo el nombre es obligatorio; el resto te ayuda a dejar la ficha lista
                para operar.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                <Building2 className="h-4 w-4 text-orange-300" />
                Nombre del restaurante
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Bistro Central"
                maxLength={100}
                className={fieldClassName}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-2 text-sm text-red-400">{formik.errors.name}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Globe className="h-4 w-4 text-orange-300" />
                  Slug
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="bistro-central"
                  maxLength={150}
                  className={fieldClassName}
                  value={formik.values.slug}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.slug && formik.errors.slug && (
                  <p className="mt-2 text-sm text-red-400">{formik.errors.slug}</p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Phone className="h-4 w-4 text-orange-300" />
                  Telefono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="+54 11 1234 5678"
                  maxLength={20}
                  className={fieldClassName}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Mail className="h-4 w-4 text-orange-300" />
                  Email del restaurante
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contacto@bistro.com"
                  className={fieldClassName}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-2 text-sm text-red-400">{formik.errors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <ImageIcon className="h-4 w-4 text-orange-300" />
                  URL del logo
                </label>
                <input
                  id="logo_url"
                  name="logo_url"
                  type="url"
                  placeholder="https://..."
                  className={fieldClassName}
                  value={formik.values.logo_url}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.logo_url && formik.errors.logo_url && (
                  <p className="mt-2 text-sm text-red-400">{formik.errors.logo_url}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                <MapPin className="h-4 w-4 text-orange-300" />
                Direccion
              </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Av. Corrientes 1234"
                  maxLength={150}
                  className={fieldClassName}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 text-sm font-semibold text-white/80">Ciudad</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Buenos Aires"
                  maxLength={80}
                  className={fieldClassName}
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div>
                <label className="mb-2 text-sm font-semibold text-white/80">Pais</label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Argentina"
                  maxLength={80}
                  className={fieldClassName}
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                <ScrollText className="h-4 w-4 text-orange-300" />
                Descripcion
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                placeholder="Describe el concepto, la cocina o el valor diferencial del restaurante."
                className={`${fieldClassName} resize-none`}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/75">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-orange-500"
                checked={formik.values.is_active}
                onChange={formik.handleChange}
              />
              <span>
                <strong className="block text-white">Restaurante activo</strong>
                Marca esta opcion si quieres crear el restaurante con estado activo.
              </span>
            </label>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              {formik.isSubmitting ? "Creando restaurante..." : "Finalizar onboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
