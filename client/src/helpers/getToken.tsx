const AUTH_STORAGE_KEYS = ["token", "user", "restaurantName"] as const;

export const getToken = (): string | null => {
  const storedToken = localStorage.getItem("token");

  if (!storedToken) return null;

  try {
    return JSON.parse(storedToken) as string;
  } catch {
    return storedToken;
  }
  
};


export const saveSession = (token: string, user: unknown) => {
  clearSession();
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};


export const getCurrentUser = (): { id: string; email: string; role: string } | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};