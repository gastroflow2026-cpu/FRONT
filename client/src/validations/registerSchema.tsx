import * as Yup from "yup";

//Definiciones de Interfas
export interface RegisterFormValues {
  first_name: string;
  last_name:string;
  email: string;
  password: string;
  confirmPassword: string;
}

//Valores iniciales del formulario
export const registerInitialValues: RegisterFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

//Esquema de validaciones
export const registerValidationSchema = Yup.object({
  first_name: Yup.string().required("Nombre Requerido"),
  last_name:  Yup.string().required("Apellido Requerido"),
  email: Yup.string()
    .email("Formato de Correo Invalido")
    .required("Correo obligatorio"),
  password: Yup.string()
    .min(6, "La contrasela debe tener al meenos 6 caracteres")
    .required("Contraseña Requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")])
    .required("Confirmación Requerida")
});
