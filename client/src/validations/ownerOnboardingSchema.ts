import * as Yup from "yup";

export interface OwnerOnboardingFormValues {
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  image_url: string;
  description: string;
  category: string;
  about: string;
  official_id: File | null;
  tax_or_business_document: File | null;
  proof_of_address: File | null;
}

export const ownerOnboardingInitialValues: OwnerOnboardingFormValues = {
  name: "",
  slug: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "",
  image_url: "",
  description: "",
  category: "",
  about: "",
  official_id: null,
  tax_or_business_document: null,
  proof_of_address: null,
};

export const ownerOnboardingValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(100, "El nombre no puede superar los 100 caracteres")
    .required("El nombre del restaurante es obligatorio"),
  slug: Yup.string().trim().max(150, "El slug no puede superar los 150 caracteres"),
  phone: Yup.string().trim().max(20, "El telefono no puede superar los 20 caracteres"),
  email: Yup.string().trim().email("Ingresa un correo valido"),
  address: Yup.string().trim().max(150, "La direccion no puede superar los 150 caracteres"),
  city: Yup.string().trim().max(80, "La ciudad no puede superar los 80 caracteres"),
  country: Yup.string().trim().max(80, "El pais no puede superar los 80 caracteres"),
  image_url: Yup.string().trim(),
  description: Yup.string().trim(),
  category: Yup.string().trim().max(100, "La categoria no puede superar los 100 caracteres"),
  about: Yup.string().trim(),
  official_id: Yup.mixed<File>().required("La identificación oficial es obligatoria"),
  tax_or_business_document: Yup.mixed<File>().required("El comprobante fiscal o documento comercial es obligatorio"),
  proof_of_address: Yup.mixed<File>().required("El comprobante de domicilio es obligatorio"),
});
