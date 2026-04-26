export type EmployeeRole = "cocinero" | "cajero" | "mesero";

export interface Employee {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  isActive: boolean;
  avatar?: string;
}

export type CreateEmployeePayload = Omit<Employee, "id" | "isActive" | "avatar"> & {
  password: string;
};
