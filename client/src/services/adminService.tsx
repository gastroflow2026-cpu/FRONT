import axios from "axios";
import { ADMIN_ENDPOINTS } from "@/constants/AdminEndpoints";
import { getToken } from "@/helpers/getToken";
import { CreateEmployeePayload, Employee } from "@/types/Employee";
import { MenuItemStatus } from "@/types/MenuItem";
import {
  buildHeadersWithRequestId,
  clearRequestId,
  CRITICAL_OPERATION_TIMEOUT_MS,
  getOrCreateRequestId,
  logAsyncOperation,
} from "@/helpers/asyncOperations";

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

const mapStatus = (status: string) => {
  switch (status) {
    case "disponible":
      return "DISPONIBLE";
    case "agotado":
      return "AGOTADO";
    case "inactivo":
      return "INACTIVO";
    default:
      return "DISPONIBLE";
  }
};

const mapStatusFromAPI = (status: string): MenuItemStatus => {
  switch (status) {
    case "DISPONIBLE":
      return "disponible";
    case "AGOTADO":
      return "agotado";
    case "INACTIVO":
      return "inactivo";
    default:
      return "disponible";
  }
};

export const adminService = {
  // --- SECCION: EMPLEADOS ---
  getAllEmployees: async (): Promise<Employee[]> => {
    const actionKey = "employees:list";
    const requestId = getOrCreateRequestId(actionKey);
    const endpoint = ADMIN_ENDPOINTS.EMPLOYEES.LIST;
    const startedAt = performance.now();

    const authConfig = getAuthHeaders();
    const res = await axios.get(endpoint, {
      ...authConfig,
      headers: buildHeadersWithRequestId(authConfig.headers, requestId),
      timeout: CRITICAL_OPERATION_TIMEOUT_MS,
    });

    logAsyncOperation({
      requestId,
      endpoint,
      durationMs: performance.now() - startedAt,
      ok: true,
    });
    clearRequestId(actionKey);
    return res.data;
  },

  createEmployee: async (
    employeeData: CreateEmployeePayload,
  ): Promise<Employee> => {
    const actionKey = `employee:create:${employeeData.email.toLowerCase()}`;
    const requestId = getOrCreateRequestId(actionKey);
    const endpoint = ADMIN_ENDPOINTS.EMPLOYEES.CREATE;
    const startedAt = performance.now();
    const authConfig = getAuthHeaders();

    const res = await axios.post(endpoint, employeeData, {
      ...authConfig,
      headers: buildHeadersWithRequestId(authConfig.headers, requestId),
      timeout: CRITICAL_OPERATION_TIMEOUT_MS,
    });

    logAsyncOperation({
      requestId,
      endpoint,
      durationMs: performance.now() - startedAt,
      ok: true,
    });
    clearRequestId(actionKey);
    return res.data;
  },

  updateEmployeeStatus: async (
    employeeId: string,
    isActive: boolean,
  ): Promise<Employee> => {
    const actionKey = `employee:status:${employeeId}`;
    const requestId = getOrCreateRequestId(actionKey);
    const endpoint = ADMIN_ENDPOINTS.EMPLOYEES.STATUS(employeeId);
    const startedAt = performance.now();
    const authConfig = getAuthHeaders();

    const res = await axios.patch(endpoint, { isActive }, {
      ...authConfig,
      headers: buildHeadersWithRequestId(authConfig.headers, requestId),
      timeout: CRITICAL_OPERATION_TIMEOUT_MS,
    });

    logAsyncOperation({
      requestId,
      endpoint,
      durationMs: performance.now() - startedAt,
      ok: true,
    });
    clearRequestId(actionKey);
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

  changeEmployeeRole: async (userId: string, role: string) => {
    const res = await axios.patch(
      ADMIN_ENDPOINTS.EMPLOYEES.ROLE(userId),
      { role },
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
      axios.get(
        ADMIN_ENDPOINTS.CATEGORIES.LIST(restaurantId),
        getAuthHeaders(),
      ),
      axios.get(ADMIN_ENDPOINTS.MENU.LIST(restaurantId), getAuthHeaders()),
    ]);

    const categoriesData = categoriesRes.data;
    const adminMenuData = adminMenuRes.data; // ← array de { category_id, items: [...] }

    const mapBackendStatusToFront = (status: string) => {
      if (status === "DISPONIBLE" || status === "AVAILABLE")
        return "disponible";
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
        status: mapStatusFromAPI(item.status),
        category_id: item.category_id,
      })),
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

  updatePlateStatus: async (id: string, status: MenuItemStatus) => {
    return axios.patch(
      ADMIN_ENDPOINTS.MENU.STATUS(id),
      { status: mapStatus(status) },
      getAuthHeaders(),
    );
  },

  deletePlate: async (id: string) => {
    return axios.delete(ADMIN_ENDPOINTS.MENU.DELETE(id), getAuthHeaders());
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
