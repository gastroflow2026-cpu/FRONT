"use client";

import styles from "./Password.module.css";
import { usePasswordForm } from "@/helpers/usePasswordForm";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const Password = () => {
  const { form, errors, isLoading, handleChange, handleSubmit } =
    usePasswordForm();

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  return (
    <div className={styles.passBox}>
      <form onSubmit={handleSubmit} className={styles.passForm}>
        <h3 className={styles.title}>Actualizar Contraseña</h3>

        {/* Nueva Contraseña */}
        <div className={styles.inputGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            Nueva Contraseña
          </label>
          <div className={styles.fieldWrapper}>
            <input
              type={showNewPass ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowNewPass(!showNewPass)}
              aria-label="Mostrar contraseña"
            >
              {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <span
            className={`${styles.error} ${errors.newPassword ? styles.active : ""}`}
          >
            {errors.newPassword}
          </span>
        </div>

        {/* Confirmar Contraseña */}
        <div className={styles.inputGroup}>
          <label htmlFor="confirmNewPassword" className={styles.label}>
            Confirmar Contraseña
          </label>
          <div className={styles.fieldWrapper}>
            <input
              type={showConfirmPass ? "text" : "password"}
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={form.confirmNewPassword}
              onChange={handleChange}
              className={`${styles.input} ${errors.confirmNewPassword ? styles.inputError : ""}`}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              aria-label="Mostrar contraseña"
            >
              {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <span
            className={`${styles.error} ${errors.confirmNewPassword ? styles.active : ""}`}
          >
            {errors.confirmNewPassword}
          </span>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? "Guardando cambios..." : "Actualizar Contraseña"}
        </button>
      </form>
    </div>
  );
};
