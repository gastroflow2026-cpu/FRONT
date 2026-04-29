"use client";

import { useEffect, useState } from "react";
import styles from "./MenuItemDialog.module.css";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Category } from "@/types/Category";
import { MenuItem } from "@/types/MenuItem";

type Mode = "create" | "edit";

type Payload = {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  allergens: string;
  tags: string;
  prep_time_minutes: number;
  display_order: number;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Payload) => void;
  categories: Category[];
  mode: Mode;
  item?: MenuItem | null;
}

type FormState = {
  name: string;
  description: string;
  price: string;
  image: string;
  category_id: string;
  allergens: string;
  tags: string;
  prep_time_minutes: string;
  display_order: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  description: "",
  price: "",
  image: "",
  category_id: "",
  allergens: "",
  tags: "",
  prep_time_minutes: "15",
  display_order: "1",
};

export function MenuItemDialog({
  isOpen,
  onClose,
  onSubmit,
  categories,
  mode,
  item,
}: Props) {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);

  const [errors, setErrors] = useState({
    name: false,
    description: false,
    price: false,
    image_url: false,
    category_id: false,
  });

  useEffect(() => {
    if (mode === "edit" && item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        image: item.image ?? item.image_url ?? "",
        category_id: item.category_id ?? "",
        allergens: "",
        tags: "",
        prep_time_minutes: "15",
        display_order: "1",
      });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [mode, item]);

  if (!isOpen) return null;

  const updateField = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      price: !formData.price || parseFloat(formData.price) <= 0,
      image_url: !formData.image,
      category_id: !formData.category_id,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const resetAndClose = () => {
    setFormData(INITIAL_STATE);
    setErrors({
      name: false,
      description: false,
      price: false,
      image_url: false,
      category_id: false,
    });
    onClose();
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      ...(mode === "edit" && item ? { id: item.id } : {}),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category_id: formData.category_id,
      allergens: formData.allergens || "",
      tags: formData.tags || "",
      prep_time_minutes: parseInt(formData.prep_time_minutes) || 15,
      display_order: parseInt(formData.display_order) || 1,
    });

    resetAndClose();
  };

  const title =
    mode === "create" ? "Crear Nuevo Platillo" : "Editar Platillo";

  const submitText =
    mode === "create" ? "Crear Platillo" : "Guardar Cambios";

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && resetAndClose()}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* IMAGEN */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Imagen *</label>

            <ImageUpload
              value={formData.image}
              onChange={(url) => updateField("image", url)}
            />

            {errors.image_url && (
              <p className={styles.errorMessage}>La imagen es requerida</p>
            )}
          </div>

          {/* CATEGORÍA */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Categoría *</label>

            <select
              className={`${styles.input} ${
                errors.category_id ? styles.inputError : ""
              }`}
              value={formData.category_id}
              onChange={(e) => updateField("category_id", e.target.value)}
            >
              <option value="">Selecciona una categoría</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* NOMBRE + PRECIO */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nombre *</label>

              <input
                className={styles.input}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Precio *</label>

              <div className={styles.priceContainer}>
                <span className={styles.currencySymbol}>$</span>

                <input
                  type="number"
                  className={`${styles.input} ${styles.priceInput}`}
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Descripción *</label>

            <textarea
              className={styles.textarea}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          {/* OPCIONALES */}
          <div className={styles.optionalDivider}>
            <span>Opcionales</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Alérgenos</label>
            <input
              className={styles.input}
              value={formData.allergens}
              onChange={(e) => updateField("allergens", e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tags</label>
            <input
              className={styles.input}
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Tiempo (min)</label>
              <input
                type="number"
                className={styles.input}
                value={formData.prep_time_minutes}
                onChange={(e) =>
                  updateField("prep_time_minutes", e.target.value)
                }
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Orden</label>
              <input
                type="number"
                className={styles.input}
                value={formData.display_order}
                onChange={(e) =>
                  updateField("display_order", e.target.value)
                }
              />
            </div>
          </div>

          {/* ACTIONS */}
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
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}