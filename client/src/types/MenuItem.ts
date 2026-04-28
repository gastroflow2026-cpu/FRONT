<<<<<<< HEAD
export type MenuItemStatus = "disponible" | "agotado" | "inactivo";

=======
import { Category } from "./Category";

// src/types/MenuItem.ts
>>>>>>> f1817539d8b2e005ae5812688d47f20a4abe577b
export interface MenuItem {
  id: string;
  name: string;
  description: string;
<<<<<<< HEAD
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
=======
  price: number; // ← solo number, no string | number
  image_url: string;
  image?: string; // ← agregar para EditMenuItemDialog
  status: "disponible" | "agotado" | "inactivo"; // ← union literal, no string genérico
  category_id?: string;
}

export interface MenuCategory extends Category {
>>>>>>> f1817539d8b2e005ae5812688d47f20a4abe577b
  items: MenuItem[];
}