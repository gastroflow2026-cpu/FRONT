import * as Yup from "yup";

export interface OwnerRegisterFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const ownerRegisterInitialValues: OwnerRegisterFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const ownerRegisterValidationSchema = Yup.object({
  first_name: Yup.string().trim().required("El nombre es obligatorio"),
  last_name: Yup.string().trim().required("El apellido es obligatorio"),
  email: Yup.string()
    .email("Ingresa un correo valido")
    .required("El correo es obligatorio"),
  password: Yup.string()
    .min(6, "La contrasena debe tener al menos 6 caracteres")
    .max(50, "La contrasena no puede superar los 50 caracteres")
    .required("La contrasena es obligatoria"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contrasenas no coinciden")
    .required("La confirmacion es obligatoria"),
});
