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

// 🔥 ahora SessionUser es el usuario completo
type SessionUser = AuthResponseUser;

interface UsersContextType {
  isLogged: SessionUser | null;
  loginUser: (values: LoginValues) => Promise<number>;
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
  loginUser: async () => 0,
  loginOwner: async () => ({ status: 0 }),
  completeOwnerOnboarding: async () => ({ status: 0 }),
  loginUserGoogle: async () => {},
  registerUserGoogle: async () => {},
  logoutUser: () => {},
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

  
  const loginUser = async (values: LoginValues): Promise<number> => {
    const res = await axios.post(`${API_URL}/auth/signin`, values);
    
    if (!res.data.user) throw new Error("No se recibió el usuario");
    
    const token = res.data.token;
    const user = res.data.user as AuthResponseUser;
    
    if (user.roles?.includes("rest_admin")) {
      throw new Error("OWNER_LOGIN_RESTRICTED");
    }
    
    saveAuthSession(token, user);
    return res.status;
  };
  
  const loginOwner = async (
    values: LoginValues,
  ): Promise<RequestResult<AuthResponse | AuthErrorResponse>> => {
    try {
      const res = await axios.post(`${API_URL}/auth/owner/signin`, values);
      const { token, user } = res.data;
      
      saveAuthSession(token, user);
      
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
        `${API_URL}/auth/owner/onboarding`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      const { token: nextToken, user } = res.data;
      
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

  const logoutUser = () => {
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
      const res = await axios.post(`${API_URL}/auth/signup`, values);
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
      const res = await axios.post(`${API_URL}/auth/owner/signup`, values);

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
