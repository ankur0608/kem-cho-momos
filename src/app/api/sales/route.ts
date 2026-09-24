import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

interface CartEntry {
    name: string;
    price: number;
    quantity: number;
    category: string;
}

interface OrderDoc {
    status: string;
    cart: CartEntry[];
}

interface SalesItem {
    name: string;
    category: string;
    price: number;
    totalQuantitySold: number;
    totalRevenue: number;
    previousQuantitySold: number;
}

const ITEMS_PER_PAGE = 10;

function getDateRanges(view: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (view === "today") {
        const yesterdayStart = new Date(startOfToday);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(now);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

        return {
            currentStart: startOfToday,
            currentEnd: now,
            previousStart: yesterdayStart,
            previousEnd: yesterdayEnd,
        };
    }

    // all time — previous period is empty (no comparison)
    return {
        currentStart: new Date(0),
        currentEnd: now,
        previousStart: new Date(0),
        previousEnd: new Date(0),
    };
}

function aggregateOrders(
    orders: OrderDoc[]
): Map<string, { quantity: number; revenue: number; price: number; category: string }> {
    const map = new Map<string, { quantity: number; revenue: number; price: number; category: string }>();

    orders.forEach((order) => {
        if (order.status !== "completed") return;
        order.cart.forEach((item) => {
            const existing = map.get(item.name);
            if (existing) {
                existing.quantity += item.quantity;
                existing.revenue += item.price * item.quantity;
            } else {
                map.set(item.name, {
                    quantity: item.quantity,
                    revenue: item.price * item.quantity,
                    price: item.price,
                    category: item.category || "Other",
                });
            }
        });
    });

    return map;
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const view = searchParams.get("view") || "today";
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Number(searchParams.get("limit")) || ITEMS_PER_PAGE;

        const { currentStart, currentEnd, previousStart, previousEnd } = getDateRanges(view);

        const [currentOrders, previousOrders] = await Promise.all([
            Order.find({ createdAt: { $gte: currentStart, $lte: currentEnd } }).lean(),
            Order.find({ createdAt: { $gte: previousStart, $lte: previousEnd } }).lean(),
        ]);

        const currentMap = aggregateOrders(currentOrders as unknown as OrderDoc[]);
        const previousMap = aggregateOrders(previousOrders as unknown as OrderDoc[]);

        const allNames = new Set([...currentMap.keys(), ...previousMap.keys()]);

        const allItems: SalesItem[] = Array.from(allNames)
            .map((name): SalesItem | null => {
                const cur = currentMap.get(name) || { quantity: 0, revenue: 0, price: 0, category: "" };
                const prev = previousMap.get(name) || { quantity: 0, revenue: 0, price: 0, category: "" };
                const price = cur.price > 0 ? cur.price : prev.price;
                const cat = cur.category || prev.category || "Other";

                if (price === 0 && cur.quantity === 0 && prev.quantity === 0) return null;

                return {
                    name,
                    category: cat,
                    price,
                    totalQuantitySold: cur.quantity,
                    totalRevenue: cur.revenue,
                    previousQuantitySold: prev.quantity,
                };
            })
            .filter((item): item is SalesItem => item !== null)
            .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);

        // Unique categories from full unfiltered dataset
        const uniqueCategories = Array.from(new Set(allItems.map((i: SalesItem) => i.category))).sort();
        const totalAll = allItems.length;

        // Apply search filter
        let filtered: SalesItem[] = search
            ? allItems.filter((i: SalesItem) => i.name.toLowerCase().includes(search.toLowerCase()))
            : allItems;

        // Apply category filter
        if (category && category !== "All Categories") {
            filtered = filtered.filter((i: SalesItem) => i.category === category);
        }

        const totalResults = filtered.length;
        const totalRevenue = filtered.reduce((sum: number, i: SalesItem) => sum + i.totalRevenue, 0);
        const totalPages = Math.ceil(totalResults / limit);
        const startIndex = (page - 1) * limit;
        const items = filtered.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            items,
            totalResults,
            totalAll,
            totalRevenue,
            totalPages,
            uniqueCategories,
            currentPage: page,
        });
    } catch (error) {
        console.error("Sales report API error:", error);
        return NextResponse.json({ error: "Failed to fetch sales report" }, { status: 500 });
    }
}
