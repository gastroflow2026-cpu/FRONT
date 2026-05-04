"use client";

import styles from "./ChangeRoleDialog.module.css";
import { useState, useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: string) => Promise<void>;
  employeeName: string;
  currentRole: string;
}

const roles = [
  { label: "Cajero", value: "cajero" },
  { label: "Cocinero", value: "cocinero" },
  { label: "Mesero", value: "mesero" },
];

export const ChangeRoleDialog = ({
  isOpen,
  onClose,
  onSubmit,
  employeeName,
  currentRole,
}: Props) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");

    const roleClass = styles[currentRole] || styles.defaultRole;

  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      setError("El nuevo rol debe ser diferente al actual");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSubmit(selectedRole);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const currentLabel =
    roles.find((r) => r.value === currentRole)?.label || currentRole;

  const selectedLabel =
    roles.find((r) => r.value === selectedRole)?.label || selectedRole;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <h3>Cambiar Rol</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* NOMBRE */}
        <p className={styles.employeeName}>{employeeName}</p>

        {/* ROL ACTUAL */}
        <div className={styles.currentRoleBox}>
          <span className={styles.label}>Rol Actual:</span>
          <span className={`${styles.roleBadge} ${roleClass}`}>{currentLabel}</span>
        </div>

        {/* NUEVO ROL */}
        <div className={styles.field}>
          <label className={styles.label}>Nuevo Rol</label>

          <div
            className={styles.selectWrapper}
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`${styles.select} ${error ? styles.selectError : ""}`}
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <span>
                {selectedLabel}
                {selectedRole === currentRole && " (Actual)"}
              </span>
              <span className={styles.arrow}>▾</span>
            </div>

            {openDropdown && (
              <div className={styles.dropdown}>
                {roles.map((r) => (
                  <div
                    key={r.value}
                    className={`${styles.option} ${
                      r.value === selectedRole ? styles.selected : ""
                    }`}
                    onClick={() => {
                      setSelectedRole(r.value);
                      setOpenDropdown(false);
                      setError("");
                    }}
                  >
                    <span>
                      {r.label}
                      {r.value === currentRole && (
                        <span className={styles.current}> (Actual)</span>
                      )}
                    </span>

                    {r.value === selectedRole && (
                      <span className={styles.check}>✔</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {error && <span className={styles.error}>{error}</span>}
          </div>
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancel}>
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className={styles.submit}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};
