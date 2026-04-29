const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const ADMIN_ENDPOINTS = {
  EMPLOYEES: {
    LIST: `${API_URL}/employees`,
    CREATE: `${API_URL}/employees`,
    STATUS: (id: string) => `${API_URL}/employees/${id}/status`,
    CHANGE_PASSWORD: (id: string) =>
      `${API_URL}/users/${id}/resetpassword`,
  },

  RESERVATIONS: {
    LIST: (restaurantId: string) =>
      `${API_URL}/restaurants/${restaurantId}/reservations/AllReservations`,
  },

  MENU: {
  LIST: (restaurantId: string) => `${API_URL}/menu/${restaurantId}/admin`,
  CREATE: `${API_URL}/menu/items`, // ← faltaba /menu/items
  UPDATE: (id: string) => `${API_URL}/menu/items/${id}`,
  DELETE: (id: string) => `${API_URL}/menu/items/${id}`,
  STATUS: (id: string) => `${API_URL}/menu/items/${id}/status`,
  },

  CATEGORIES: {
  LIST: (restaurantId: string) => `${API_URL}/menu/${restaurantId}/categories`,
  CREATE: `${API_URL}/menu/categories`,
  UPDATE: (id: string) => `${API_URL}/menu/categories/${id}`,
  DELETE: (id: string) => `${API_URL}/menu/categories/${id}`,
  },
};