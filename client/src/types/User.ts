export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  imgUrl?: string | null;
  roles?: string[];
}