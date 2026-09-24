export interface MenuItem {
  _id?: string;

  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: boolean;
  
  badge?: string;
  isMostLoved?: boolean;
  
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}
