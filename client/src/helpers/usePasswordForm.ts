"use client";

import { useState } from "react";
import { passwordSchema } from "@/validations/passwordSchema";
import Swal from "sweetalert2";
import axios from "axios";
import { getAuthHeaders } from "@/services/adminService";

export const usePasswordForm = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateField = async (name: string, value: string) => {
    try {
      await passwordSchema.validateAt(name, { ...form, [name]: value })

      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        [name]: err.message,
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    validateField(name, value)

    if (name === "newPassword" && form.confirmNewPassword) {
      validateField("confirmNewPassword", form.confirmNewPassword)
    }
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()

    try {
      setErrors({})

      await passwordSchema.validate(form, { abortEarly: false })

      const confirmResult = await Swal.fire({
        theme: "dark",
        title: "¿Seguro que quieres cambiar la contraseña?",
        text: "Se actualizará tu contraseña de acceso.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
      })

      if (!confirmResult.isConfirmed) {
        return
      }

      setIsLoading(true)

      const token = getAuthHeaders()

      await axios.patch(
        `${API_URL}/users/updatepassword`,
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        token
      )

      Swal.fire({
        theme: "dark",
        title: "Éxito!",
        text: "Contraseña actualizada correctamente",
        icon: "success",
      })

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      })

    } catch (err: any) {
      const newErrors: Record<string, string> = {}

      if (err?.name === "ValidationError" && err.inner) {
        err.inner.forEach((error: any) => {
          newErrors[error.path] = error.message
        })

        setErrors(newErrors)
        return
      }

      Swal.fire({
        theme: "dark",
        title: "Error!",
        text: "Error actualizando contraseña",
        icon: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  }
}