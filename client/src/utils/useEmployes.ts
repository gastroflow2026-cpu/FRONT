"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { adminService } from "@/services/adminService";
import axios from "axios";
import { CreateEmployeePayload, Employee } from "@/types/Employee";

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

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 filtros
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error cargando empleados",
        text: "No se pudo obtener el listado.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && emp.isActive) ||
        (statusFilter === "inactive" && !emp.isActive);

      const matchRole =
        roleFilter === "all" || emp.role === roleFilter;

      return matchStatus && matchRole;
    });
  }, [employees, statusFilter, roleFilter]);

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    const prev = employees;

    setEmployees((curr) =>
      curr.map((emp) =>
        emp.id === id ? { ...emp, isActive } : emp
      )
    );

    try {
      const updated = await adminService.updateEmployeeStatus(id, isActive);

      setEmployees((curr) =>
        curr.map((emp) =>
          emp.id === id ? updated : emp
        )
      );

      Swal.fire("Éxito", "Estado actualizado", "success");
    } catch (err) {
      setEmployees(prev);
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const handleCreateEmployee = async (payload: CreateEmployeePayload) => {
    try {
      const employee = await adminService.createEmployee(payload);

      setEmployees((prev) => [...prev, employee]);

      Swal.fire("Éxito", "Empleado creado", "success");
      return true;
    } catch (err) {
      const backendMessage = getBackendErrorMessage(err);

      Swal.fire(
        "Error",
        backendMessage || "No se pudo crear el empleado",
        "error"
      );

      return false;
    }
  };

  const handleChangeRole = async (id: string, role: string) => {
    try {
      const result = await Swal.fire({
        title: "¿Cambiar rol del empleado?",
        text: "Esta acción actualizará el rol del empleado en el sistema.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cambiar rol",
        cancelButtonText: "Cancelar"
      })

      if (!result.isConfirmed) return;

      await adminService.changeEmployeeRole(id, role)

      Swal.fire("Rol actualizado", `El rol del empleado ha sido cambiado a ${role} exitosamente`, "success")
      return true
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar", "error")
    }
  }

  return {
    employees: filteredEmployees,
    loading,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    handleToggleStatus,
    handleCreateEmployee,
    handleChangeRole
  };
}