"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItemFormDialog } from "./MenuItemDialog";
import { EditMenuItemDialog } from "./EditMenuItemDialog";
import Swal from "sweetalert2";
import axios from "axios";
import styles from "./Menu.module.css";
import { MenuItem, MenuCategory } from "@/types/MenuItem";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type BackendMenuItem = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  image_url: string;
  status: string;
  category_id?: string;
};

type BackendMenuCategory = {
  category_id: string;
  category_name: string;
  category_description?: string | null;
  is_active?: boolean;
  display_order?: number;
  items: BackendMenuItem[];
};

const getToken = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  if (!token) return null;

  return token.replace(/^"|"$/g, "");
};
const mapBackendStatusToFront = (
  status: string,
): "disponible" | "agotado" | "inactivo" => {
  if (status === "DISPONIBLE" || status === "AVAILABLE") return "disponible";
  if (status === "AGOTADO" || status === "OUT_OF_STOCK") return "agotado";
  return "inactivo";
};

const mapFrontStatusToBackend = (
  status: "disponible" | "agotado" | "inactivo",
) => {
  if (status === "disponible") return "DISPONIBLE";
  if (status === "agotado") return "AGOTADO";
  return "INACTIVO";
};

export function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

  const fetchMenuItems = async () => {
    try {
      const getToken = () => {
        const token = localStorage.getItem("token");
        console.log("TOKEN USADO EN MENU:", token);
        return token;
      };

      const token = getToken();

      const response = await axios.get<BackendMenuCategory[]>(
        `${API_URL}/menu/public`,
      );

      const backendCategories = response.data;

      const mappedCategories: MenuCategory[] = backendCategories.map(
        (category) => ({
          category_id: category.category_id,
          category_name: category.category_name,
          category_description: category.category_description,
          is_active: category.is_active,
          display_order: category.display_order,
          items: category.items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: Number(item.price),
            image: item.image_url,
            status: mapBackendStatusToFront(item.status),
            category_id: item.category_id || category.category_id,
            category_name: category.category_name,
          })),
        }),
      );

      setCategories(mappedCategories);

      const mappedItems: MenuItem[] = mappedCategories.flatMap(
        (category) => category.items,
      );

      setMenuItems(mappedItems);
    } catch (error) {
      console.error("ERROR MENU ADMIN:", error);

      if (axios.isAxiosError(error)) {
        console.log("STATUS:", error.response?.status);
        console.log("DATA:", error.response?.data);
        console.log("URL:", error.config?.url);
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el menú",
      });
    }
  };

  useEffect(() => {
    console.log("EJECUTANDO FETCH MENU");
    fetchMenuItems();
  }, []);

  const handleEdit = (id: string) => {
    const item = menuItems.find((i) => i.id === id);

    if (item) {
      setItemToEdit(item);
      setIsEditDialogOpen(true);
    }
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
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const token = getToken();

        await axios.delete(`${API_URL}/menu/items/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await fetchMenuItems();

        Swal.fire({
          title: "Eliminado",
          text: "El plato ha sido eliminado exitosamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el plato. Si el backend no tiene DELETE, lo manejamos como INACTIVO.",
        });
      }
    });
  };

  const handleStatusChange = async (
    id: string,
    status: "disponible" | "agotado" | "inactivo",
  ) => {
    try {
      const token = getToken();

      await axios.patch(
        `${API_URL}/menu/items/${id}/status`,
        {
          status: mapFrontStatusToBackend(status),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchMenuItems();

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: "El estado del plato fue actualizado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado",
      });
    }
  };

  const handleCreateItem = async (newItem: Omit<MenuItem, "id">) => {
    try {
      const token = getToken();

      await axios.post(
        `${API_URL}/menu/items`,
        {
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          image_url: newItem.image,
          category_id: newItem.category_id,
          status: "DISPONIBLE",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchMenuItems();
      setIsCreateDialogOpen(false);

      Swal.fire({
        icon: "success",
        title: "Platillo creado",
        text: "El plato fue agregado al menú exitosamente.",
        confirmButtonColor: "#ea580c",
      });
    } catch (error) {
      console.error("ERROR CREATE ITEM:", error);

      if (axios.isAxiosError(error)) {
        console.log("CREATE STATUS:", error.response?.status);
        console.log("CREATE DATA:", error.response?.data);
        console.log("CREATE URL:", error.config?.url);
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el plato",
      });
    }
  };

  const handleUpdateItem = async (updatedItem: MenuItem) => {
    try {
      const token = getToken();

      await axios.patch(
        `${API_URL}/menu/items/${updatedItem.id}`,
        {
          name: updatedItem.name,
          description: updatedItem.description,
          price: updatedItem.price,
          image_url: updatedItem.image,
          category_id: updatedItem.category_id,
          status: mapFrontStatusToBackend(updatedItem.status),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchMenuItems();
      setIsEditDialogOpen(false);
      setItemToEdit(null);

      Swal.fire({
        icon: "success",
        title: "Platillo actualizado",
        text: "Los cambios se guardaron correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el plato",
      });
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Gestión de Menú</h2>
          <p>Administra los platos del restaurante</p>
        </div>

        <button
          onClick={() => setIsCreateDialogOpen(true)}
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
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateItem}
        categories={categories}
      />

      <EditMenuItemDialog
        isOpen={isEditDialogOpen}
        item={itemToEdit}
        onClose={() => {
          setIsEditDialogOpen(false);
          setItemToEdit(null);
        }}
        onSubmit={handleUpdateItem}
      />
    </div>
  );
}
