"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { CategoryFormDialog } from "./CategoryFormDialog";
import styles from "./CategoryView.module.css";
import { Category } from "@/types/Category";
import { CategoriesViewProps } from "@/types/Props/CategoriesViewProps";

export function CategoriesView({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoriesViewProps) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    category: Category | null;
  }>({
    isOpen: false,
    mode: "create",
    category: null,
  });

  const handleEdit = (id: string) => {
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      setDialogState({ isOpen: true, mode: "edit", category });
    }
  };

  const handleSubmit = (data: {
    id?: string;
    name: string;
    description?: string;
  }) => {
    if (dialogState.mode === "create") {
      onCreateCategory({
        name: data.name,
        description: data.description || "",
      });
    } else if (data.id) {
      onUpdateCategory({
        id: data.id,
        name: data.name,
        description: data.description || "",
      });
    }

    setDialogState({ isOpen: false, mode: "create", category: null });
  };

  return (
    <div className={styles.viewContainer}>
      <header className={styles.viewHeader}>
        <div className={styles.viewTitle}>
          <h3>Categorías del Menú</h3>
          <p>Organiza los platillos por categorías</p>
        </div>

        <button
          onClick={() =>
            setDialogState({ isOpen: true, mode: "create", category: null })
          }
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          <Plus size={18} />
          Nueva Categoría
        </button>
      </header>

      {categories.length > 0 ? (
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={onDeleteCategory}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No hay categorías creadas</p>
        </div>
      )}

      <CategoryFormDialog
        isOpen={dialogState.isOpen}
        onClose={() =>
          setDialogState({ isOpen: false, mode: "create", category: null })
        }
        onSubmit={handleSubmit}
        category={
          dialogState.category
            ? {
                ...dialogState.category,
                description: dialogState.category.description || "",
              }
            : null
        }
        mode={dialogState.mode}
      />
    </div>
  );
}
