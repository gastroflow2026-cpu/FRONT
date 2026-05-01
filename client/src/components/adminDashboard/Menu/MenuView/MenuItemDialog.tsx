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
    name: "",
    description: "",
    price: "",
    image: "",
    category_id: "",
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

    setErrors({
      name: "",
      description: "",
      price: "",
      image: "",
      category_id: "",
    });
  }, [mode, item]);

  if (!isOpen) return null;

  const updateField = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };

      switch (field) {
        case "name":
          newErrors.name = value.trim() ? "" : "El nombre es obligatorio";
          break;

        case "description":
          if (!value.trim()) {
            newErrors.description = "La descripción es obligatoria";
          } else if (value.length > 200) {
            newErrors.description = "Máximo 200 caracteres permitidos";
          } else {
            newErrors.description = "";
          }
          break;

        case "price":
          const price = Number(value);
          if (!value) {
            newErrors.price = "El precio es obligatorio";
          } else if (isNaN(price)) {
            newErrors.price = "Debe ser un número";
          } else if (price <= 0) {
            newErrors.price = "Debe ser mayor a 0";
          } else {
            newErrors.price = "";
          }
          break;

        case "category_id":
          newErrors.category_id = value
            ? ""
            : "Debes seleccionar una categoría";
          break;

        case "image":
          newErrors.image = value ? "" : "La imagen es obligatoria";
          break;
      }

      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      price: "",
      image: "",
      category_id: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    } else if (formData.description.length > 200) {
      newErrors.description =
        "La descripción no puede superar los 200 caracteres";
    }

    const price = Number(formData.price);

    if (!formData.price) {
      newErrors.price = "El precio es obligatorio";
    } else if (isNaN(price)) {
      newErrors.price = "El precio debe ser un número válido";
    } else if (price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }

    if (!formData.image) {
      newErrors.image = "La imagen es obligatoria";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Debes seleccionar una categoría";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  const resetAndClose = () => {
    setFormData(INITIAL_STATE);
    setErrors({
      name: "",
      description: "",
      price: "",
      image: "",
      category_id: "",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
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

  const title = mode === "create" ? "Crear Nuevo Platillo" : "Editar Platillo";
  const submitText = mode === "create" ? "Crear Platillo" : "Guardar Cambios";

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && resetAndClose()}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Imagen *</label>

            <ImageUpload
              value={formData.image}
              onChange={(url) => updateField("image", url)}
            />

            {errors.image && (
              <p className={styles.errorMessage}>{errors.image}</p>
            )}
          </div>

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

            {errors.category_id && (
              <p className={styles.errorMessage}>{errors.category_id}</p>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nombre *</label>

              <input
                className={`${styles.input} ${
                  errors.name ? styles.inputError : ""
                }`}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />

              {errors.name && (
                <p className={styles.errorMessage}>{errors.name}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Precio *</label>

              <div className={styles.priceContainer}>
                <span className={styles.currencySymbol}>$</span>

                <input
                  type="number"
                  className={`${styles.input} ${styles.priceInput} ${
                    errors.price ? styles.inputError : ""
                  }`}
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>

              {errors.price && (
                <p className={styles.errorMessage}>{errors.price}</p>
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
              onChange={(e) => updateField("description", e.target.value)}
            />

            <div className={styles.helperRow}>
              <span className={styles.charCount}>
                {formData.description.length}/200
              </span>
            </div>

            {errors.description && (
              <p className={styles.errorMessage}>{errors.description}</p>
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
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}