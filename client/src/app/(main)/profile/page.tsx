"use client";

import UserInfo from "@/components/perfil/UserInfo";
import styles from "./Perfil.module.css";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Password } from "@/components/perfil/Password";
import { UsersContext } from "@/context/UsersContext";
import { useContext, useEffect, useState } from "react";

export default function Perfil() {
  const { isLogged } = useContext(UsersContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const userData = {
    id: isLogged?.id || "",
    name: isLogged?.name || "Usuario",
    email: isLogged?.email || "",
    imgUrl: isLogged?.imgUrl || null,
    phone: "",
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