"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeFormDialog } from "./EmployeeCardDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import Swal from "sweetalert2";
import styles from "./Employees.module.css";
import { Employee } from "@/types/Employee";

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "Carlos",
      lastName: "Rodríguez",
      email: "carlos@restaurant.com",
      role: "cocinero",
      isActive: true,
    },
    {
      id: "2",
      name: "María",
      lastName: "González",
      email: "maria@restaurant.com",
      role: "mesero",
      isActive: true,
    },
    {
      id: "3",
      name: "Juan",
      lastName: "Pérez",
      email: "juan@restaurant.com",
      role: "cajero",
      isActive: false,
    },
  ]);

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

  const handleToggleStatus = (id: string, isActive: boolean) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, isActive } : emp))
    );

    Swal.fire({
      icon: "success",
      title: isActive ? "Empleado activado" : "Empleado desactivado",
      text: `El empleado ha sido ${isActive ? "dado de alta" : "dado de baja"} exitosamente.`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleCreateEmployee = (newEmployee: Omit<Employee, "id" | "isActive">) => {
    const employee: Employee = {
      ...newEmployee,
      id: Date.now().toString(),
      isActive: true,
    };

    setEmployees((prev) => [...prev, employee]);
    setIsDialogOpen(false);

    Swal.fire({
      icon: "success",
      title: "Empleado creado",
      text: `${employee.name} ${employee.lastName} ha sido agregado exitosamente.`,
      confirmButtonColor: "#ea580c",
    });
  };

  // Función para abrir el modal de contraseña
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

  const handleChangePassword = (employeeId: string, newPassword: string) => {
    // Aquí iría tu llamada a la API
    setPasswordDialog((prev) => ({ ...prev, isOpen: false }));
    
    Swal.fire({
      icon: "success",
      title: "Contraseña actualizada",
      text: "La contraseña ha sido cambiada exitosamente.",
      confirmButtonColor: "#ea580c",
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
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

      <div className={styles.grid}>
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onToggleStatus={handleToggleStatus}
            onChangePassword={handleOpenPasswordDialog} // Nueva prop conectada
          />
        ))}
      </div>

      <EmployeeFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateEmployee}
      />

      {/* Nuevo Diálogo de Contraseña */}
      <ChangePasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() =>
          setPasswordDialog({ isOpen: false, employeeId: "", employeeName: "" })
        }
        onSubmit={handleChangePassword}
        employeeId={passwordDialog.employeeId}
        employeeName={passwordDialog.employeeName}
      />
    </div>
  );
}