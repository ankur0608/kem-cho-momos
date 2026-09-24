// src/types/dashboard.ts (Ensure this file exists)

export interface CartItem {
    name: string;
    price: number;
    quantity: number;
    category?: string;
}

export interface Order {
    _id: string;
    user: {
        fullName: string;
    } | null; // Added | null since user might be null/undefined for "Walk-in"
    cart: CartItem[];
    subtotal: number;
    discount: number;
    total: number; // This is the total money for the order
    status: 'completed' | 'new' | 'cancelled';
    createdAt: string;
    paymentMethod: 'Cash' | 'Online';
    orderType?: 'Dine in' | 'Parcel';
}

export interface DashboardStats {
    revenue: number;
    orders: number;
    avgTicket: number;
    pending: number;
    dineIn: number;
    parcel: number;
}

export interface SalesCategory {
    name: string;
    percent: number;
    color: string;
}

export interface PopularItem {
    name: string;
    orders: number;
    icon: any;
    colorIcon: string;
}

export interface DashboardData {
    stats: {
        Today: DashboardStats;
        All: DashboardStats;
    };
    popularItems: PopularItem[];
    salesByCategory: SalesCategory[];
    recentOrders: Order[];
}