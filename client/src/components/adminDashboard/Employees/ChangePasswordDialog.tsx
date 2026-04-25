"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import styles from "./ChangePasswordDialog.module.css";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employeeId: string, newPassword: string) => Promise<void> | void;
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({ newPassword: "", confirmPassword: "" });
    setErrors({ newPassword: "", confirmPassword: "" });
    setShowPassword({ new: false, confirm: false });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(employeeId, formData.newPassword);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} type="button">
          <X size={20} />
        </button>

        <h2 className={styles.title}>Cambiar contraseña</h2>
        <p className={styles.subtitle}>{employeeName}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nueva contraseña</label>
            <div className={styles.passwordField}>
              <input
                className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}
                type={showPassword.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                aria-label="Mostrar contraseña"
              >
                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && <span className={styles.error}>{errors.newPassword}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Confirmar contraseña</label>
            <div className={styles.passwordField}>
              <input
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                type={showPassword.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                aria-label="Mostrar contraseña"
              >
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
          </div>

          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
