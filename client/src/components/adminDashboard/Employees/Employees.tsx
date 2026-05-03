"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeFormDialog } from "./EmployeeCardDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import styles from "./Employees.module.css";
import { useEmployees } from "@/utils/useEmployes";
import { Employee } from "@/types/Employee";

export function Employees() {
  const {
    employees,
    loading,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    handleToggleStatus,
    handleCreateEmployee,
  } = useEmployees();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [passwordDialog, setPasswordDialog] = useState({
    isOpen: false,
    employeeId: "",
    employeeName: "",
  });

  const handleOpenPasswordDialog = (employee: any) => {
    setPasswordDialog({
      isOpen: true,
      employeeId: employee.id,
      employeeName: `${employee.name} ${employee.lastName}`,
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2>Gestión de Empleados</h2>
          <p>Administra el personal del restaurante</p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus size={18} />
          Nuevo Empleado
        </button>
      </header>

      <div className={styles.filters}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className={`${styles.filterSelect} ${
            statusFilter !== "all" ? styles.active : ""
          }`}
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={`${styles.filterSelect} ${
            roleFilter !== "all" ? styles.active : ""
          }`}
        >
          <option value="all">Todos</option>
          <option value="mesero">Meseros</option>
          <option value="cocinero">Cocineros</option>
          <option value="cajero">Cajeros</option>
        </select>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <p>Cargando empleados...</p>
        ) : employees.length > 0 ? (
          employees.map((employee: Employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onToggleStatus={handleToggleStatus}
              onChangePassword={() => handleOpenPasswordDialog(employee)}
            />
          ))
        ) : (
          <p>No hay empleados con esos filtros</p>
        )}
      </div>

      <EmployeeFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={async (data) => {
          const success = await handleCreateEmployee(data);
          if (success) setIsDialogOpen(false);
        }}
      />

      <ChangePasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() =>
          setPasswordDialog({
            isOpen: false,
            employeeId: "",
            employeeName: "",
          })
        }
        onSubmit={() => {}}
        employeeId={passwordDialog.employeeId}
        employeeName={passwordDialog.employeeName}
      />
    </div>
  );
}
