import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { adminService } from "@/services/adminService";
import { MenuItem, MenuCategory } from "@/types/MenuItem";
import { UsersContext } from "@/context/UsersContext"; // ← ajustá el path si es diferente

export function useMenu() {
  const { isLogged } = useContext(UsersContext); // ← obtener usuario
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    if (!isLogged?.restaurant_id) return; // ← guard por si no tiene restaurant_id
    try {
      setLoading(true);
      const { categories, menuItems } =
        await adminService.getAllPlates(isLogged.restaurant_id); // ← pasar restaurant_id

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
  }, [isLogged?.restaurant_id]); // ← re-fetch si cambia el restaurant_id

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