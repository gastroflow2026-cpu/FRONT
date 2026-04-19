"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./EditMenuItemDialog.module.css";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface EditMenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    status: "disponible" | "agotado" | "inactivo";
  }) => void;
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    status: "disponible" | "agotado" | "inactivo";
  } | null;
}

export function EditMenuItemDialog({ isOpen, onClose, onSubmit, item }: EditMenuItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    status: "disponible" as "disponible" | "agotado" | "inactivo",
  });

  const [errors, setErrors] = useState({
    name: false,
    description: false,
    price: false,
    image: false,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        image: item.image,
        status: item.status,
      });
    }
  }, [item]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !item) return;

    onSubmit({
      id: item.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      status: formData.status,
    });
    onClose();
  };

  const handleClose = () => {
    setErrors({ name: false, description: false, price: false, image: false });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Editar Platillo</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Imagen */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Imagen del Platillo *</label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />
            {errors.image && <span className={styles.errorText}>La imagen es requerida</span>}
          </div>

          <div className={styles.grid}>
            {/* Título */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Título del Platillo *</label>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Paella Valenciana"
              />
              {errors.name && <span className={styles.errorText}>El título es requerido</span>}
            </div>

            {/* Precio */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Precio *</label>
              <div className={styles.priceWrapper}>
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
              {errors.price && <span className={styles.errorText}>Precio no válido</span>}
            </div>
          </div>

          {/* Descripción */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Descripción *</label>
            <textarea
              className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el platillo..."
              rows={3}
            />
            {errors.description && <span className={styles.errorText}>La descripción es requerida</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Estado del Platillo</label>
            <select
              className={styles.select}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="disponible">Disponible</option>
              <option value="agotado">Agotado</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          {/* Acciones */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}