import * as Yup from "yup";

//Definiciones de Interfas
export interface RegisterFormValues {
  first_name: string;
  last_name: string;
  city: string;
  country: string;
  email: string;
  password: string;
  confirmPassword: string;
}

//Valores iniciales del formulario
export const registerInitialValues: RegisterFormValues = {
  first_name: "",
  last_name: "",
  city: "",
  country: "",
  email: "",
  password: "",
  confirmPassword: "",
};

//Esquema de validaciones
export const registerValidationSchema = Yup.object({
  first_name: Yup.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(20, "El nombre no puede superar los 20 caracteres")
    .required("Nombre Requerido"),
  last_name: Yup.string()
    .min(3, "El apellido debe tener al menos 3 caracteres")
    .max(60, "El apellido no puede superar los 60 caracteres")
    .required("Apellido Requerido"),
  city: Yup.string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(15, "La ciudad no puede superar los 15 caracteres")
    .required("Ciudad requerida"),
  country: Yup.string()
    .min(2, "El país debe tener al menos 2 caracteres")
    .max(15, "El país no puede superar los 15 caracteres")
    .required("País requerido"),
  email: Yup.string()
    .email("Formato de Correo Invalido")
    .required("Correo obligatorio"),
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(15, "La contraseña no puede superar los 15 caracteres")
    .matches(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula")
    .matches(/[a-z]/, "La contraseña debe incluir al menos una minúscula")
    .matches(/[0-9]/, "La contraseña debe incluir al menos un número")
    .matches(
      /[^A-Za-z0-9]/,
      "La contraseña debe incluir al menos un carácter especial",
    )
    .required("Contraseña Requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirmación Requerida"),
});
