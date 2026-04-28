"use client";
import {
  createContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { clearSession, getToken, saveSession } from "@/helpers/getToken";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const normalizeBaseUrl = (url?: string | null) => {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "");
};

const buildApiUrl = (path: string) => {
  const base = normalizeBaseUrl(API_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!base) {
    throw new Error("API_URL_NOT_CONFIGURED");
  }

  return `${base}${normalizedPath}`;
};

interface LoginValues {
  email: string;
  password: string;
}

interface RegisterValues {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}

interface OwnerRegisterValues {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}

interface OwnerOnboardingValues {
  name: string;
  slug?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  logo_url?: string;
  description?: string;
  is_active?: boolean;
}

interface AuthResponseUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  auth_provider: string;
  restaurant_id: string | null;
  requires_restaurant_onboarding: boolean;
  imgUrl: string | null;
}

interface AuthResponse {
  success: string;
  token: string;
  user: AuthResponseUser;
}

interface AuthErrorResponse {
  message?: string;
}

interface RequestResult<T = undefined> {
  status: number;
  data?: T;
}

interface LoginPayload {
  email: string;
  password: string;
}

const normalizeRoleToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/__+/g, "_");

const extractRoleValue = (role: unknown): string[] => {
  if (typeof role === "string") {
    return role.split(",").map(normalizeRoleToken).filter(Boolean);
  }

  if (!role || typeof role !== "object") {
    return [];
  }

  const candidate = role as Record<string, unknown>;
  const directKeys = ["role", "name", "value", "slug", "code", "id"];

  for (const key of directKeys) {
    const raw = candidate[key];
    if (typeof raw === "string" && raw.trim()) {
      return [normalizeRoleToken(raw)];
    }
  }

  const nestedRole = candidate.role;
  if (nestedRole && typeof nestedRole === "object") {
    const nested = nestedRole as Record<string, unknown>;
    const nestedRaw = nested.name ?? nested.value ?? nested.slug ?? nested.code;
    if (typeof nestedRaw === "string" && nestedRaw.trim()) {
      return [normalizeRoleToken(nestedRaw)];
    }
  }

  return [];
};

const normalizeRoles = (roles: unknown): string[] => {
  if (Array.isArray(roles)) {
    return roles.flatMap(extractRoleValue);
  }

  return extractRoleValue(roles);
};

const normalizeAuthUser = (input: unknown): AuthResponseUser => {
  const raw = (input ?? {}) as Record<string, unknown>;
  const firstName = typeof raw.first_name === "string" ? raw.first_name.trim() : "";
  const lastName = typeof raw.last_name === "string" ? raw.last_name.trim() : "";
  const fallbackName = `${firstName} ${lastName}`.trim();

  const nestedRestaurant =
    raw.restaurant && typeof raw.restaurant === "object"
      ? (raw.restaurant as Record<string, unknown>)
      : null;

  const restaurantIdCandidates = [
    raw.restaurant_id,
    raw.restaurantId,
    nestedRestaurant?.id,
    nestedRestaurant?.restaurant_id,
  ];

  let restaurantId: string | null = null;
  for (const candidate of restaurantIdCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      restaurantId = candidate.trim();
      break;
    }
  }

  return {
    id: typeof raw.id === "string" ? raw.id : "",
    name:
      (typeof raw.name === "string" && raw.name.trim()) ||
      fallbackName ||
      "Usuario",
    email: typeof raw.email === "string" ? raw.email : "",
    roles: normalizeRoles(raw.roles ?? raw.role),
    auth_provider:
      typeof raw.auth_provider === "string" ? raw.auth_provider : "email",
    restaurant_id: restaurantId,
    requires_restaurant_onboarding: Boolean(raw.requires_restaurant_onboarding),
    imgUrl: typeof raw.imgUrl === "string" ? raw.imgUrl : null,
  };
};

const OWNER_ROLES = new Set([
  "rest_admin",
  "restaurant_admin",
  "restaurant_owner",
  "owner",
  "admin",
]);

const isOwnerUser = (user: AuthResponseUser) =>
  user.roles.some((role) => OWNER_ROLES.has(role));

const isNotFoundError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

const postWithFallback = async <TResponse, TBody>(
  paths: string[],
  body: TBody,
): Promise<{ response: TResponse; status: number }> => {
  let lastError: unknown;

  for (const path of paths) {
    try {
      const res = await axios.post<TResponse>(buildApiUrl(path), body);
      return { response: res.data, status: res.status };
    } catch (error: unknown) {
      lastError = error;

      if (isNotFoundError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("AUTH_ENDPOINT_NOT_FOUND");
};

const toLoginPayload = (values: LoginValues): LoginPayload => ({
  email: values.email.trim(),
  password: values.password,
});

// SessionUser es el usuario completo
type SessionUser = AuthResponseUser;

interface UsersContextType {
  isLogged: SessionUser | null;
  loginUser: (values: LoginValues) => Promise<{ status: number; user: AuthResponseUser }>;
  loginOwner: (
    values: LoginValues,
  ) => Promise<RequestResult<AuthResponse | AuthErrorResponse>>;
  completeOwnerOnboarding: (
    values: OwnerOnboardingValues,
  ) => Promise<RequestResult<AuthResponse | AuthErrorResponse>>;
  loginUserGoogle: () => Promise<void>;
  registerUserGoogle: () => Promise<void>;
  logoutUser: () => void;
  registerNewUser: (values: RegisterValues) => Promise<number>;
  registerOwner: (
    values: OwnerRegisterValues,
  ) => Promise<RequestResult<AuthResponse | AuthErrorResponse>>;
  updateUser: (updatedFields: Partial<SessionUser>) => Promise<void>;
}

export const UsersContext = createContext<UsersContextType>({
  isLogged: null,
  loginUser: async () => ({ status: 0, user: {} as AuthResponseUser }),
  loginOwner: async () => ({ status: 0 }),
  completeOwnerOnboarding: async () => ({ status: 0 }),
  loginUserGoogle: async () => {},
  registerUserGoogle: async () => {},
  logoutUser: async () => {},
  registerNewUser: async () => 0,
  registerOwner: async () => ({ status: 0 }),
  updateUser: async () => {},
});

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [isLogged, setIsLogged] = useState<SessionUser | null>(() => {
    if (typeof window === "undefined") return null;
    
    const storedUser = localStorage.getItem("user");
    
    if (!storedUser) return null;
    
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });
  
  
  
  const saveAuthSession = useCallback(
    (token: string, user: AuthResponseUser) => {
      saveSession(token, user);
      
      setIsLogged(user);
    },
    [],
  );
    
  const getStoredToken = useCallback(() => {
    return getToken();
  }, []);

  const updateUser = useCallback(async (updatedFields: Partial<SessionUser>) => {
  if (!isLogged) return;

  const token = getStoredToken();
  
  try {
    const res = await axios.patch(
      `${API_URL}/users/${isLogged.id}`,
      updatedFields,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updated = { ...isLogged, ...res.data };
    localStorage.setItem("user", JSON.stringify(updated));
    setIsLogged(updated);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}, [isLogged, getStoredToken]);

  
  const loginUser = async (values: LoginValues): Promise<{ status: number; user: AuthResponseUser }> => {
    const payload = toLoginPayload(values);

    const { response, status } = await postWithFallback<AuthResponse, LoginPayload>(
      ["/auth/signin", "/auth/login"],
      payload,
    );

    if (!response?.user) throw new Error("No se recibió el usuario");

    const token = response.token;
    const user = normalizeAuthUser(response.user);

    if (isOwnerUser(user)) {
      throw new Error("OWNER_LOGIN_RESTRICTED");
    }

    saveAuthSession(token, user);
    return { status, user };
  };
  
  const loginOwner = async (
    values: LoginValues,
  ): Promise<RequestResult<AuthResponse | AuthErrorResponse>> => {
    try {
      const payload = toLoginPayload(values);

      const { response, status } = await postWithFallback<AuthResponse, LoginPayload>(
        ["/auth/owner/signin", "/auth/owner/login", "/auth/signin", "/auth/login"],
        payload,
      );
      const { token } = response;
      const user = normalizeAuthUser(response.user);

      if (!isOwnerUser(user)) {
        return {
          status: 403,
          data: {
            message: "La cuenta no pertenece a un owner/rest_admin.",
          },
        };
      }

      saveAuthSession(token, user);

      return {
        status,
        data: {
          ...response,
          user,
        },
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
        };
      }
      
      throw error;
    }
  };
  
  const loginUserGoogle = async () => {
    window.location.href = `${API_URL}/auth/google/login`;
  };
  
  const registerUserGoogle = async () => {
    window.location.href = `${API_URL}/auth/google/register`;
  };
  
  const completeOwnerOnboarding = async (
    values: OwnerOnboardingValues,
  ): Promise<RequestResult<AuthResponse | AuthErrorResponse>> => {
    const token = getStoredToken();
    
    if (!token) {
      return {
        status: 401,
        data: { message: "No hay una sesión owner activa." },
      };
    }
    
    try {
      const res = await axios.post(
        buildApiUrl("/auth/owner/onboarding"),
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      const { token: nextToken } = res.data;
      const user = normalizeAuthUser(res.data.user);

      saveAuthSession(nextToken, user);
      
      return {
        status: res.status,
        data: res.data,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
        };
      }
      
      throw error;
    }
  };
  
  const clearQueryParam = useCallback((paramName: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(paramName);
    window.history.replaceState({}, "", url);
  }, []);
  
  const showGoogleAuthError = useCallback(
    async (errorCode: string) => {
      if (errorCode === "provider_conflict") {
        await Swal.fire({
          icon: "error",
          title: "Error al iniciar sesión",
          text: "Este correo ya está registrado con email y contraseña.",
          confirmButtonColor: "#f97316",
        });
        clearQueryParam("error");
        return;
      }
      
      if (errorCode === "google_account_exists") {
        await Swal.fire({
          icon: "error",
          title: "Cuenta ya registrada",
          text: "Este correo ya está registrado con Google.",
          confirmButtonColor: "#f97316",
        });
        clearQueryParam("error");
        return;
      }
      
      if (errorCode === "google_auth_failed") {
        await Swal.fire({
          icon: "error",
          title: "Error con Google",
          text: "No se pudo completar el login.",
          confirmButtonColor: "#f97316",
        });
        clearQueryParam("error");
      }
      
    },
    [clearQueryParam],
  );

  const showGoogleRegistrationSuccess = useCallback(async () => {
    await Swal.fire({
      icon: "success",
      title: "Usuario registrado",
      text: "Tu cuenta fue registrada correctamente. Inicia sesion para continuar.",
      confirmButtonColor: "#f97316",
    });

    clearQueryParam("registered");
  }, [clearQueryParam]);

  const saveGoogleSession = (token: string) => {
    const payload = JSON.parse(
      decodeURIComponent(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map(
            (c) =>
              "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
          )
          .join(""),
      ),
    );

    const user: AuthResponseUser = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      roles: payload.roles || [],
      auth_provider: "google",
      restaurant_id: null,
      requires_restaurant_onboarding: false,
      imgUrl: payload.imgUrl || null,
    };

    saveSession(token, user);
    setIsLogged(user);
  };

  useEffect(() => {
    const processGoogleAuthRedirect = async () => {
      const url = new URL(window.location.href);
      const registered = url.searchParams.get("registered");
      const token = url.searchParams.get("token");
      const error = url.searchParams.get("error");

      if (error) {
        await showGoogleAuthError(error);
        return;
      }

      if (registered === "google_success") {
        await showGoogleRegistrationSuccess();
        return;
      }

      if (!token) {
        return;
      }

      try {
        saveGoogleSession(token);
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Error con Google",
          text: "No se pudo completar el login.",
        });
      } finally {
        clearQueryParam("token");
      }
    };

    processGoogleAuthRedirect();
  }, [showGoogleAuthError, showGoogleRegistrationSuccess, clearQueryParam]);


  const logoutUser = async () => {
  const result = await Swal.fire({
    title: "¿Cerrar sesión?",
    text: "¿Estás seguro que querés salir?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#f97316",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, salir",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  clearSession();
  clearQueryParam("token");
  clearQueryParam("error");
  clearQueryParam("registered");
  setIsLogged(null);
  router.push("/");
};

  const registerNewUser = async (
    values: RegisterValues,
  ): Promise<number> => {
    try {
      const res = await axios.post(buildApiUrl("/auth/signup"), values);
      return res.status;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.status;
      }
      throw error;
    }
  };

  const registerOwner = async (
    values: OwnerRegisterValues,
  ): Promise<RequestResult<AuthResponse | AuthErrorResponse>> => {
    try {
      const res = await axios.post(buildApiUrl("/auth/owner/signup"), values);

      return {
        status: res.status,
        data: res.data,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
        };
      }

      throw error;
    }
  };

  const value: UsersContextType = {
    isLogged,
    loginUser,
    loginOwner,
    completeOwnerOnboarding,
    loginUserGoogle,
    registerUserGoogle,
    logoutUser,
    registerNewUser,
    registerOwner,
    updateUser,
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};
