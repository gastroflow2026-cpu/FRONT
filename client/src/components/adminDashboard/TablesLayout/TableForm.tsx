"use client";

import { FormEvent, useEffect, useState } from "react";
import { CreateTablePayload, Table, TableLayoutShape, UpdateTablePayload } from "@/context/TablesContext";
import styles from "./TablesLayout.module.css";

const SHAPE_OPTIONS: { value: TableLayoutShape; label: string }[] = [
  { value: "square", label: "Cuadrada" },
  { value: "round", label: "Redonda" },
  { value: "rectangle", label: "Rectangular" },
];

interface TableFormProps {
  table?: Table | null;
  onCancel: () => void;
  onCreate: (payload: CreateTablePayload) => Promise<void>;
  onUpdate: (tableId: string, payload: UpdateTablePayload) => Promise<void>;
}

const getInitialState = (table?: Table | null) => ({
  table_number: table?.table_number?.toString() ?? "",
  capacity: table?.capacity?.toString() ?? "2",
  zone: table?.zone ?? "",
  layout_shape: table?.layout_shape ?? "square",
  is_visible: table?.is_visible ?? true,
  is_active: table?.is_active ?? true,
});

export function TableForm({ table, onCancel, onCreate, onUpdate }: TableFormProps) {
  const [formData, setFormData] = useState(getInitialState(table));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(getInitialState(table));
    setError("");
  }, [table]);

  const isEditing = Boolean(table);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const tableNumber = Number(formData.table_number);
    const capacity = Number(formData.capacity);

    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
      setError("El numero de mesa debe ser mayor a 0.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      setError("La capacidad debe ser mayor a 0.");
      return;
    }

    if (!formData.zone.trim()) {
      setError("La zona es obligatoria.");
      return;
    }

    const payload: CreateTablePayload = {
      table_number: tableNumber,
      capacity,
      zone: formData.zone.trim(),
      layout_shape: formData.layout_shape,
      is_visible: formData.is_visible,
      is_active: formData.is_active,
    };

    setIsSaving(true);

    try {
      if (table) {
        await onUpdate(table.id, payload);
      } else {
        await onCreate(payload);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo guardar la mesa.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={styles.formPanel} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <div>
          <h3>{isEditing ? "Editar mesa" : "Crear mesa"}</h3>
          {!isEditing && <p>Al crearla sin posicion, debe ubicarse despues en la grilla.</p>}
        </div>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          Cancelar
        </button>
      </div>

      <div className={styles.formGrid}>
        <label>
          Numero de mesa
          <input
            type="number"
            min={1}
            value={formData.table_number}
            onChange={(event) => setFormData((prev) => ({ ...prev, table_number: event.target.value }))}
          />
        </label>

        <label>
          Capacidad
          <input
            type="number"
            min={1}
            value={formData.capacity}
            onChange={(event) => setFormData((prev) => ({ ...prev, capacity: event.target.value }))}
          />
        </label>

        <label>
          Zona
          <input
            type="text"
            value={formData.zone}
            onChange={(event) => setFormData((prev) => ({ ...prev, zone: event.target.value }))}
            placeholder="Salon principal"
          />
        </label>

        <label>
          Forma
          <select
            value={formData.layout_shape}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, layout_shape: event.target.value as TableLayoutShape }))
            }
          >
            {SHAPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.checkRow}>
        <label>
          <input
            type="checkbox"
            checked={formData.is_visible}
            onChange={(event) => setFormData((prev) => ({ ...prev, is_visible: event.target.checked }))}
          />
          Visible para comensal
        </label>

        <label>
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(event) => setFormData((prev) => ({ ...prev, is_active: event.target.checked }))}
          />
          Activa
        </label>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton} disabled={isSaving}>
          {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear mesa"}
        </button>
      </div>
    </form>
  );
}
