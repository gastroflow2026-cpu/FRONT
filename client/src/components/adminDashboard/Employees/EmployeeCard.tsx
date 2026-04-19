"use client";

import { EmployeeCardProps } from "@/types/Props/EmployeeCardProps";
import styles from "./EmployeeCard.module.css";

export function EmployeeCard({ employee, onToggleStatus }: EmployeeCardProps) {
  const initials = `${employee.name[0]}${employee.lastName[0]}`.toUpperCase();
  
  const roleClass = styles[employee.role] || styles.defaultRole;

  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {employee.avatar ? (
          <img src={employee.avatar} alt={employee.name} />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div>
        <h3 className={styles.name}>{employee.name} {employee.lastName}</h3>
        <p className={styles.email}>{employee.email}</p>
      </div>

      <span className={`${styles.badge} ${roleClass}`}>
        {employee.role}
      </span>

      <div className={styles.statusContainer}>
        <span className={styles.statusText}>
          {employee.isActive ? "Activo" : "Inactivo"}
        </span>
        
        <label className={styles.switch}>
          <input 
            type="checkbox" 
            checked={employee.isActive}
            onChange={(e) => onToggleStatus(employee.id, e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
}