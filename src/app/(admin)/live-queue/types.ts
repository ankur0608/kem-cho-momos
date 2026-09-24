// app/live-queue/types.ts

export interface QueueItem {
  name: string;
  qty: number;
}

export interface QueueOrder {
  id: number;
  customer: string;
  type: 'Delivery' | 'Dine-in';
  paymentStatus: 'COD' | 'Paid';
  time: string; // e.g. "Just now", "10:45 AM"
  items: QueueItem[];
  total: number;
  status: 'New' | 'Cooking';
}