export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  status: "disponible" | "agotado" | "inactivo";
}