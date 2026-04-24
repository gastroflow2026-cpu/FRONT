"use client";

import styles from "./UserInfo.module.css";
import { User } from "@/types/User";
import { useState, useMemo } from "react";
import { FaPen } from "react-icons/fa";
import { PopUp } from "./PopUp/PopUp";
import Image from "next/image";

export default function UserInfo({ user }: { user: User }) {
  const { id, name, email, phone, imgUrl } = user ?? {};
  const [showPop, setShowPop] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar}>
          {imgUrl && (
            <Image
              src={imgUrl}
              alt="Foto de perfil"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        <button
          onClick={() => setShowPop(true)}
          className={styles.editButton}
          type="button"
        >
          <FaPen />
        </button>
      </div>

      <h2 className={styles.name}>{name}</h2>
      <p className={styles.role}>COMENSAL</p>

      <div className={styles.infoRow}>
        <div className={styles.half}>
          <span className={styles.label}>CORREO</span>
          <span className={styles.value}>{email}</span>
        </div>
        <div className={styles.half}>
              <span className={styles.label}>NÚMERO</span>
              <span className={styles.value}>{phone || "No disponible"}</span>
            </div>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.half}>
          <span className={styles.label}>UBICACION</span>
          <span className={styles.value}>No disponible</span>
        </div>
        <div className={styles.half}>
          <span className={styles.label}>RESERVAS</span>
          <span className={styles.value}>0</span>
        </div>
      </div>

      {showPop && <PopUp setShowPop={setShowPop} id={id} />}
    </div>
  );
}
