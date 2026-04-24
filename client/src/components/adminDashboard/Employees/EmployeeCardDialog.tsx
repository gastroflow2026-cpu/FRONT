"use client";

import { useState } from "react";
import styles from "./EmployeeCardDialog.module.css";
import { CreateEmployeePayload, EmployeeRole } from "@/types/Employee";

interface EmployeeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeePayload) => Promise<void> | void;
}

export function EmployeeFormDialog({ isOpen, onClose, onSubmit }: EmployeeFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    role: "" as EmployeeRole | "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) return;

    await onSubmit({
      ...formData,
      role: formData.role,
    });
    setFormData({ name: "", lastName: "", email: "", password: "", role: "" });
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Crear Nuevo Empleado</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nombre</label>
            <input
              className={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Apellido</label>
            <input
              className={styles.input}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              className={styles.input}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Rol</label>
            <select 
              className={styles.select}
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
              required
            >
              <option value="" disabled>Seleccionar rol</option>
              <option value="cocinero">Cocinero</option>
              <option value="cajero">Cajero</option>
              <option value="mesero">Mesero</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
              Crear Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
