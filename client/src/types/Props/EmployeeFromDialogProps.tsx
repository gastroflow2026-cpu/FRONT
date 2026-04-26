import { CreateEmployeePayload } from "../Employee";

export interface EmployeeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: CreateEmployeePayload) => Promise<void> | void;
}
