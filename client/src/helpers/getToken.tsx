export const getToken = (): string | null => {
  const storedToken = localStorage.getItem("token");

  if (!storedToken) return null;

  try {
    return JSON.parse(storedToken);
  } catch {
    return storedToken;
  }
};