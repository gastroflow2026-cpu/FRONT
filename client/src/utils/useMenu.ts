import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { adminService } from "@/services/adminService";
import { MenuItem, MenuCategory } from "@/types/MenuItem";
import { UsersContext } from "@/context/UsersContext";

export function useMenu() {
  // const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [platesList, setPlatesList] = useState<MenuCategory[]>([]);
  const { isLogged } = useContext(UsersContext);

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
      await adminService.createNewPlate({
        ...item,
        restaurant_id: isLogged?.restaurant_id,
      });
      await fetchMenu();
      Swal.fire("Éxito", "Platillo creado", "success");
    } catch {
      Swal.fire("Error", "No se pudo crear", "error");
    }
  };

  const updateItem = async (item: any) => {
    try {
      const restaurant_id =
        "11111111-1111-1111-1111-111111111111"; /*isLogged?.restaurant_id,*/

      if (!restaurant_id) {
        throw new Error("No hay restaurant_id");
      }

      await adminService.updatePlateInfo(item.id, item, restaurant_id);

      await fetchMenu();

      Swal.fire("Actualizado", "Cambios guardados", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "¿Eliminar producto?",
        text: "El producto dejará de estar disponible en el menú.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      await adminService.deletePlate(id);
      await fetchMenu();
      Swal.fire("Eliminado", "Platillo eliminado", "success");
    } catch {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  // const changeStatus = async (
  //   id: string,
  //   status: "disponible" | "agotado" | "inactivo"
  // ) => {
  //   try {
  //     await adminService.updatePlateStatusFlexible(id, status);
  //     await fetchMenu();
  //   } catch {
  //     Swal.fire("Error", "No se pudo actualizar estado", "error");
  //   }
  // };

  return {
    // menuItems,
    platesList,
    createItem,
    updateItem,
    deleteItem,
    // changeStatus,
    // refetch: fetchMenu,
  };
}
