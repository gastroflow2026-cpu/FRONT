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

      <div className={styles.avatarContainer}>
        <div className={styles.avatarCircle}></div>
      </div>

      <div className={styles.headerText}>
        <p className={styles.userName}>{name}</p>
        <p className={styles.userRole}>Comensal</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <p className={styles.label}>Correo</p>
          <span className={styles.value}>{email}</span>
        </div>
        
        <div className={styles.divider}></div>

        <div className={styles.statItem}>
          <p className={styles.label}>Número</p>
          <span className={styles.value}>{phone}</span>
        </div>
      </div>

      <div className={styles.actionArea}>
        <button
          type="button"
          className={styles.logOut}
          onClick={logOutHandler}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
