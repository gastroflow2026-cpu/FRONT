export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string | number;
  image_url: string;
  status: string;
  category_id?: string;
}

export interface MenuCategory {
  category_id: string;
  category_name: string;
  category_description?: string | null;
  is_active?: boolean;
  display_order?: number;
  items: MenuItem[];
}
