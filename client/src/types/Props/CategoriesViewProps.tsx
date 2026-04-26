import { Category } from "../Category";

export interface CategoriesViewProps {
  categories: Category[];
  onCreateCategory: (category: { name: string; description: string }) => void;
  onUpdateCategory: (category: {
    id: string;
    name: string;
    description: string;
    is_active?: boolean;
  }) => void;
  onDeleteCategory: (id: string) => void;
}