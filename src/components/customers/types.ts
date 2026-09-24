// types/customer.ts (UPDATED)

export interface Address {
  id: string;
  type: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerProfile {
  userId: string; 
  fullName: string;
  phoneNumber: string;
  email: string;
  addresses: Address[];
  updatedAt: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
}