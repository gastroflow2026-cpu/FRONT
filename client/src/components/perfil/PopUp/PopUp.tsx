"use client";

import styles from "./PopUp.module.css";
import { IoCloseCircleSharp } from "react-icons/io5";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "@/services/adminService";
import { UsersContext } from "@/context/UsersContext";
import Swal from "sweetalert2";

export interface PopUpProps {
  setShowPop: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
}

export const PopUp: React.FC<PopUpProps> = ({ setShowPop, id }) => {
  const { updateUser } = useContext(UsersContext);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getAuthHeaders();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/files/upload-image/${id}`, formData, token);
      
      updateUser({ imgUrl: res.data.imgUrl });
        await Swal.fire({
        icon: "success",
        title: "Foto actualizada",
        text: "Tu foto de perfil fue actualizada correctamente.",
        confirmButtonColor: "#f97316",
        timer: 2000,
        showConfirmButton: false,
        });

        setShowPop(false);
      } 
      catch{
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar la foto. Intentá de nuevo.",
          confirmButtonColor: "#f97316",
        });
      };
    };
    

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <IoCloseCircleSharp onClick={() => setShowPop(false)} />

        <form onSubmit={handleSubmit} className={styles.form}>
          <h4>Actualizar foto</h4>

          <div className={styles.avatar}>
            {preview && (
              <Image
                src={preview}
                alt="preview"
                fill
                className={styles.avatarImg}
              />
            )}
          </div>

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
