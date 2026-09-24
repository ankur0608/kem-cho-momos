import { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaBurger,
    FaMugHot,
    FaLayerGroup,
    FaChartSimple,
    FaBagShopping,
} from "react-icons/fa6";
import {
    Order,
    DashboardData,
    DashboardStats,
} from "@/components/Dashboard/type/dashboard";

const itemIcons: Record<string, { icon: any; color: string }> = {
    vadapav: { icon: FaBurger, color: "text-orange-500" },
    sandwich: { icon: FaLayerGroup, color: "text-green-600" },
    fries: { icon: FaChartSimple, color: "text-yellow-600" },
    beverage: { icon: FaMugHot, color: "text-blue-600" },
    coffee: { icon: FaMugHot, color: "text-amber-700" },
};

const categoryColors: Record<string, string> = {
    vadapav: "bg-orange-500",
    sandwiches: "bg-green-500",
    "fries & sides": "bg-yellow-500",
    beverages: "bg-blue-500",
};

const calculateStats = (orders: Order[]): DashboardStats => {
    let revenue = 0;
    let pending = 0;
    let completed = 0;
    let dineIn = 0;
    let parcel = 0;

    for (const o of orders) {
        const status = o.status.toLowerCase();
        if (status === "completed") {
            revenue += o.total;
            completed++;
        }
        if (status === "new") pending++;
        if (o.orderType === "Dine in") dineIn++;
        if (o.orderType === "Parcel") parcel++;
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
        const fetchOrders = async () => {
            setLoading(true);

            let url = `/api/orders?limit=5000`;

            if (timeFilter === "Today") {
                url += `&dashboard=today`;
            } else {
                url += `&dashboard=all`;
            }

            if (paymentFilter !== "All") {
                url += `&paymentMode=${paymentFilter.toUpperCase()}`;
            }

            try {
                const response = await fetch(url);
                const data = await response.json();
                setOrders(data.orders || []);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
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

        const completed = orders.filter(
            (o) => o.status.toLowerCase() === "completed"
        );

        const itemMap = new Map();
        const categoryMap = new Map();
        let totalRevenue = 0;

        for (const order of completed) {
            for (const item of order.cart) {
                const { name, quantity, price, category = "Other" } = item;
                const rev = quantity * price;

                totalRevenue += rev;
                const key = category.toLowerCase();

                const iconKey =
                    key.includes("vada") ? "vadapav" :
                        key.includes("sand") ? "sandwich" :
                            key.includes("fries") ? "fries" :
                                key.includes("coffee") || key.includes("beverage")
                                    ? "beverage"
                                    : "vadapav";

                const existing = itemMap.get(name) || {
                    count: 0,
                    revenue: 0,
                    icon: itemIcons[iconKey]?.icon || FaBagShopping,
                    colorIcon: itemIcons[iconKey]?.color || "text-gray-500",
                };

                itemMap.set(name, {
                    count: existing.count + quantity,
                    revenue: existing.revenue + rev,
                    icon: existing.icon,
                    colorIcon: existing.colorIcon,
                });

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
            .slice(0, 3);

        let salesByCategory = Array.from(categoryMap.entries())
            .map(([category, rev]) => ({
                name: category,
                percent: totalRevenue
                    ? Math.round((rev / totalRevenue) * 100)
                    : 0,
                color:
                    categoryColors[category.toLowerCase()] || "bg-gray-500",
            }))
            .sort((a, b) => b.percent - a.percent);

        if (totalRevenue === 0) {
            salesByCategory = [
                { name: "No Sales Recorded", percent: 100, color: "bg-gray-400" },
            ];
        }

        return {
            stats: statsMap,
            popularItems,
            salesByCategory,
            recentOrders: orders,
        };
    }, [orders, timeFilter, paymentFilter, todayStart, loading]);

    const recentOrdersToShow = useMemo(() => {
        const sorted = [...dashboardData.recentOrders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return sorted.slice(0, 5);
    }, [dashboardData.recentOrders]);

    return {
        dashboardData,
        loading,
        recentOrdersToShow,
    };
};