import * as Yup from "yup"

export const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required("La contraseña actual es obligatoria"),

  newPassword: Yup.string()
    .required("La contraseña nueva es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(15, "La contraseña no puede superar los 15 caracteres")
    .matches(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula")
    .matches(/[a-z]/, "La contraseña debe incluir al menos una minúscula")
    .matches(/[0-9]/, "La contraseña debe incluir al menos un número")
    .matches(
      /[^A-Za-z0-9]/,
      "La contraseña debe incluir al menos un carácter especial",
    ),

  confirmNewPassword: Yup.string()
    .required("Debes confirmar la contraseña")
    .oneOf([Yup.ref("newPassword")], "Las contraseñas no coinciden"),
})