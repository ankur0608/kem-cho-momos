// app/history/types.ts
export interface HistoryItem {
  name: string;
  qty: number; 
  price: number;
}

export interface HistoryOrder {
  id: string; 
  customer: string;
  date: string;
  time: string;
  items: HistoryItem[];
  total: number;
  status: 'Completed' | 'New' | 'Rejected';
  discount: number;
}
export interface HistoryItem {
    name: string;
    qty: number;
    price: number;
}

export interface HistoryOrder {
    id: string;
    customer: string;
    date: string;
    time: string;
    total: number;
    status: 'New' | 'Completed' | 'Rejected';
    discount: number;
    items: HistoryItem[];
}

export interface OrderDetails extends HistoryOrder {
    deliveryAddress: string;
    paymentMethod: string;
    notes?: string;
}