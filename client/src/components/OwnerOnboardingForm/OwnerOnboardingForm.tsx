"use client";

import { ChangeEvent, useContext } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import Image from "next/image";
import Swal from "sweetalert2";
import { Building2, FileText, Globe, ImageIcon, Mail, MapPin, Phone, Save, ScrollText } from "lucide-react";
import { UsersContext } from "@/context/UsersContext";
import {
  ownerOnboardingInitialValues,
  ownerOnboardingValidationSchema,
  OwnerOnboardingFormValues,
} from "@/validations/ownerOnboardingSchema";

type OwnerRestaurantOnboardingPayload = {
  name: string;
  slug?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  image_url?: string;
  description?: string;
  category?: string;
  about?: string;
};

const fieldClassName =
  "w-full rounded-xl border border-orange-500/30 bg-[#111526] px-4 py-3 text-white outline-none transition focus:border-orange-400";

export default function OwnerOnboardingForm() {
  const router = useRouter();
  const { completeOwnerOnboarding, uploadRestaurantVerificationDocument, isLogged } = useContext(UsersContext);

  const handleFileChange = (fieldName: keyof OwnerOnboardingFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    formik.setFieldValue(fieldName, file);
  };

  const getBackendMessage = (data: unknown) => {
    if (!data || typeof data !== "object") {
      return "No fue posible completar el onboarding del restaurante.";
    }

    const parsed = data as { message?: unknown; error?: unknown };

    if (Array.isArray(parsed.message)) {
      return parsed.message.map(String).join(" | ");
    }

    if (typeof parsed.message === "string") {
      return parsed.message;
    }

    if (typeof parsed.error === "string") {
      return parsed.error;
    }

    return "No fue posible completar el onboarding del restaurante.";
  };
  const formik = useFormik<OwnerOnboardingFormValues>({
    initialValues: ownerOnboardingInitialValues,
    validationSchema: ownerOnboardingValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { official_id, tax_or_business_document, proof_of_address, ...restaurantValues } = values;

        const payload = Object.fromEntries(
          Object.entries(restaurantValues).filter(([key, value]) => {
            if (key === "name") {
              return true;
            }

            return typeof value === "string" ? value.trim() !== "" : value !== undefined;
          }),
        );

        const result = await completeOwnerOnboarding(payload as OwnerRestaurantOnboardingPayload);
        const documentUploads = [
          {
            type: "official_id" as const,
            file: official_id,
          },
          {
            type: "tax_or_business_document" as const,
            file: tax_or_business_document,
          },
          {
            type: "proof_of_address" as const,
            file: proof_of_address,
          },
        ];

        for (const documentUpload of documentUploads) {
          if (!documentUpload.file) {
            throw new Error("DOCUMENT_FILE_REQUIRED");
          }

          const uploadResult = await uploadRestaurantVerificationDocument(documentUpload.type, documentUpload.file);

          if (uploadResult.status < 200 || uploadResult.status >= 300) {
            throw new Error("DOCUMENT_UPLOAD_FAILED");
          }
        }
        {
          localStorage.setItem("restaurantName", values.name.trim());

          await Swal.fire({
            theme: "dark",
            icon: "success",
            title: "Solicitud recibida",
            text: "Tu solicitud está en proceso de revisión. Estamos validando la información y documentos de tu restaurante. Te avisaremos cuando tu cuenta sea activada.",
            confirmButtonColor: "#f97316",
          });

          router.push("/admin");
          return;
        }

        const backendMessage = getBackendMessage(result.data);

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
      <div className="mx-auto w-full max-w-6xl rounded-4xl border border-white/10 bg-[#0b1020]/92 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:p-8">
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
              <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Configura tu restaurante</h1>
              <p className="text-sm leading-6 text-white/70 md:text-base">
                {isLogged?.name ? `Hola ${isLogged.name}. ` : ""}
                En este paso configuraras la informacion principal de tu restaurante. El nombre es obligatorio; los
                demas campos son opcionales y te permitiran dejar la ficha lista para comenzar a operar.
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
                  URL de la imagen del restaurante o plato destacado
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  placeholder="https://..."
                  className={fieldClassName}
                  value={formik.values.image_url}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.image_url && formik.errors.image_url && (
                  <p className="mt-2 text-sm text-red-400">{formik.errors.image_url}</p>
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

            <div>
              <label className="mb-2 text-sm font-semibold text-white/80">Categoria</label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="Ej: Italiana, Parrilla, Sushi..."
                maxLength={100}
                className={fieldClassName}
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
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
                rows={4}
                placeholder="Describe el concepto, la cocina o el valor diferencial del restaurante."
                className={`${fieldClassName} resize-none`}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div>
              <label className="mb-2 text-sm font-semibold text-white/80">About</label>
              <textarea
                id="about"
                name="about"
                rows={3}
                placeholder="Breve reseña sobre la historia o filosofia del restaurante."
                className={`${fieldClassName} resize-none`}
                value={formik.values.about}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/80">
                <FileText className="h-4 w-4 text-orange-300" />
                Documentación para verificación
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">
                    Identificación oficial del dueño o representante
                  </label>
                  <input
                    id="official_id"
                    name="official_id"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className={fieldClassName}
                    onChange={(event) => {
                      formik.setFieldValue("official_id", event.currentTarget.files?.[0] ?? null);
                    }}
                  />
                  {formik.touched.official_id && formik.errors.official_id && (
                    <p className="mt-2 text-sm text-red-400">{formik.errors.official_id}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">
                    Comprobante fiscal o documento comercial del restaurante
                  </label>
                  <input
                    id="tax_or_business_document"
                    name="tax_or_business_document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className={fieldClassName}
                    onChange={(event) => {
                      formik.setFieldValue("tax_or_business_document", event.currentTarget.files?.[0] ?? null);
                    }}
                  />
                  {formik.touched.tax_or_business_document && formik.errors.tax_or_business_document && (
                    <p className="mt-2 text-sm text-red-400">{formik.errors.tax_or_business_document}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">
                    Comprobante de domicilio del restaurante
                  </label>
                  <input
                    id="proof_of_address"
                    name="proof_of_address"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className={fieldClassName}
                    onChange={(event) => {
                      formik.setFieldValue("proof_of_address", event.currentTarget.files?.[0] ?? null);
                    }}
                  />
                  {formik.touched.proof_of_address && formik.errors.proof_of_address && (
                    <p className="mt-2 text-sm text-red-400">{formik.errors.proof_of_address}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              {formik.isSubmitting ? "Enviando solicitud..." : "Enviar solicitud de revisión"}{" "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
