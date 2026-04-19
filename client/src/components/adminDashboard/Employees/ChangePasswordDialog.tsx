"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import styles from "./ChangePasswordDialog.module.css";
import { Password } from "@/components/perfil/Password";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employeeId: string, newPassword: string) => void;
  employeeName: string;
  employeeId: string;
}

export function ChangePasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  employeeName,
  employeeId,
}: ChangePasswordDialogProps) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = { newPassword: "", confirmPassword: "" };

    if (!formData.newPassword) {
      newErrors.newPassword = "La contraseña es requerida";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mínimo 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la contraseña";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(employeeId, formData.newPassword);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ newPassword: "", confirmPassword: "" });
    setErrors({ newPassword: "", confirmPassword: "" });
    setShowPassword({ new: false, confirm: false });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>
        <Password />
      </div>
    </div>
  );
}