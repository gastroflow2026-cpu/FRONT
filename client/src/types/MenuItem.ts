export type MenuItemStatus = "disponible" | "agotado" | "inactivo";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  image_url?: string | null;
  status: MenuItemStatus;
  category_id?: string;
}

export interface MenuCategory {
  id?: string;
  name?: string;
  description?: string | null;
  display_order?: number;
  category_id?: string;
  category_name?: string;
  category_description?: string | null;
  items: MenuItem[];
}