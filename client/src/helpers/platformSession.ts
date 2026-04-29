interface StoredUser {
  roles?: string[];
}

export const isPlatformSessionUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return false;

  try {
    const user = JSON.parse(storedUser) as StoredUser;

    return Array.isArray(user.roles) && user.roles.includes("super_admin");
  } catch {
    return false;
  }
};