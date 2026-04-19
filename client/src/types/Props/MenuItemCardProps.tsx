export interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    status: "disponible" | "agotado" | "inactivo";
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "disponible" | "agotado" | "inactivo") => void;
}