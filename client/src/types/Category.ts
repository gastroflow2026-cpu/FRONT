export interface Category {
  id: string;
  name: string;
  description?: string | null;
  display_order?: number;
  createdAt: string;
  is_active: boolean
}