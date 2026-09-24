export interface MenuItem {
  _id: string; // MongoDB ID
  name: string;
  price: number;
  imageUrl: string,
  category: string;
  description?: string; // Optional
  isAvailable?: boolean; // Keep for backward compatibility
  stock?: boolean;
  sortOrder?: number;
  code?: string; // ADDED: Optional code property to fix the TS error
}

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
}

export interface CartItem extends MenuItem {
  qty: number;
  id: string; // We map _id to id for easier frontend handling
}

export interface Ticket {
  _id: number;
  label: string;
  items: CartItem[];
  customer: string;
  mobile: string;      // ← ADD THIS
  couponCode: string;
  discount: number;
  PaymentMode: string;
  deliveryType?: string;
}
