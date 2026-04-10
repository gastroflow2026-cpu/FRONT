import * as Yup from 'yup';

export interface LoginFormValues {
    email: string;
    password: string;
    rememberMe: boolean;
}

export const loginInitialValues: LoginFormValues = {
    email: '',
    password: '',
    rememberMe: false,
};

export const loginValidationSchema = Yup.object({
    email: Yup.string()
        .email("Formato de correo invalido")
        .required("El correo es obligatorio"),
    password: Yup.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(20, "La contraseña no puede superar los 20 caracteres")
        .required("La contraseña es obligatoria"),
    rememberMe: Yup.boolean(),
});