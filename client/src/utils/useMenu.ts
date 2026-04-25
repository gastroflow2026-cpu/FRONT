import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { adminService } from "@/services/adminService";
import { MenuItem, MenuCategory } from "@/types/MenuItem";

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const { categories, menuItems } =
        await adminService.getAllPlates();

      setCategories(categories);
      setMenuItems(menuItems);
    } catch {
      Swal.fire("Error", "No se pudo cargar el menú", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const createItem = async (item: Omit<MenuItem, "id">) => {
    try {
      await adminService.createNewPlate(item);
      await fetchMenu();
      Swal.fire("Éxito", "Platillo creado", "success");
    } catch {
      Swal.fire("Error", "No se pudo crear", "error");
    }
  };

  const updateItem = async (item: MenuItem) => {
    try {
      await adminService.updatePlateInfo(item.id, item);
      await fetchMenu();
      Swal.fire("Actualizado", "Cambios guardados", "success");
    } catch {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await adminService.deletePlate(id);
      await fetchMenu();
      Swal.fire("Eliminado", "Platillo eliminado", "success");
    } catch {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  const changeStatus = async (
    id: string,
    status: "disponible" | "agotado" | "inactivo"
  ) => {
    try {
      await adminService.updatePlateStatusFlexible(id, status);
      await fetchMenu();
    } catch {
      Swal.fire("Error", "No se pudo actualizar estado", "error");
    }
  };

  return {
    menuItems,
    categories,
    loading,
    createItem,
    updateItem,
    deleteItem,
    changeStatus,
    refetch: fetchMenu,
  };
}