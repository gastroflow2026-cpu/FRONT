"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItemFormDialog } from "./MenuItemDialog";
import Swal from "sweetalert2";
import styles from "./Menu.module.css";
import { MenuItem } from "@/types/MenuItem";


export function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Paella Valenciana",
      description: "Arroz con mariscos frescos, azafrán y verduras",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400",
      status: "disponible",
    },
    {
      id: "2",
      name: "Cordero Asado",
      description: "Cordero al horno con hierbas aromáticas y patatas",
      price: 32.50,
      image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
      status: "disponible",
    },
    {
      id: "3",
      name: "Tarta de Chocolate",
      description: "Deliciosa tarta con ganache de chocolate belga",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      status: "agotado",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (id: string) => {
    Swal.fire({
      title: "Editar Plato",
      text: "Funcionalidad de edición próximamente disponible",
      icon: "info",
      confirmButtonColor: "#ea580c",
    });
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
      if (result.isConfirmed) {
        setMenuItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire({
          title: "Eliminado",
          text: "El plato ha sido eliminado exitosamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleStatusChange = (id: string, status: "disponible" | "agotado" | "inactivo") => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    const statusMessages = {
      disponible: "El platillo está ahora disponible",
      agotado: "El platillo ha sido marcado como agotado",
      inactivo: "El platillo ha sido desactivado",
    };

    Swal.fire({
      icon: "success",
      title: "Estado actualizado",
      text: statusMessages[status],
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleCreateItem = (newItem: Omit<MenuItem, "id">) => {
    const item: MenuItem = {
      ...newItem,
      id: Date.now().toString(),
      status: "disponible",
    };

    setMenuItems((prev) => [...prev, item]);
    setIsDialogOpen(false); // Cerramos el modal tras crear

    Swal.fire({
      icon: "success",
      title: "Platillo creado",
      text: `${item.name} ha sido agregado al menú exitosamente.`,
      confirmButtonColor: "#ea580c",
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Gestión de Menú</h2>
          <p>Administra los platos del restaurante</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className={styles.addButton}
        >
          <Plus size={18} />
          Nuevo Plato
        </button>
      </header>

      <div className={styles.grid}>
        {menuItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      <MenuItemFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}