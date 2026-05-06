"use client";

import { Key, UserCog } from "lucide-react";
import styles from "./EmployeeCard.module.css";
import { EmployeeCardProps } from "@/types/Props/EmployeeCardProps";

export function EmployeeCard({
  employee,
  onToggleStatus,
  isStatusUpdating = false,
  onChangePassword,
  onChangeRole
}: EmployeeCardProps) {
  const initials = `${employee.name?.[0] ?? "E"}${employee.lastName?.[0] ?? ""}`.toUpperCase();
  const roleClass = styles[employee.role] || styles.defaultRole;

  return (
    <div className={styles.card}>
      <div className={styles.avatarSection}>
        {employee.avatar ? (
          <img src={employee.avatar} alt={employee.name} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarFallback}>{initials}</div>
        )}
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.name}>{employee.name} {employee.lastName}</h3>
        <p className={styles.email}>{employee.email}</p>
      </div>

      <span className={`${styles.badge} ${roleClass}`}>
        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
      </span>

      <div className={styles.statusRow}>
        <span className={styles.statusText}>{employee.isActive ? "Activo" : "Inactivo"}</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={employee.isActive}
            disabled={isStatusUpdating}
            onChange={(e) => onToggleStatus(employee.id, e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.actionsGrid}>
        <button className={styles.actionBtn} onClick={() => onChangeRole(employee)}>
          <UserCog size={18} />
          Cambiar Rol
        </button>
        <button className={styles.actionBtn} onClick={() => onChangePassword(employee.id)}>
          <Key size={18} />
          Contraseña
        </button>
      </div>
    </div>
  );
}