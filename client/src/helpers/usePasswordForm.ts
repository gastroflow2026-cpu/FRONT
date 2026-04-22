"use client";

import { useState } from "react";
import { passwordSchema } from "@/validations/passwordSchema";
import Swal from "sweetalert2";
import axios from "axios";

export const usePasswordForm = () => {
  const [form, setForm] = useState({
    newPass: "",
    confirmPass: "",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = async (name: string, value: string) => {
    try {
      await passwordSchema.validateAt(name, { ...form, [name]: value });

      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        [name]: err.message,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));

    validateField(id, value);

    if (id === "newPass" && form.confirmPass) {
      validateField("confirmPass", form.confirmPass);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      setIsLoading(true);
      setErrors({});

      await passwordSchema.validate(form, { abortEarly: false });

      await axios.patch(
        `${API_URL}/users/updatepassword`,
        {
          password: form.confirmPass,
        },
        {
          headers: {
            // Es vital que diga 'Bearer ' seguido del token limpio
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.fire({
        theme: "dark",
        title: "Éxito!",
        text: "Contraseña actualizada correctamente",
        icon: "success",
      });
    } catch (err: any) {
      const newErrors: Record<string, string> = {};

      if (err.inner) {
        err.inner.forEach((error: any) => {
          newErrors[error.path] = error.message;
        });
      }

      Swal.fire({
        theme: "dark",
        title: "Error!",
        text: "Error actualizando contraseña",
        icon: "error",
      });

      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  };
};
