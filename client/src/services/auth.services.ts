import Swal from "sweetalert2";
import { RegisterFormValues} from "@/validations/registerSchema";
import { LoginFormValues } from "@/validations/loginSchema";

export const RegisterUser = async (userData: RegisterFormValues) => {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (response.ok) {
      return response.json();
    } else {
      alert("Error al registrar el usuario");
      throw new Error("Error al registrar el usuario");
    }
  } catch (error: any) {
    throw new Error(error);
  }
};

export const LoginUser = async (userData: LoginFormValues) => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      return response.json();
    }else {
      await Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: "Credenciales incorrectas. Por favor, verifica tu email y contraseña.",
        confirmButtonColor: "f97316",
      });
      throw new Error("Credenciales incorrectas");
    }
  } catch (error: any) {
    throw new Error(error);
  }
};