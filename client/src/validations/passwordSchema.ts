import * as Yup from "yup"

export const passwordSchema = Yup.object().shape({
    newPass: Yup 
        .string()
        .required("La contraseña es obligatoria")
        .min(6, "Debe tener al menos 6 caracteres"),
    confirmPass: Yup
        .string()
        .required("Debes confirmar la contraseña")
        .oneOf([Yup.ref("newPass")], "Las contraseñas no coinciden")
})