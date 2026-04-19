"use client";

import styles from "./UserInfo.module.css";
import { User } from "@/types/User";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import { PopUp } from "./PopUp/PopUp";

export default function UserInfo({ user }: { user: User }) {
  const { name, email, phone } = user ?? {};
  const [ showPop, setShowPop] = useState(false)

  return (
    <div className={styles.card}>

      {/* Avatar */}
      <div className={styles.avatar}>
        <button>
          <FaPen onClick={() => setShowPop(true)} />
        </button>
      </div>

      {/* Nombre */}
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.role}>COMENSAL</p>

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

      <div className={styles.infoRow}>
        <div className={styles.half}>
          <span className={styles.label}>UBICACION</span>
          <span className={styles.value}>Buenos Aires, Arg</span>
        </div>

        <div className={styles.half}>
          <span className={styles.label}>RESERVAS</span>
          <span className={styles.value}>2</span>
        </div>
      </div>
      {showPop && <PopUp /* product={product}*/ setShowPop={setShowPop} />}
    </div>
  );
}
