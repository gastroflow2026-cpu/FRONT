import { Category } from "../Category";
import { MenuItem, MenuItemStatus } from "../MenuItem";

export type MenuItemFormData = {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  status: MenuItemStatus;
  allergens: string;
  tags: string;
  prep_time_minutes: number;
  display_order: number;
};

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemFormData) => void;
  categories: Category[];
  item?: MenuItem | null; // Si existe, es modo EDICIÓN
}

const INITIAL_STATE = {
  name: "",
  description: "",
  price: "",
  image: "",
  category_id: "",
  status: "disponible" as MenuItemStatus,
  allergens: "",
  tags: "",
  prep_time_minutes: "15",
  display_order: "1",
};