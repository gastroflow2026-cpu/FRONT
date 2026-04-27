"use client";

import { Edit, Trash2 } from "lucide-react";
import styles from "./MenuItemCard.module.css";
import { MenuItem } from "@/types/MenuItem";

interface Props {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: MenuItem["status"]) => void;
}

export function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  const statusConfig = {
    disponible: {
      label: "Disponible",
      statusClass: styles.disponible,
      dotClass: styles.disponibleDot,
    },
    agotado: {
      label: "Agotado",
      statusClass: styles.agotado,
      dotClass: styles.agotadoDot,
    },
    inactivo: {
      label: "Inactivo",
      statusClass: styles.inactivo,
      dotClass: styles.inactivoDot,
    },
  };

  const currentStatus = statusConfig[item.status];

  return (
    <div className={styles.card}>
      {/* IMAGEN */}
      <div className={styles.imageSection}>
        {item.image ? (
          <img src={item.image} alt={item.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}

        {/* BADGE */}
        <div className={`${styles.floatingBadge} ${currentStatus.statusClass}`}>
          <div className={`${styles.dot} ${currentStatus.dotClass}`} />
          {currentStatus.label}
        </div>
      </div>

      {/* CONTENIDO */}
      <div className={styles.content}>
        <div className={styles.info}>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.description}>{item.description}</p>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <div className={styles.priceRow}>
            <span className={styles.price}>
              ${item.price.toLocaleString()}
            </span>

            <div className={styles.actionBtns}>
              <button
                className={styles.iconBtn}
                onClick={() => onEdit(item)}
                title="Editar"
              >
                <Edit size={16} />
              </button>

              <button
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete(item.id)}
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* STATUS */}
          <div className={styles.statusField}>
            <label className={styles.statusLabel}>
              Estado del platillo
            </label>

            <select
              className={styles.select}
              value={item.status}
              onChange={(e) =>
                onStatusChange(item.id, e.target.value as MenuItem["status"])
              }
            >
              <option value="disponible">Disponible</option>
              <option value="agotado">Agotado</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}