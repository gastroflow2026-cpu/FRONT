"use client";

import { useState, useEffect } from "react";
import styles from "./CategoryFormDialog.module.css";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: {
    id?: string;
    name: string;
    description?: string;
  }) => void;
  category?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  mode: "create" | "edit";
}

export function CategoryFormDialog({
  isOpen,
  onClose,
  onSubmit,
  category,
  mode,
}: CategoryFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && category) {
        setFormData({
          name: category.name,
          description: category.description || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
        });
      }
      setError("");
    }
  }, [mode, category, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("El nombre de la categoría es requerido");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...(mode === "edit" && category ? { id: category.id } : {}),
      name: formData.name,
      description: formData.description,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setError("");
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>
            {mode === "create" ? "Crear Nueva Categoría" : "Editar Categoría"}
          </h2>
          <p>
            {mode === "create"
              ? "Crea una nueva categoría para organizar los platillos del menú."
              : "Modifica la información de la categoría."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* NOMBRE */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="category-name">
              Nombre de la Categoría *
            </label>
            <input
              id="category-name"
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Entradas, Postres..."
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>

          {/* DESCRIPCIÓN */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Descripción</label>
            <input
              className={styles.input}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ej: Opciones principales del menú"
            />
          </div>

          {/* BOTONES */}
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnSubmit}`}
            >
              {mode === "create" ? "Crear Categoría" : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
