import { Employee } from "../Employee";

export interface EmployeeCardProps {
  employee: Employee;
  onToggleStatus: (id: string, active: boolean) => void;
  onChangePassword: (id: string) => void
}