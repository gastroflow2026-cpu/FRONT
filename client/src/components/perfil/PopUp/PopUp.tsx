"use client";

import styles from "./PopUp.module.css";
import { IoCloseCircleSharp } from "react-icons/io5";
import Image from "next/image";
import { useState } from "react";

export interface PopUpProps {
  setShowPop: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PopUp: React.FC<PopUpProps> = ({ setShowPop }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <IoCloseCircleSharp onClick={() => setShowPop(false)} />
        <form action="#" className={styles.form}>
        <h4>Actualizar foto</h4>
          <div className={styles.avatar}>
            {preview ? (
              <Image
                src={preview}
                alt="preview"
                fill
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.placeholder}></div>
            )}
          </div>

          {/* Buttons */}
          <div className={styles.buttonBox}>
            <label htmlFor="file-upload" className={styles.inputLabel}>
              Cambiar Foto
            </label>
            <input
              id="file-upload"
              className={styles.input}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button type="submit">Aceptar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
