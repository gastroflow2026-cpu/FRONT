"use client";
import { createContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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

interface UsersContextType {
  isLogged: any;
  loginUser: (values: LoginValues) => {};
  loginUserGoogle: () => {};
  registerUserGoogle: () => {};
  logoutUser: () => void;
  registerNewUser: (values: RegisterValues) => Promise<number>;
}

export const UsersContext = createContext<UsersContextType>({
  isLogged: "",
  loginUser: async (values) => {},
  loginUserGoogle: async () => {},
  registerUserGoogle: async () => {},
  logoutUser: () => {},
  registerNewUser: async (values) => 0,
});

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState(() => {
    if (typeof window === "undefined") return null;
    const name = localStorage.getItem("name");
    return name ? { name } : null;
  });

  const loginUser = async (values: LoginValues): Promise<number> => {
    const res = await axios.post(`${API_URL}/auth/signin`, values);
    if (!res.data.user) throw new Error("No se recibió el usuario");

    const token = res.data.token;
    const user = res.data.user;
    localStorage.setItem("token", JSON.stringify(token));
    localStorage.setItem("name", user.name);
    setIsLogged({name: user.name});
    return res.status;
  };

  const loginUserGoogle = async () => {
    window.location.href = `${API_URL}/auth/google/login`;
  };

  const registerUserGoogle = async () => {
    window.location.href = `${API_URL}/auth/google/register`;
  };

  const clearQueryParam = (paramName: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(paramName);
    window.history.replaceState({}, "", url);
  };
  const showGoogleAuthError = async (errorCode: string) => {
    if (errorCode === "provider_conflict") {
      await Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: "Este correo ya está registrado con email y contraseña. Iniciá sesión con otro método.",
        confirmButtonColor: "#f97316",
      });

      clearQueryParam("error");
      return;
    }

    if (errorCode === "google_account_exists") {
      await Swal.fire({
        icon: "error",
        title: "Cuenta ya registrada",
        text: "Este correo ya está registrado con Google. Iniciá sesión.",
        confirmButtonColor: "#f97316",
      });

      clearQueryParam("error");
      return;
    }

    if (errorCode === "google_auth_failed") {
      await Swal.fire({
        icon: "error",
        title: "Error con Google",
        text: "No se pudo completar el inicio de sesión con Google.",
        confirmButtonColor: "#f97316",
      });

      clearQueryParam("error");
    }
  };

  const saveGoogleSession = (token: string) => {
    const payload = JSON.parse(
      decodeURIComponent(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );

    localStorage.setItem("token", token);
    localStorage.setItem("name", payload.name);
    setIsLogged({ name: payload.name });
  };

  useEffect(() => {
    const processGoogleAuthRedirect = async () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");
      const error = url.searchParams.get("error");

      if (error) {
        await showGoogleAuthError(error);
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
          text: "No se pudo completar el inicio de sesión con Google.",
          confirmButtonColor: "#f97316",
        });
      } finally {
        clearQueryParam("token");
      }
    };

    processGoogleAuthRedirect();
  }, []);

  const logoutUser = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");

    clearQueryParam("token");
    clearQueryParam("error");

    setIsLogged(null);
  };

  const registerNewUser = async (values: RegisterValues): Promise<number> => {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, values);
      return res.status;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.status;
      }
      throw error;
    }
  };

  const value: UsersContextType = {
    isLogged,
    loginUser,
    loginUserGoogle,
    registerUserGoogle,
    logoutUser,
    registerNewUser,
  };

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};
