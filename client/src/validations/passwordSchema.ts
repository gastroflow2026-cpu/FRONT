import * as Yup from "yup"

export const passwordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("La contraseña es obligatoria")
    .min(6, "Debe tener al menos 6 caracteres"),

  confirmNewPassword: Yup.string()
    .required("Debes confirmar la contraseña")
    .oneOf([Yup.ref("newPassword")], "Las contraseñas no coinciden"),
})