import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { adminService } from "@/services/adminService";
import { Category } from "@/types/Category";
import { UsersContext } from "@/context/UsersContext";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const { isLogged } = useContext(UsersContext);

  console.log(isLogged?.restaurant_id);

  const fetchCategories = async () => {
    try {
      const data = await adminService.getAllCategories();
      setCategories(data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar categorías", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (category: {
    name: string;
    description: string;
  }) => {
    try {
      if (!isLogged?.restaurant_id) {
        Swal.fire(
          "Error",
          "No se detectó el ID del restaurante. Reintente loguear.",
          "error",
        );
        return;
      }
      const payload = {
        name: category.name,
        description: category.description || "Sin descripción",
        restaurant_id: isLogged.restaurant_id,
        display_order: 1,
      };
      console.log("Enviando a API:", payload);
      await adminService.createCategory(payload);

      Swal.fire("Creado", "Categoría creada", "success");
      await fetchCategories();
    } catch (error: any) {
      console.error("Error de la API:", error.response?.data || error.message);
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo crear",
        "error",
      );
    }
  };

  const updateCategory = async (category: {
    id: string;
    name: string;
    description: string;
  }) => {
    try {
      const originalCategory = categories.find((c) => c.id === category.id);

      const payload = {
        name: category.name,
        description: category.description,
        restaurant_id: isLogged?.restaurant_id, //"11111111-1111-1111-1111-111111111111"
        display_order: originalCategory?.display_order || 0,
      };

      console.log("Actualizar: ", payload, category.id);

      await adminService.updateCategory(payload, category.id);
      await fetchCategories();
      Swal.fire("Actualizado", "Categoría actualizada", "success");
    } catch (error) {
      console.error("Update category error:", error);
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "¿Desactivar categoría?",
        text: "La categoría dejará de estar disponible en el menú.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, desactivada",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      await adminService.deleteCategory(id);

      Swal.fire("Eliminado", "Categoría desactivada correctamente", "success");

      await fetchCategories();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo desactivada la categoría", "error");
    }
  };

  return {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
