import { Category } from "../Category";
import { MenuItem } from "../MenuItem";

export interface MenuViewProps {
  // menuItems: MenuItem[];
  categories: Category[];
  // onCreateItem: (item: Omit<MenuItem, "id">) => void;
  // onUpdateItem: (item: MenuItem) => void;
  // onDeleteItem: (id: string) => void;
  // onStatusChange: (id: string, status: "disponible" | "agotado" | "inactivo") => void;
}