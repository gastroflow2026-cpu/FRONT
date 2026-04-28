import { Category } from "./Category";

// src/types/MenuItem.ts
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // ← solo number, no string | number
  image_url: string;
  image?: string; // ← agregar para EditMenuItemDialog
  status: "disponible" | "agotado" | "inactivo"; // ← union literal, no string genérico
  category_id?: string;
}

export interface MenuCategory extends Category {
  items: MenuItem[];
}
