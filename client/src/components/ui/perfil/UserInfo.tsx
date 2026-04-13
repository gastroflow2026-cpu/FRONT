"use client"

import styles from "./UserInfo.module.css";
import { User } from "@/types/User";

export default function UserInfo({ user }: { user: User }) {
  const logOutHandler = () => {
    window.location.href = "/";
  };

  const { name, email, phone } = user ?? {};

  return (
    <div className={styles.infoBox}>
      <p>Bienvenido de nuevo {name}...!</p>
      <div className={styles.dataBox}>
        <h3>Informacion personal</h3>
        <div className={styles.textBox}>
          <p>Nombre</p>
          <span>{name}</span>
        </div>
        <div className={styles.textBox}>
          <p>Correo</p>
          <span>{email}</span>
        </div>
        <div className={styles.textBox}>
          <p>Telefono</p>
          <span>{phone}</span>
        </div>
      </div>
      <button
        type="submit"
        className={styles.logOut}
        onClick={logOutHandler}
      > Cerrar Sesion</button>
    </div>
  );
}
