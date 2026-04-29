"use client";

import { Plus } from "lucide-react";
import styles from "./MenuView.module.css";
import { useState } from "react";

import { MenuItemCard } from "./MenuItemCard";
import { MenuCategory, MenuItem } from "@/types/MenuItem";
import { MenuItemDialog } from "./MenuItemDialog";
import { Category } from "@/types/Category";

interface Props {
  platesList: MenuCategory[];
  onCreateItem: (item: any) => void;
  onUpdateItem: (item: any) => void;
  categories: Category[];
  onDeleteItem: (id: string) => void;
  onStatusChange?: (id: string, status: MenuItem["status"]) => void;
}

export function MenuView({
  platesList,
  onCreateItem,
  onUpdateItem,
  categories,
  onDeleteItem,
  onStatusChange,
}: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setMode("edit");
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSubmit = (data: any) => {
    if (mode === "create") {
      onCreateItem(data);
    } else {
      onUpdateItem(data);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Platillos del Menú</h2>

        <button className={styles.addButton} onClick={handleOpenCreate}>
          <Plus size={18} /> Nuevo Platillo
        </button>
      </div>

      {platesList.map((category) => (
        <div key={category.id} className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>{category.name}</h2>

          <div className={styles.grid}>
            {category.items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={handleOpenEdit}
                onDelete={onDeleteItem}
                onStatusChange={(id, status) =>
                  onStatusChange?.(id, status)
                }
              />
            ))}
          </div>
        </div>
      ))}

      <MenuItemDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        categories={categories}
        mode={mode}
        item={selectedItem}
      />
    </div>
  );
}