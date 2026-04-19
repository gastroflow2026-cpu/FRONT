"use client";

import { Edit, Trash2 } from "lucide-react";
import styles from "./MenuItemCard.module.css";
import { statusConfig } from "./statusConfig/statusConfig";
import { MenuItemCardProps } from "@/types/Props/MenuItemCardProps";

export function MenuItemCard({ item, onEdit, onDelete, onStatusChange }: MenuItemCardProps) {
  const config = statusConfig[item.status];
  const badgeClass = styles[config.statusKey];
  const dotClass = styles[`${config.statusKey}Dot`];

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {item.image && (
          <img src={item.image} alt={item.name} className={styles.image} />
        )}
        <div className={`${styles.statusBadge} ${badgeClass}`}>
          <div className={`${styles.indicator} ${dotClass}`} />
          {config.label}
        </div>
      </div>

      <div className={styles.content}>
        <div>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.description}>{item.description}</p>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>${item.price.toFixed(2)}</span>
          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => onEdit(item.id)}>
              <Edit size={16} />
            </button>
            <button 
              className={`${styles.iconBtn} ${styles.btnDelete}`} 
              onClick={() => onDelete(item.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className={styles.statusSelector}>
          <label className={styles.label}>Estado del platillo</label>
          <select
            className={styles.select}
            value={item.status}
            style={{ "--status-dot-color": config.colorHex } as React.CSSProperties}
            onChange={(e) => onStatusChange(item.id, e.target.value as any)}
          >
            <option value="disponible">Disponible</option>
            <option value="agotado">Agotado</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>
    </div>
  );
}