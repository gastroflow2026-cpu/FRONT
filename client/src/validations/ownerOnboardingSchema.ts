import * as Yup from "yup";

export interface OwnerOnboardingFormValues {
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  logo_url: string;
  description: string;
  category: string;
  about: string;
  is_active: boolean;
}

export const ownerOnboardingInitialValues: OwnerOnboardingFormValues = {
  name: "",
  slug: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "",
  logo_url: "",
  description: "",
  category: "",
  about: "",
  is_active: true,
};

export const ownerOnboardingValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(100, "El nombre no puede superar los 100 caracteres")
    .required("El nombre del restaurante es obligatorio"),
  slug: Yup.string()
    .trim()
    .max(150, "El slug no puede superar los 150 caracteres"),
  phone: Yup.string()
    .trim()
    .max(20, "El telefono no puede superar los 20 caracteres"),
  email: Yup.string().trim().email("Ingresa un correo valido"),
  address: Yup.string()
    .trim()
    .max(150, "La direccion no puede superar los 150 caracteres"),
  city: Yup.string()
    .trim()
    .max(80, "La ciudad no puede superar los 80 caracteres"),
  country: Yup.string()
    .trim()
    .max(80, "El pais no puede superar los 80 caracteres"),
  logo_url: Yup.string().trim(),
  description: Yup.string().trim(),
  category: Yup.string().trim().max(100, "La categoria no puede superar los 100 caracteres"),
  about: Yup.string().trim(),
  is_active: Yup.boolean(),
});
