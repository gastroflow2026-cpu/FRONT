"use client";

import styles from "./UserInfo.module.css";
import { User } from "@/types/User";
import { useEffect, useMemo, useState } from "react";
import { FaPen } from "react-icons/fa";
import { PopUp } from "./PopUp/PopUp";
import Image from "next/image";
import axios from "axios";
import { getAuthHeaders } from "@/services/adminService";
import Swal from "sweetalert2";

const ROLE_LABELS: Record<string, string> = {
  customer: "Comensal",
  rest_admin: "Administrador",
  waiter: "Mozo",
  mesero: "Mozo",
  chef: "Cocinero",
  cocinero: "Cocinero",
  cashier: "Cajero",
  cajero: "Cajero",
};

export default function UserInfo({ user }: { user: User }) {
  const { id, name, email, phone, address, imgUrl, roles } = user ?? {};
  const [showPop, setShowPop] = useState(false);

  // Phone editing
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(phone || "");
  const [phoneError, setPhoneError] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  // Address editing
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressValue, setAddressValue] = useState(address || "");
  const [addressError, setAddressError] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!editingPhone) {
      setPhoneValue(phone || "");
    }
  }, [phone, editingPhone]);

  useEffect(() => {
    if (!editingAddress) {
      setAddressValue(address || "");
    }
  }, [address, editingAddress]);

  const syncSessionUser = (fields: Partial<User>) => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return;

      const parsedUser = JSON.parse(rawUser) as Record<string, unknown>;
      const nextUser = { ...parsedUser, ...fields };
      localStorage.setItem("user", JSON.stringify(nextUser));
    } catch {
      // Ignore malformed local user payloads and keep UI state as source of truth.
    }
  };

  const roleLabel = useMemo(() => {
    const rawRole = roles?.[0];
    if (!rawRole) return "Sin rol";
    const normalizedRole = rawRole.toLowerCase();
    return ROLE_LABELS[normalizedRole] ?? rawRole;
  }, [roles]);

  // ── Phone handlers ──────────────────────────────────────────────
  const validatePhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!val.trim()) return "El número es obligatorio";
    if (digits.length !== 10) return "El número debe tener exactamente 10 dígitos";
    return "";
  };

  const handlePhoneSave = async () => {
    const err = validatePhone(phoneValue);
    if (err) { setPhoneError(err); return; }
    setSavingPhone(true);
    try {
      await axios.patch(
        `${API_URL}/users/profile`,
        { phone: phoneValue },
        getAuthHeaders()
      );
      syncSessionUser({ phone: phoneValue });
      setEditingPhone(false);
      setPhoneError("");
      Swal.fire({ theme: "dark", icon: "success", title: "Número actualizado", timer: 1500, showConfirmButton: false });
    } catch {
      setPhoneError("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSavingPhone(false);
    }
  };

  const handlePhoneCancel = () => {
    setPhoneValue(phone || "");
    setPhoneError("");
    setEditingPhone(false);
  };

  // ── Address handlers ─────────────────────────────────────────────
  const validateAddress = (val: string) => {
    if (!val.trim()) return "La ubicación es obligatoria";
    if (val.trim().length < 5) return "Ingresá una dirección válida (mín. 5 caracteres)";
    if (!val.includes(",")) return "Incluí la ciudad separada por coma (ej: Av. Siempre Viva 123, La Plata)";
    return "";
  };

  const handleAddressSave = async () => {
    const err = validateAddress(addressValue);
    if (err) { setAddressError(err); return; }
    setSavingAddress(true);
    try {
      await axios.patch(
        `${API_URL}/users/profile`,
        { address: addressValue },
        getAuthHeaders()
      );
      syncSessionUser({ address: addressValue });
      setEditingAddress(false);
      setAddressError("");
      Swal.fire({ theme: "dark", icon: "success", title: "Ubicación actualizada", timer: 1500, showConfirmButton: false });
    } catch {
      setAddressError("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleAddressCancel = () => {
    setAddressValue(address || "");
    setAddressError("");
    setEditingAddress(false);
  };

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
      <p className={styles.role}>{roleLabel}</p>

      {/* Correo / Teléfono */}
      <div className={styles.infoRow}>
        <div className={styles.half}>
          <span className={styles.label}>CORREO</span>
          <span className={styles.value}>{email}</span>
        </div>
        <div className={styles.half}>
          <span className={styles.label}>NÚMERO</span>
          {editingPhone ? (
            <div className={styles.editField}>
              <input
                className={`${styles.editInput} ${phoneError ? styles.editInputError : ""}`}
                value={phoneValue}
                onChange={(e) => {
                  setPhoneValue(e.target.value);
                  setPhoneError(validatePhone(e.target.value));
                }}
                placeholder="Ej: 2215678901"
                maxLength={15}
                autoFocus
              />
              {phoneError && <span className={styles.editError}>{phoneError}</span>}
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handlePhoneSave} disabled={savingPhone}>
                  {savingPhone ? "..." : "Guardar"}
                </button>
                <button className={styles.cancelBtn} onClick={handlePhoneCancel} disabled={savingPhone}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.valueRow}>
              <span className={styles.value}>{phoneValue || "No disponible"}</span>
              <button className={styles.penBtn} onClick={() => setEditingPhone(true)} title="Editar número">
                <FaPen size={10} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ubicación / Reservas */}
      <div className={`${styles.infoRow} ${styles.autoRow}`}>
        <div className={styles.half}>
          <span className={styles.label}>UBICACIÓN</span>
          {editingAddress ? (
            <div className={styles.editField}>
              <input
                className={`${styles.editInput} ${addressError ? styles.editInputError : ""}`}
                value={addressValue}
                onChange={(e) => {
                  setAddressValue(e.target.value);
                  setAddressError(validateAddress(e.target.value));
                }}
                placeholder="Av. Siempre Viva 123, La Plata"
                maxLength={100}
                autoFocus
              />
              {addressError && <span className={styles.editError}>{addressError}</span>}
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handleAddressSave} disabled={savingAddress}>
                  {savingAddress ? "..." : "Guardar"}
                </button>
                <button className={styles.cancelBtn} onClick={handleAddressCancel} disabled={savingAddress}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className={`${styles.valueRow} ${styles.valueRowWrap}`}>
              <span className={`${styles.value} ${styles.multilineValue}`}>{addressValue || "No disponible"}</span>
              <button className={styles.penBtn} onClick={() => setEditingAddress(true)} title="Editar ubicación">
                <FaPen size={10} />
              </button>
            </div>
          )}
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
