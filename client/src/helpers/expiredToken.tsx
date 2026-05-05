// src/helpers/axiosInterceptor.ts
import axios from "axios";
import Swal from "sweetalert2";
import { clearSession } from "./getToken";

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.response?.status === 401) {
        clearSession();
        await Swal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "Tu sesión ha vencido. Por favor, iniciá sesión nuevamente.",
          confirmButtonColor: "#f97316",
          confirmButtonText: "Iniciar sesión",
        });
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};