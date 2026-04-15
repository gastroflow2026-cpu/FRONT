"use client";

import styles from "./UserInfo.module.css";
import { User } from "@/types/User";

export default function UserInfo({ user }: { user: User }) {
  const { name, email, phone } = user ?? {};

  return (
    <div className={styles.card}>
      {/* Avatar */}
      <div className={styles.avatar}></div>

      {/* Nombre */}
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.role}>COMENSAL</p>

      {/* Divider horizontal */}
      <div className={styles.divider}></div>

      {/* Info */}
      <div className={styles.infoRow}>
        <div className={styles.half}>
          <span className={styles.label}>CORREO</span>
          <span className={styles.value}>{email}</span>
        </div>

        <div className={styles.half}>
          <span className={styles.label}>NÚMERO</span>
          <span className={styles.value}>{phone}</span>
        </div>
      </div>

      {/* Botón */}
      <button className={styles.logout}>CERRAR SESIÓN</button>
    </div>
  );
}