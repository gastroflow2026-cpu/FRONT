"use client";

import { useState } from "react";
import styles from "./MenuItemDialog.module.css";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface MenuItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: any) => void;
}

export function MenuItemFormDialog({ isOpen, onClose, onSubmit }: MenuItemFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    status: "disponible",
  });

  const [errors, setErrors] = useState({
    name: false,
    description: false,
    price: false,
    image: false,
  });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      price: !formData.price || parseFloat(formData.price) <= 0,
      image: !formData.image,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const resetAndClose = () => {
    setFormData({ name: "", description: "", price: "", image: "", status: "disponible" });
    setErrors({ name: false, description: false, price: false, image: false });
    onClose();
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
    });
    resetAndClose();
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && resetAndClose()}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Crear Nuevo Platillo</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Imagen del Platillo *</label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />
            {errors.image && <p className={styles.errorMessage}>La imagen es requerida</p>}
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Título del Platillo *</label>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Paella Valenciana"
              />
              {errors.name && <p className={styles.errorMessage}>El título es requerido</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Precio *</label>
              <div className={styles.priceContainer}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="number"
                  step="0.01"
                  className={`${styles.input} ${styles.priceInput} ${errors.price ? styles.inputError : ""}`}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className={styles.errorMessage}>Precio inválido</p>}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Descripción *</label>
            <textarea
              className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el platillo..."
              rows={4}
            />
            {errors.description && <p className={styles.errorMessage}>La descripción es requerida</p>}
          </div>

          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={resetAndClose}>
              Cancelar
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
              Crear Platillo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}