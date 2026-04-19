"use client";

import styles from "./Password.module.css";
import { usePasswordForm } from "@/helpers/usePasswordForm";

export const Password = () => {
  const { form, errors, isLoading, handleChange, handleSubmit } =
    usePasswordForm();

  return (
    <div className={styles.passBox}>
      <form onSubmit={handleSubmit} className={styles.passForm}>
        <h3>Actualizar Contraseña</h3>
        <div className={styles.inputBox}>
          <label htmlFor="newPass">Nueva Contraseña</label>
          <input
            type="password"
            id="newPass"
            value={form.newPass}
            onChange={handleChange}
          />
          <span
            className={`${styles.error} ${errors.newPass ? styles.active : ""}`}
          >
            {errors.newPass || ""}
          </span>
        </div>
        <div className={styles.inputBox}>
          <label htmlFor="confirmPass">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPass"
            value={form.confirmPass}
            onChange={handleChange}
          />
          <span
            className={`${styles.error} ${errors.confirmPass ? styles.active : ""}`}
          >
            {errors.confirmPass || ""}
          </span>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </form>
    </div>
  );
};
