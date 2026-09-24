import { useState, useEffect, useMemo } from "react";
import {
    FaBurger,
    FaMugHot,
    FaLayerGroup,
    FaChartSimple,
    FaBagShopping,
    FaPizzaSlice,
} from "react-icons/fa6";
import {
    Order,
    DashboardData,
    DashboardStats,
} from "@/components/Dashboard/type/dashboard";

const itemIcons: Record<string, { icon: any; color: string }> = {
    vadapav: { icon: FaBurger, color: "text-orange-500" },
    sandwich: { icon: FaLayerGroup, color: "text-emerald-600" },
    fries: { icon: FaChartSimple, color: "text-yellow-600" },
    beverage: { icon: FaMugHot, color: "text-blue-500" },
    coffee: { icon: FaMugHot, color: "text-amber-700" },
    momos: { icon: FaPizzaSlice, color: "text-rose-600" },
};

const categoryColors: Record<string, string> = {
    vadapav: "bg-orange-500",
    sandwiches: "bg-emerald-500",
    "fries & sides": "bg-yellow-500",
    beverages: "bg-blue-500",
    momos: "bg-rose-500",
};

const calculateStats = (orders: Order[]): DashboardStats => {
    let revenue = 0;
    let pending = 0;
    let completed = 0;
    let dineIn = 0;
    let parcel = 0;

    for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        const status = o.status.toLowerCase();
        
        if (status === "completed") {
            revenue += o.total || 0;
            completed++;
        } else if (status === "new" || status === "preparing" || status === "accepted") {
            pending++;
        }

        const type = o.orderType?.toLowerCase();
        if (type === "dine in" || type === "dine-in") dineIn++;
        else if (type === "parcel" || type === "takeaway") parcel++;
    }

    return {
        revenue,
        orders: orders.length,
        avgTicket: completed > 0 ? Math.round(revenue / completed) : 0,
        pending,
        dineIn,
        parcel,
    };
};

export const useDashboardData = (timeFilter: string, paymentFilter: "All" | "Cash" | "Online") => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        const fetchOrders = async () => {
            setLoading(true);

            // Using URLSearchParams for robust query param handling
            const params = new URLSearchParams({ limit: "5000" });
            
            if (timeFilter === "Today") {
                params.append("dashboard", "today");
            } else {
                params.append("dashboard", "all");
            }

            if (paymentFilter !== "All") {
                params.append("paymentMode", paymentFilter.toUpperCase());
            }

            try {
                const response = await fetch(`/api/orders?${params.toString()}`);
                if (!response.ok) throw new Error("Failed to fetch");
                
                const data = await response.json();
                if (isMounted) {
                    setOrders(data.orders || []);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                if (isMounted) {
                    setOrders([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchOrders();
        
        return () => {
            isMounted = false;
        };
    }, [timeFilter, paymentFilter]);

    const todayStart = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const dashboardData: DashboardData = useMemo(() => {
        if (orders.length === 0) {
            const zeroStats = { revenue: 0, orders: 0, avgTicket: 0, pending: 0, dineIn: 0, parcel: 0 };
            return {
                stats: { Today: zeroStats, All: zeroStats },
                popularItems: [],
                salesByCategory: [],
                recentOrders: [],
            };
        }

        const currentStats = calculateStats(orders);

        const statsMap = {
            Today: timeFilter === "Today" ? currentStats : calculateStats(orders.filter(o => new Date(o.createdAt) >= todayStart)),
            All: timeFilter === "All" ? currentStats : currentStats,
        };

        const itemMap = new Map<string, { count: number; revenue: number; icon: any; colorIcon: string }>();
        const categoryMap = new Map<string, number>();
        let totalRevenueForItems = 0;

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            
            // Only count items for completed orders
            if (order.status.toLowerCase() !== "completed") continue;
            if (!order.cart || !Array.isArray(order.cart)) continue;

            for (let j = 0; j < order.cart.length; j++) {
                const item = order.cart[j];
                const name = item.name || "Unknown";
                const quantity = item.quantity || 1;
                const price = item.price || 0;
                const category = item.category || "Other";
                
                const rev = quantity * price;
                totalRevenueForItems += rev;
                const key = category.toLowerCase();

                let iconKey = "vadapav";
                if (key.includes("vada")) iconKey = "vadapav";
                else if (key.includes("sand")) iconKey = "sandwich";
                else if (key.includes("fries")) iconKey = "fries";
                else if (key.includes("coffee") || key.includes("beverage") || key.includes("drink")) iconKey = "beverage";
                else if (key.includes("momo") || name.toLowerCase().includes("momo")) iconKey = "momos";

                const existing = itemMap.get(name);
                if (existing) {
                    existing.count += quantity;
                    existing.revenue += rev;
                } else {
                    itemMap.set(name, {
                        count: quantity,
                        revenue: rev,
                        icon: itemIcons[iconKey]?.icon || FaBagShopping,
                        colorIcon: itemIcons[iconKey]?.color || "text-slate-500",
                    });
                }

                categoryMap.set(category, (categoryMap.get(category) || 0) + rev);
            }
        }

        const popularItems = Array.from(itemMap.entries())
            .map(([name, data]) => ({
                name,
                orders: data.count,
                icon: data.icon,
                colorIcon: data.colorIcon,
            }))
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 3); // Top 3 items

        let salesByCategory = Array.from(categoryMap.entries())
            .map(([category, rev]) => ({
                name: category,
                percent: totalRevenueForItems ? Math.round((rev / totalRevenueForItems) * 100) : 0,
                color: categoryColors[category.toLowerCase()] || "bg-slate-400",
            }))
            .sort((a, b) => b.percent - a.percent);

        if (totalRevenueForItems === 0) {
            salesByCategory = []; // We handle empty state in UI instead of a dummy item
        }

        return {
            stats: statsMap,
            popularItems,
            salesByCategory,
            recentOrders: orders,
        };
    }, [orders, timeFilter, todayStart]);

    const recentOrdersToShow = useMemo(() => {
        // Only slice the first 5 elements for better performance instead of sorting all 5000 (API already returns latest first usually)
        // If API doesn't guarantee sorting, we slice first then sort, but actually sorting 5000 dates isn't terrible in JS.
        // Let's do a fast sort and take top 5.
        return [...dashboardData.recentOrders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    }, [dashboardData.recentOrders]);

    return {
        dashboardData,
        loading,
        recentOrdersToShow,
    };
};