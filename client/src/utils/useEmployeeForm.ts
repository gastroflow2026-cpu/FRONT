"use client";

import { useState, useCallback } from "react";
import { CreateEmployeePayload, EmployeeRole } from "@/types/Employee";

type FormState = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: EmployeeRole | "";
};

type ErrorsState = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  role: "",
};

const INITIAL_ERRORS: ErrorsState = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  role: "",
};

export function useEmployeeForm(
  onSubmit: (data: CreateEmployeePayload) => Promise<void> | void,
  onClose: () => void
) {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<ErrorsState>(INITIAL_ERRORS);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateField = useCallback((field: keyof FormState, value: string): string => {
    switch (field) {
      case "name":
        if (!value.trim()) return "El nombre es obligatorio";
        if (value.length > 20) return "Máximo 20 caracteres";
        return "";
      
      case "lastName":
        if (!value.trim()) return "El apellido es obligatorio";
        if (value.length > 20) return "Máximo 20 caracteres";
        return "";
      
      case "email":
        if (!value.trim()) return "El email es obligatorio";
        if (!/\S+@\S+\.\S+/.test(value)) return "Formato de email inválido";
        return "";
      
      case "password":
        if (!value) return "La contraseña es obligatoria";
        if (value.length < 8) return "Mínimo 8 caracteres";
        return "";
      
      case "role":
        return value ? "" : "Debes seleccionar un rol";
      
      default:
        return "";
    }
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const shouldValidate = submitted || errors[field as keyof ErrorsState];
    
    setErrors((prev) => {
      const newErrors = { ...prev };
      
      if (shouldValidate) {
        newErrors[field as keyof ErrorsState] = validateField(field, value);
      }
      
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    setSubmitted(true);
    
    const newErrors: ErrorsState = {
      name: validateField("name", formData.name),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      role: validateField("role", formData.role),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit({
      ...formData,
      role: formData.role as EmployeeRole,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData(INITIAL_STATE);
    setErrors(INITIAL_ERRORS);
    setSubmitted(false);
  };

  const clearFieldError = (field: keyof FormState) => {
    setErrors(prev => ({ ...prev, [field]: "" as any }));
  };

  return {
    formData,
    errors,
    showPassword,
    setShowPassword,
    updateField,
    handleSubmit,
    resetForm,
    clearFieldError,
  };
}