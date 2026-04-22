import axios from "axios";
import { ADMIN_ENDPOINTS } from "@/constants/AdminEndpoints";
import { getToken } from "@/helpers/getToken";

const getAuthHeaders = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const adminService = {
  // --- SECCION: EMPLEADOS ---
  getAllEmployees: async () => {
    const res = await axios.get(
      ADMIN_ENDPOINTS.EMPLOYEES.LIST,
      getAuthHeaders(),
    );
    return res.data;
  },

  createEmployee: async (employeeData: any) => {
    const res = await axios.post(
      ADMIN_ENDPOINTS.EMPLOYEES.CREATE,
      employeeData,
      getAuthHeaders(),
    );
    return res.data;
  },

  deactivateEmployee: async (userId: string) => {
    const res = await axios.patch(
      ADMIN_ENDPOINTS.EMPLOYEES.DEACTIVATE(userId),
      {},
      getAuthHeaders(),
    );
    return res.data;
  },

  changeEmployeePassword: async (userId: string, newPasswordData: string) => {
    const res = await axios.patch(
      ADMIN_ENDPOINTS.EMPLOYEES.CHANGE_PASSWORD(userId),
      newPasswordData,
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
    return res.data;
  },

  createNewPlate: async (plateData: any) => {
    const res = await axios.post(
      ADMIN_ENDPOINTS.MENU.CREATE,
      plateData,
      getAuthHeaders(),
    );
    return res.data;
  },

  updatePlateInfo: async (id: string, plateData: any) => {
    const res = await axios.patch(
      ADMIN_ENDPOINTS.MENU.UPDATE(id),
      plateData,
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
};
