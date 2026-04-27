import axios from "axios";
import { ADMIN_ENDPOINTS } from "@/constants/AdminEndpoints";
import { getToken } from "@/helpers/getToken";
import { CreateEmployeePayload, Employee } from "@/types/Employee";
import { MenuItem, MenuItemStatus } from "@/types/MenuItem";
import { Category } from "@/types/Category";

export const getAuthHeaders = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

const mapStatus = (status: string): "disponible" | "agotado" | "inactivo" => {
  if (status === "DISPONIBLE") return "disponible";
  if (status === "AGOTADO") return "agotado";
  return "inactivo";
};

export const adminService = {
  // --- SECCION: EMPLEADOS ---
  getAllEmployees: async (): Promise<Employee[]> => {
    const res = await axios.get(
      ADMIN_ENDPOINTS.EMPLOYEES.LIST,
      getAuthHeaders(),
    );
    return res.data;
  },

  createEmployee: async (
    employeeData: CreateEmployeePayload,
  ): Promise<Employee> => {
    const res = await axios.post(
      ADMIN_ENDPOINTS.EMPLOYEES.CREATE,
      employeeData,
      getAuthHeaders(),
    );
    return res.data;
  },

  updateEmployeeStatus: async (
    employeeId: string,
    isActive: boolean,
  ): Promise<Employee> => {
    const res = await axios.patch(
      ADMIN_ENDPOINTS.EMPLOYEES.STATUS(employeeId),
      { isActive },
      getAuthHeaders(),
    );
    return res.data;
  },

  changeEmployeePassword: async (userId: string, newPassword: string) => {
    const res = await axios.patch(
      ADMIN_ENDPOINTS.EMPLOYEES.CHANGE_PASSWORD(userId),
      { newPassword },
      getAuthHeaders(),
    );
    return res.data;
  },

  // --- SECCION: RESERVAS ---
  getAllReservations: async (restaurantId: string) => {
    const res = await axios.get(
      ADMIN_ENDPOINTS.RESERVATIONS.LIST(restaurantId),
      getAuthHeaders(),
    );
    return res.data;
  },

  // --- SECCION: MENU
  getAllPlates: async () => {
    const res = await axios.get(ADMIN_ENDPOINTS.MENU.LIST, getAuthHeaders());

    const categories = res.data.map((cat: any) => ({
      id: cat.category_id,
      name: cat.category_name,
      description: cat.category_description,
      display_order: cat.display_order,

      items: cat.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        image: item.image_url,
        status: mapStatus(item.status),
        category_id: item.category_id,
      })),
    }));

    return { categories };
  },

  createNewPlate: async (plate: any) => {
    const payload = {
      name: plate.name,
      description: plate.description,
      price: plate.price,
      category_id: plate.category_id,
      restaurant_id: plate.restaurant_id,
      image_url: plate.image,
      allergens: plate.allergens || "",
      tags: plate.tags || "",
      prep_time_minutes: plate.prep_time_minutes || 15,
      status: "DISPONIBLE",
      display_order: plate.display_order || 1,
    };

    return axios.post(ADMIN_ENDPOINTS.MENU.CREATE, payload, getAuthHeaders());
  },

  updatePlateInfo: async (id: string, plate: any, restaurant_id: string) => {
    const payload = {
      name: plate.name,
      description: plate.description,
      price: plate.price,
      category_id: plate.category_id,
      restaurant_id: restaurant_id,
      image_url: plate.image,
      allergens: plate.allergens || "",
      tags: plate.tags || "",
      prep_time_minutes: plate.prep_time_minutes || 15,
      display_order: plate.display_order || 1,
      status: "DISPONIBLE",
    };

    return axios.patch(
      ADMIN_ENDPOINTS.MENU.UPDATE(id),
      payload,
      getAuthHeaders(),
    );
  },

  // updatePlateStatus: async (id: string, status: MenuItemStatus) => {
  //   return axios.patch(
  //     ADMIN_ENDPOINTS.MENU.STATUS(id),
  //     { status: mapStatusToBackend(status) },
  //     getAuthHeaders()
  //   );
  // },

  deletePlate: async (id: string) => {
    return axios.delete(ADMIN_ENDPOINTS.MENU.DELETE(id), getAuthHeaders());
  },

  // --- SECCION: MENU (Categorias)
  getAllCategories: async () => {
    const res = await axios.get(
      ADMIN_ENDPOINTS.CATEGORIES.LIST,
      getAuthHeaders(),
    );

    const data = res.data;

    return data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      is_active: cat.is_active,
      display_order: cat.display_order,
      createdAt: cat.created_at,
    }));
  },

  createCategory: async (categoryData: {
    name: string;
    description: string;
    restaurant_id: string;
    display_order: number;
  }) => {
    const res = await axios.post(
      ADMIN_ENDPOINTS.CATEGORIES.CREATE,
      categoryData,
      getAuthHeaders(),
    );
    return res.data;
  },

  updateCategory: async (categoryData: any, id: string) => {
    const { id: _, ...dataToSend } = categoryData;

    const res = await axios.patch(
      ADMIN_ENDPOINTS.CATEGORIES.UPDATE(id),
      dataToSend,
      getAuthHeaders(),
    );
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await axios.delete(
      ADMIN_ENDPOINTS.CATEGORIES.DELETE(id),
      getAuthHeaders(),
    );
    return res.data;
  },
};
