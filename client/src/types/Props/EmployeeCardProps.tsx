import { Employee } from "../Employee";

export interface EmployeeCardProps {
  employee: Employee;
  onToggleStatus: (id: string, active: boolean) => Promise<void> | void;
  onChangePassword: (id: string) => void
}
