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
  getAllPlates: async () => {
    const res = await axios.get(ADMIN_ENDPOINTS.MENU.LIST, getAuthHeaders());
    return res.data;
  },

  createNewPlate: async (plateData: Record<string, unknown>) => {
    const res = await axios.post(
      ADMIN_ENDPOINTS.MENU.CREATE,
      plateData,
      getAuthHeaders(),
    );
    return res.data;
  },

  updatePlateInfo: async (id: string, plateData: Record<string, unknown>) => {
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
