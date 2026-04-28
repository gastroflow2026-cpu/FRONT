import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { adminService } from "@/services/adminService";

export function useMenu() {
  const [platesList, setPlatesList] = useState([]);

  const fetchMenu = async () => {
    try {
      const { categories } = await adminService.getAllPlates();
      setPlatesList(categories);
    } catch (error) {
      console.error(error);
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
    } catch {
      Swal.fire("Error", "No se pudo crear", "error");
    }
  };

  const updateItem = async (item: any) => {
    try {
      await adminService.updatePlateInfo(
        item.id,
        item,
        "11111111-1111-1111-1111-111111111111"
      );
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

  const changeStatus = async (id: string, status: string) => {
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