import { RegisterFormValues } from "@/validations/registerSchema";

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
