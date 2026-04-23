"use client";

import UserInfo from "@/components/perfil/UserInfo";
import styles from "./Perfil.module.css";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Password } from "@/components/perfil/Password";
import { UsersContext } from "@/context/UsersContext";
import { useContext } from "react";

export default function Perfil() {
  const { isLogged } = useContext(UsersContext);

  const userData = {
    id: isLogged?.id || "",
    name: isLogged?.name || "Usuario",
    email: isLogged?.email || "",
    imgUrl: isLogged?.imgUrl || null,
    phone: "", // Temporal
    roles: isLogged?.roles || [],
  };

  return (
    <>
      <Navbar />
      <div className={styles.profile}>
        <div className={styles.userLayout}>
          {/* <UserInfo user={userData} /> */}
          <Password /> 
        </div>
      </div>
      <Footer />
    </>
  );
}