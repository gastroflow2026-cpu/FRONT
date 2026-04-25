const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const ADMIN_ENDPOINTS = {
  // --- Modulo de Empleados ---
  EMPLOYEES: {
    LIST: `${API_URL}/users`,
    CREATE: `${API_URL}/employees`,
    DEACTIVATE: (id: string) => `${API_URL}/users/${id}/deactivate`,
    CHANGE_PASSWORD: (id: string) => `${API_URL}/users/${id}/resetpassword`,
  },

  // --- Modulo de Reservaciones ---
  RESERVATIONS: {
    LIST: (restaurantId: string) => `${API_URL}/restaurants/${restaurantId}/reservations/AllReservations`,
  },

  // --- Modulo de Menu
  MENU: {
    LIST: `${API_URL}/menu/public`,
    CREATE: `${API_URL}`,
    UPDATE: (id: string) => `${API_URL}/menu/items/${id}`,
    DELETE: (id: string) => `${API_URL}/menu/items/${id}`,
    STATUS: (id: string) => `${API_URL}/menu/items/${id}/status`,
  },

  // --- Modulo de Menu Categories
  CATEGORIES: {
    CREATE: `${API_URL}/menu/categories`,
    LIST: `${API_URL}/menu/categories`,
    UPDATE: (id: string) => `${API_URL}/menu/categories/${id}`,
    DELETE: (id: string) => `${API_URL}/menu/categories/${id}`,
  },
};
