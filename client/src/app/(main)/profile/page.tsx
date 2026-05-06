"use client";

import UserInfo from "@/components/perfil/UserInfo";
import styles from "./Perfil.module.css";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Password } from "@/components/perfil/Password";
import { UsersContext } from "@/context/UsersContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "@/services/adminService";
import { getApiBaseUrl } from "@/services/apiBaseUrl";

export default function Perfil() {
  const { isLogged } = useContext(UsersContext);
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState<{ phone: string; address: string }>({
    phone: "",
    address: "",
  });
  const API_URL = getApiBaseUrl();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isLogged?.id) return;

    const fetchProfileData = async () => {
      const candidates = [
        `${API_URL}/users/profile`,
        `${API_URL}/users/me`,
        `${API_URL}/users/${isLogged.id}`,
      ];

      try {
        for (const url of candidates) {
          try {
            const res = await axios.get(url, getAuthHeaders());
            const data = res?.data as { phone?: string; address?: string };

            setProfileData({
              phone: data?.phone ?? "",
              address: data?.address ?? "",
            });
            return;
          } catch (error) {
            if (!axios.isAxiosError(error)) {
              continue;
            }

            const status = error.response?.status;

            // Probamos el siguiente endpoint cuando la ruta no coincide con este backend.
            if (status === 400 || status === 404) {
              continue;
            }

            throw error;
          }
        }

        throw new Error("PROFILE_ENDPOINT_NOT_FOUND");
      } catch {
        setProfileData({
          phone: (isLogged as any)?.phone || "",
          address: (isLogged as any)?.address || "",
        });
      }
    };

    fetchProfileData();
  }, [mounted, isLogged, API_URL]);

  if (!mounted) return null;

  const userData = {
    id: isLogged?.id || "",
    name: isLogged?.name || "Usuario",
    email: isLogged?.email || "",
    imgUrl: isLogged?.imgUrl || null,
    phone: profileData.phone || (isLogged as any)?.phone || "",
    address: profileData.address || (isLogged as any)?.address || "",
    roles: isLogged?.roles?.[0] ? [isLogged.roles[0]] : [],
  };

  return (
    <>
      <Navbar />
      <div className={styles.profile}>
        <div className={styles.userLayout}>
          <UserInfo user={userData}/>
          <Password />
        </div>
      </div>
      <Footer />
    </>
  );
}