"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeFormDialog } from "./EmployeeCardDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import Swal from "sweetalert2";
import styles from "./Employees.module.css";
import { CreateEmployeePayload, Employee } from "@/types/Employee";
import { adminService } from "@/services/adminService";
import axios from "axios";

const getBackendErrorMessage = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) return null;

  const data = error.response?.data as
    | { message?: unknown; error?: unknown }
    | undefined;

  if (Array.isArray(data?.message) && data.message.length > 0) {
    return data.message.map((item) => String(item)).join(" | ");
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error;
  }

  return null;
};

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    employeeId: string;
    employeeName: string;
  }>({
    isOpen: false,
    employeeId: "",
    employeeName: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await adminService.getAllEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("Error cargando empleados", err);
        Swal.fire({
          icon: "error",
          title: "Error cargando empleados",
          text: "No se pudo obtener el listado de empleados.",
          confirmButtonColor: "#ea580c",
        });
      }
    };

    fetchEmployees();
  }, []);

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    const previousEmployees = employees;

    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, isActive } : emp)));

    try {
      const updatedEmployee = await adminService.updateEmployeeStatus(id, isActive);

      setEmployees((prev) => prev.map((emp) => (emp.id === id ? updatedEmployee : emp)));

      Swal.fire({
        icon: "success",
        title: isActive ? "Empleado activado" : "Empleado desactivado",
        text: `El empleado ha sido ${isActive ? "dado de alta" : "dado de baja"} exitosamente.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error actualizando estado del empleado", err);
      setEmployees(previousEmployees);

      Swal.fire({
        icon: "error",
        title: "Error actualizando empleado",
        text: "No se pudo cambiar el estado del empleado.",
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleCreateEmployee = async (newEmployee: CreateEmployeePayload) => {
    try {
      const employee = await adminService.createEmployee(newEmployee);

      setEmployees((prev) => [...prev, employee]);
      setIsDialogOpen(false);

      Swal.fire({
        icon: "success",
        title: "Empleado creado",
        text: `${employee.name} ${employee.lastName} ha sido agregado exitosamente.`,
        confirmButtonColor: "#ea580c",
      });
    } catch (err) {
      console.error("Error creando empleado", err);

      const backendMessage = getBackendErrorMessage(err);
      const isConflict = axios.isAxiosError(err) && err.response?.status === 409;
      const fallbackConflictMessage =
        "Ya existe un usuario con ese email. Probá con otro correo.";
      const fallbackGenericMessage =
        "No se pudo crear el empleado. Revisá los datos e intentá nuevamente.";

      Swal.fire({
        icon: "error",
        title: "Error creando empleado",
        text:
          backendMessage ||
          (isConflict ? fallbackConflictMessage : fallbackGenericMessage),
        confirmButtonColor: "#ea580c",
      });
    }
  };

  const handleOpenPasswordDialog = (id: string) => {
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      setPasswordDialog({
        isOpen: true,
        employeeId: id,
        employeeName: `${employee.name} ${employee.lastName}`,
      });
    }
  };

  const handleChangePassword = async (employeeId: string, newPassword: string) => {
    try {
      await adminService.changeEmployeePassword(employeeId, newPassword);
      setPasswordDialog((prev) => ({ ...prev, isOpen: false }));

      Swal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        text: "La contraseña ha sido cambiada exitosamente.",
        confirmButtonColor: "#ea580c",
      });
    } catch (err) {
      console.error("Error actualizando contraseña", err);

      Swal.fire({
        icon: "error",
        title: "Error actualizando contraseña",
        text: "No se pudo cambiar la contraseña del empleado.",
        confirmButtonColor: "#ea580c",
      });

      throw err;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Gestión de Empleados</h2>
          <p>Administra el personal del restaurante</p>
        </div>

        <button className={styles.addButton} onClick={() => setIsDialogOpen(true)}>
          <Plus size={18} />
          Nuevo Empleado
        </button>
      </header>

      <div className={styles.grid}>
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onToggleStatus={handleToggleStatus}
            onChangePassword={handleOpenPasswordDialog}
          />
        ))}
      </div>

      <EmployeeFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateEmployee}
      />

      <ChangePasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog({ isOpen: false, employeeId: "", employeeName: "" })}
        onSubmit={handleChangePassword}
        employeeId={passwordDialog.employeeId}
        employeeName={passwordDialog.employeeName}
      />
    </div>
  );
}
