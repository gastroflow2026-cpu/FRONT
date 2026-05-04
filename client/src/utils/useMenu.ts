import { useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { adminService } from "@/services/adminService";
import { UsersContext } from "@/context/UsersContext";
import { MenuItemStatus } from "@/types/MenuItem";

export function useMenu() {
  const [platesList, setPlatesList] = useState([]);

  const { isLogged } = useContext(UsersContext);

  const restaurantId = useMemo(() => {
    if (!isLogged?.restaurant_id) {
      return null;
    }
    return isLogged.restaurant_id;
  }, [isLogged]);

  useEffect(() => {
    if (!restaurantId) {
      Swal.fire(
        "Error",
        "No se detectó el ID del restaurante. Reintente loguear.",
        "error",
      );
    }
  }, [restaurantId]);

  const fetchMenu = async () => {
    if (!restaurantId) return;
    try {
      const { categories, menuItems } =
        await adminService.getAllPlates(restaurantId);
      setPlatesList(categories);
      console.log(menuItems);
    } catch {
      Swal.fire("Error", "No se pudo cargar el menú", "error");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const createItem = async (item: any) => {
    try {
      await adminService.createNewPlate(item);
      await fetchMenu();

      Swal.fire("Éxito", "Platillo creado", "success");
    } catch (error: any) {
      if (!error.response) {
        Swal.fire("Error", "La imagen debe ser menor a 2MB", "error");
        return;
      }

      if (error.response.status === 413) {
        Swal.fire("Error", "La imagen debe ser menor a 2MB", "error");
        return;
      }

      Swal.fire("Error", "No se pudo crear", "error");
    }
  };

  const updateItem = async (item: any) => {
    if (!restaurantId) return;

    try {
      await adminService.updatePlateInfo(item.id, item, restaurantId);
      await fetchMenu();

      Swal.fire("Actualizado", "Cambios guardados", "success");
    } catch (error: any) {
      if (!error.response) {
        Swal.fire("Error", "La imagen debe ser menor a 2MB", "error");
        return;
      }

      if (error.response.status === 413) {
        Swal.fire("Error", "La imagen debe ser menor a 2MB", "error");
        return;
      }

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

  const changeStatus = async (id: string, status: MenuItemStatus) => {
    try {
      await adminService.updatePlateStatus(id, status);
      await fetchMenu();
    } catch {
      Swal.fire("Error", "No se pudo actualizar estado", "error");
    }
  };

  return {
    platesList,
    createItem,
    updateItem,
    deleteItem,
    changeStatus,
  };
}
