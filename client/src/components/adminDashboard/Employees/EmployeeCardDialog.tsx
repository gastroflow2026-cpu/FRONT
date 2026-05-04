"use client";

import styles from "./EmployeeCardDialog.module.css";
import { Eye, EyeOff } from "lucide-react";
import { useEmployeeForm } from "@/utils/useEmployeeForm";

interface EmployeeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
}

export function EmployeeFormDialog({
  isOpen,
  onClose,
  onSubmit,
}: EmployeeFormDialogProps) {
  const {
    formData,
    errors,
    showPassword,
    setShowPassword,
    updateField,
    handleSubmit,
    resetForm,
  } = useEmployeeForm(onSubmit, onClose);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>Crear Nuevo Empleado</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Nombre */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nombre *</label>
            <input
              className={`${styles.input} ${
                errors.name ? styles.inputError : ""
              }`}
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ingresa el nombre"
            />
            {errors.name && (
              <p className={styles.errorMessage}>{errors.name}</p>
            )}
          </div>

          {/* Apellido */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Apellido *</label>
            <input
              className={`${styles.input} ${
                errors.lastName ? styles.inputError : ""
              }`}
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Ingresa el apellido"
            />
            {errors.lastName && (
              <p className={styles.errorMessage}>{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email *</label>
            <input
              type="email"
              className={`${styles.input} ${
                errors.email ? styles.inputError : ""
              }`}
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="ejemplo@correo.com"
            />
            {errors.email && (
              <p className={styles.errorMessage}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Contraseña *</label>

            <div className={styles.passwordField}>
              <input
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${
                  errors.password ? styles.inputError : ""
                }`}
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((prev: any) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className={styles.errorMessage}>{errors.password}</p>
            )}
          </div>

          {/* Rol */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Rol *</label>
            <select
              className={`${styles.select} ${
                errors.role ? styles.inputError : ""
              }`}
              value={formData.role}
              onChange={(e) => updateField("role", e.target.value)}
            >
              <option value="">Seleccionar rol</option>
              <option value="cocinero">Cocinero</option>
              <option value="cajero">Cajero</option>
              <option value="mesero">Mesero</option>
            </select>

            {errors.role && (
              <p className={styles.errorMessage}>{errors.role}</p>
            )}
          </div>

          {/* Acciones */}
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`${styles.btn} ${styles.btnSubmit}`}
              disabled={Object.values(errors).some(error => error !== "")}
            >
              Crear Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}