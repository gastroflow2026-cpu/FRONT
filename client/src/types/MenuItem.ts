export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  status: "disponible" | "agotado" | "inactivo";
  category_id?: string;
  category_name?: string;
}

export interface MenuCategory {
  category_id: string;
  category_name: string;
  category_description?: string | null;
  is_active?: boolean;
  display_order?: number;
  items: MenuItem[];
}
