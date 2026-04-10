import * as Yup from "yup";

//Definiciones de Interfas
export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
}

//Valores iniciales del formulario
export const registerInitialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  phone: "",
};

//Esquema de validaciones
export const registerValidationSchema = Yup.object({
  name: Yup.string().required("Nombre Requerido"),
  email: Yup.string()
    .email("Formato de Correo Invalido")
    .required("Correo obligatorio"),
  password: Yup.string()
    .min(6, "La contrasela debe tener al meenos 6 caracteres")
    .required("Contraseña Requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")])
    .required("Confirmación Requerida"),
  address: Yup.string(),
  phone: Yup.string()
    .matches(
      /^[0-9+\-\s()]+$/,
      "El telefono debe contener solo numeros y caracteres válidos",
    )
    .min(10, "El Teléfono debe tener al menos 10 caracteres"),
});
