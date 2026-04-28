"use client";

import { useState } from "react";
import styles from "./MenuItemDialog.module.css";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MenuCategory } from "@/types/MenuItem";
import { Category } from "@/types/Category";

type CreateMenuItemPayload = {
  name: string;
  description: string;
  price: number;
  image_url: string;
  status: "disponible";
  category_id: string;
};
interface MenuItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: CreateMenuItemPayload) => void;
  categories: Category[]; // ← Category en lugar de MenuCategory
}

export function MenuItemFormDialog({
  isOpen,
  onClose,
  onSubmit,
  categories,
}: MenuItemFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    status: "disponible",
    category_id: "",
  });

  const [errors, setErrors] = useState({
    name: false,
    description: false,
    price: false,
    image_url: false,
    category_id: false,
  });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      price: !formData.price || parseFloat(formData.price) <= 0,
      image_url: !formData.image_url,
      category_id: !formData.category_id,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const resetAndClose = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      status: "disponible",
      category_id: "",
    });

    setErrors({
      name: false,
      description: false,
      price: false,
      image_url: false,
      category_id: false,
    });

    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: formData.image_url,
      status: "disponible",
      category_id: formData.category_id,
    });

    resetAndClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && resetAndClose()}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>Crear Nuevo Platillo</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Imagen del Platillo *</label>

            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />

            {errors.image_url && (
              <p className={styles.errorMessage}>La imagen es requerida</p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="category_id">
              Categoría *
            </label>
            <select
              id="category_id"
              name="category_id"
              className={`${styles.input} ${
                errors.category_id ? styles.inputError : ""
              }`}
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
            >
              <option value="">Selecciona una categoría</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {errors.category_id && (
              <p className={styles.errorMessage}>La categoría es requerida</p>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Título del Platillo *</label>

              <input
                className={`${styles.input} ${
                  errors.name ? styles.inputError : ""
                }`}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Paella Valenciana"
              />

              {errors.name && (
                <p className={styles.errorMessage}>El título es requerido</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Precio *</label>

              <div className={styles.priceContainer}>
                <span className={styles.currencySymbol}>$</span>

                <input
                  type="number"
                  step="0.01"
                  className={`${styles.input} ${styles.priceInput} ${
                    errors.price ? styles.inputError : ""
                  }`}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              {errors.price && (
                <p className={styles.errorMessage}>Precio inválido</p>
              )}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Descripción *</label>

            <textarea
              className={`${styles.textarea} ${
                errors.description ? styles.inputError : ""
              }`}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe el platillo..."
              rows={4}
            />

            {errors.description && (
              <p className={styles.errorMessage}>La descripción es requerida</p>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={resetAndClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`${styles.btn} ${styles.btnSubmit}`}
            >
              Crear Platillo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
