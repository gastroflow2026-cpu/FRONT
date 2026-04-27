export type MenuItemStatus = "disponible" | "agotado" | "inactivo";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  status: MenuItemStatus;
  category_id: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
  items: MenuItem[];
}