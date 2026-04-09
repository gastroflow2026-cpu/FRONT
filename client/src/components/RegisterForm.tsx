"use client";
import { RegisterUser } from "@/services/auth.services";
import {
  RegisterFormValues,
  registerInitialValues,
  registerValidationSchema,
} from "@/validations/registerSchema";
import { useFormik } from "formik";
export default function RegisterForm() {
  const formik = useFormik<RegisterFormValues>({
    initialValues: registerInitialValues,
    validationSchema: registerValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      const response = await RegisterUser(values);
      console.log("Registro OK en BACK", response);
      resetForm();
    },
  });

  return (
    <div>
      {/* Formularo de Registro de usuario */}
      <form onSubmit={formik.handleSubmit}>
        <div>
          <label htmlFor="">Nombre</label>
          <input id="name" name="name" type="text" required />
          <label htmlFor="">Correo</label>
          <input id="email" name="email" type="email" required />
          <label htmlFor="">Contraseña</label>
          <input id="password" name="password" type="password" required />
          <label htmlFor="">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="confirmPassword"
            required
          />
          <label htmlFor="">Dirección</label>
          <input id="address" name="address" type="text" />
          <label htmlFor="">Teléfono</label>
          <input id="phone" name="phone" type="number" />
          <button type="submit">Registrar</button>
          <p>
            ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
          </p>
        </div>
      </form>
    </div>
  );
}
