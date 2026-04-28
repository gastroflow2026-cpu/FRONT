import axios from "axios";
import { ADMIN_ENDPOINTS } from "@/constants/AdminEndpoints";
import { getToken } from "@/helpers/getToken";
import { CreateEmployeePayload, Employee } from "@/types/Employee";

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
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

  createEmployee: async (employeeData: CreateEmployeePayload): Promise<Employee> => {
    const res = await axios.post(
      ADMIN_ENDPOINTS.EMPLOYEES.CREATE,
      employeeData,
      getAuthHeaders(),
    );
    return res.data;
  },

  updateEmployeeStatus: async (employeeId: string, isActive: boolean): Promise<Employee> => {
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
  getAllPlates: async (restaurantId: string) => {
  const [categoriesRes, adminMenuRes] = await Promise.all([
    axios.get(ADMIN_ENDPOINTS.CATEGORIES.LIST(restaurantId), getAuthHeaders()),
    axios.get(ADMIN_ENDPOINTS.MENU.LIST(restaurantId), getAuthHeaders()),
  ]);

  const categoriesData = categoriesRes.data;
  const adminMenuData = adminMenuRes.data; // ← array de { category_id, items: [...] }

  const mapBackendStatusToFront = (status: string) => {
    if (status === "DISPONIBLE" || status === "AVAILABLE") return "disponible";
    if (status === "AGOTADO" || status === "OUT_OF_STOCK") return "agotado";
    return "inactivo";
  };

  // Extraer items planos del adminMenu
  const allItems = adminMenuData.flatMap((group: any) =>
  group.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    image: item.image_url, // ← image_url del backend → image para el frontend
    status: mapBackendStatusToFront(item.status),
    category_id: item.category_id,
  }))
);

  const mappedCategories = categoriesData.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    is_active: cat.is_active,
    display_order: cat.display_order,
    createdAt: cat.created_at,
    items: allItems.filter((item: any) => item.category_id === cat.id),
  }));

  const menuItems = allItems;

  return { categories: mappedCategories, menuItems };
},

  createNewPlate: async (plate: any) => {
    const payload = {
      name: plate.name,
      description: plate.description,
      price: plate.price,
      image_url: plate.image,
      category_id: plate.category_id,
      status: "DISPONIBLE",
    };

    const res = await axios.post(
      ADMIN_ENDPOINTS.MENU.CREATE,
      payload,
      getAuthHeaders(),
    );

    return res.data;
  },

  updatePlateInfo: async (id: string, plate: any) => {
    const mapFrontStatusToBackend = (status: string) => {
      if (status === "disponible") return "DISPONIBLE";
      if (status === "agotado") return "AGOTADO";
      return "INACTIVO";
    };

    const payload = {
      name: plate.name,
      description: plate.description,
      price: plate.price,
      image_url: plate.image,
      category_id: plate.category_id,
      status: mapFrontStatusToBackend(plate.status),
    };

    const res = await axios.patch(
      ADMIN_ENDPOINTS.MENU.UPDATE(id),
      payload,
      getAuthHeaders(),
    );

    return res.data;
  },

  updatePlateStatus: async (id: string, status: boolean) => {
    const res = await axios.patch(
      ADMIN_ENDPOINTS.MENU.STATUS(id),
      { is_active: status },
      getAuthHeaders(),
    );
    return res.data;
  },

  deletePlate: async (id: string) => {
    const res = await axios.delete(
      ADMIN_ENDPOINTS.MENU.DELETE(id),
      getAuthHeaders(),
    );
    return res.data;
  },

  updatePlateStatusFlexible: async (
    id: string,
    status: "disponible" | "agotado" | "inactivo",
  ) => {
    const mapFrontStatusToBackend = (status: string) => {
      if (status === "disponible") return "DISPONIBLE";
      if (status === "agotado") return "AGOTADO";
      return "INACTIVO";
    };

    const res = await axios.patch(
      ADMIN_ENDPOINTS.MENU.STATUS(id),
      { status: mapFrontStatusToBackend(status) },
      getAuthHeaders(),
    );

    return res.data;
  },

  // --- SECCION: MENU (Categorias)
  getAllCategories: async (restaurantId: string) => {
  const res = await axios.get(
    ADMIN_ENDPOINTS.CATEGORIES.LIST(restaurantId), // ← pasar restaurantId
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
