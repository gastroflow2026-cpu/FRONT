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
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(15, "La contraseña no puede superar los 15 caracteres")
    .matches(/[a-z]/, "Debe incluir al menos una minúscula")
    .matches(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .matches(/[0-9]/, "Debe incluir al menos un número")
    .matches(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial")
    .required("La contraseña es obligatoria"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contrasenas no coinciden")
    .required("La confirmacion es obligatoria"),
});
