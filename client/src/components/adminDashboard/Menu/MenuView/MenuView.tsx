"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItemFormDialog } from "./MenuItemDialog";
import { EditMenuItemDialog } from "./EditMenuItemDialog";
import Swal from "sweetalert2";
import styles from "./MenuView.module.css";
import { MenuItem, MenuCategory } from "@/types/MenuItem";
import { Category } from "@/types/Category";

interface Props {
  menuItems: MenuItem[];
  categories: Category[];
  onCreateItem: (item: Omit<MenuItem, "id">) => void;
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onStatusChange: (id: string, status: "disponible" | "agotado" | "inactivo") => void;
}

export function MenuView({
  menuItems,
  categories,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onStatusChange,
}: Props) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    item: MenuItem | null;
  }>({
    isOpen: false,
    item: null,
  });

  const handleEdit = (id: string) => {
    const item = menuItems.find((i) => i.id === id);
    if (item) setEditDialog({ isOpen: true, item });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "¿Eliminar plato?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) onDeleteItem(id);
    });
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Platillos del Menú</h2>
          <p className={styles.subtitle}>
            Gestiona todos los platillos disponibles
          </p>
        </div>

        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className={styles.addButton}
          disabled={activeCategories.length === 0}
        >
          <Plus size={18} />
          Nuevo Platillo
        </button>
      </div>

      {activeCategories.length === 0 && (
        <div className={styles.warningBox}>
          Debes crear al menos una categoría activa antes de agregar platillos.
        </div>
      )}

      {menuItems.length > 0 ? (
        <div className={styles.grid}>
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No hay platillos creados</p>

          {activeCategories.length > 0 && (
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className={styles.emptyButton}
            >
              <Plus size={16} />
              Crear Primer Platillo
            </button>
          )}
        </div>
      )}

      <MenuItemFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={(item) => {
          onCreateItem(item);
          setIsCreateDialogOpen(false);
        }}
        categories={categories}
      />

      <EditMenuItemDialog
        isOpen={editDialog.isOpen}
        item={editDialog.item}
        onClose={() => setEditDialog({ isOpen: false, item: null })}
        onSubmit={(item) => {
          onUpdateItem(item);
          setEditDialog({ isOpen: false, item: null });
        }}
      />
    </div>
  );
}