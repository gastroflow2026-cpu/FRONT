export interface EmployeeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }) => void;
}