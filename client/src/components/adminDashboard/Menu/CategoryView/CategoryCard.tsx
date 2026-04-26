"use client";

import { Edit, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import styles from "./CategoryCard.module.css";
import { Category } from "@/types/Category";

interface CategoryCardProps {
  category: Category;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.infoSection}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{category.name}</h3>
        </div>
        <div className={styles.description}>
          <p>{category.description}</p>
        </div>

        <div className={styles.metadata}>
          <Calendar size={16} />
          <span>
            Creada el{" "}
            {format(new Date(category.createdAt), "PPP", { locale: es })}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.iconBtn}
          onClick={() => onEdit(category.id)}
        >
          <Edit size={18} />
        </button>

        <button
          className={styles.iconBtn}
          onClick={() => onDelete(category.id)}
        >
          <Trash2 size={18} className={styles.deleteIcon} />
        </button>
      </div>
    </div>
  );
}