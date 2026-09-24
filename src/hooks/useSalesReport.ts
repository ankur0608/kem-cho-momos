import { useState, useEffect, useCallback, useRef } from "react";
import {
    ArrowUpRight, ArrowDownRight, Minus,
    CircleDot, Sandwich, Coffee, Pizza, ShoppingBag, IceCream, UtensilsCrossed, Flame,
} from "lucide-react";

export interface SalesItem {
    name: string;
    price: number;
    totalQuantitySold: number;
    totalRevenue: number;
    previousQuantitySold: number;
    category: string;
}

export type ViewFilter = "all" | "today";

const ITEMS_PER_PAGE = 10;
const SALES_API_URL = "/api/sales";
const SEARCH_DEBOUNCE_MS = 400;

export const getItemIcon = (category: string) => {
    const cat = category ? category.toLowerCase() : "other";

    if (cat.includes("vadapav")) {
        return { Icon: CircleDot, bg: "bg-yellow-100", text: "text-yellow-600", category };
    }
    if (cat.includes("sandwich") || cat.includes("wrap") || cat.includes("burger") || cat.includes("toast")) {
        return { Icon: Sandwich, bg: "bg-orange-100", text: "text-orange-600", category };
    }
    if (cat.includes("pizza") || cat.includes("pasta") || cat.includes("maggi") || cat.includes("noodles")) {
        return { Icon: Pizza, bg: "bg-red-100", text: "text-red-500", category };
    }
    if (
        cat.includes("shake") || cat.includes("coffee") || cat.includes("tea") ||
        cat.includes("beverage") || cat.includes("mojito") || cat.includes("drink") || cat.includes("thick")
    ) {
        return { Icon: Coffee, bg: "bg-blue-100", text: "text-blue-500", category };
    }
    if (cat.includes("cream") || cat.includes("dessert") || cat.includes("chocolate") || cat.includes("brownie")) {
        return { Icon: IceCream, bg: "bg-pink-100", text: "text-pink-600", category };
    }
    if (
        cat.includes("fries") || cat.includes("nuggets") || cat.includes("side") ||
        cat.includes("starter") || cat.includes("momos") || cat.includes("puff")
    ) {
        return { Icon: ShoppingBag, bg: "bg-rose-100", text: "text-rose-600", category };
    }
    if (cat.includes("spicy") || cat.includes("special") || cat.includes("combo")) {
        return { Icon: Flame, bg: "bg-purple-100", text: "text-purple-600", category };
    }

    return { Icon: UtensilsCrossed, bg: "bg-gray-100", text: "text-gray-500", category };
};

export const getTrendData = (currentQty: number, previousQty: number) => {
    if (previousQty === 0) {
        if (currentQty > 0) {
            return { icon: ArrowUpRight, color: "text-green-700 bg-green-50 border-green-100", text: "New" };
        }
        return { icon: Minus, color: "text-gray-500 bg-gray-100 border-gray-200", text: "-" };
    }

    const percentageChange = (currentQty - previousQty) / previousQty;
    const TrendIcon = percentageChange >= 0 ? ArrowUpRight : ArrowDownRight;
    const colorClass = percentageChange >= 0
        ? "text-green-700 bg-green-50 border-green-100"
        : "text-red-700 bg-red-50 border-red-100";

    return {
        icon: TrendIcon,
        color: colorClass,
        text: `${(Math.abs(percentageChange) * 100).toFixed(0)}%`,
    };
};

export const useSalesReport = () => {
    const [currentData, setCurrentData] = useState<SalesItem[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [totalAll, setTotalAll] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");

    const [searchTerm, setSearchTermState] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilterState] = useState("All Categories");
    const [viewFilter, setViewFilterState] = useState<ViewFilter>("today");
    const [currentPage, setCurrentPage] = useState(1);

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clock
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
            setCurrentDate(now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // Fetch from /api/sales
    const fetchSalesData = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                view: viewFilter,
                page: String(currentPage),
                limit: String(ITEMS_PER_PAGE),
            });
            if (debouncedSearch) params.set("search", debouncedSearch);
            if (categoryFilter !== "All Categories") params.set("category", categoryFilter);

            const res = await fetch(`${SALES_API_URL}?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch sales");

            const data = await res.json();
            setCurrentData(data.items);
            setTotalResults(data.totalResults);
            setTotalAll(data.totalAll);
            setTotalRevenue(data.totalRevenue);
            setTotalPages(data.totalPages);
            setUniqueCategories(data.uniqueCategories);
        } catch (error) {
            console.error("Error fetching sales data:", error);
            setCurrentData([]);
            setTotalResults(0);
            setTotalAll(0);
            setTotalRevenue(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    }, [viewFilter, currentPage, debouncedSearch, categoryFilter]);

    useEffect(() => {
        fetchSalesData();
    }, [fetchSalesData]);

    // Debounced search setter
    const setSearchTerm = useCallback((value: string) => {
        setSearchTermState(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setCurrentPage(1);
        }, SEARCH_DEBOUNCE_MS);
    }, []);

    const setCategoryFilter = useCallback((value: string) => {
        setCategoryFilterState(value);
        setCurrentPage(1);
    }, []);

    const setViewFilter = useCallback((value: ViewFilter) => {
        setViewFilterState(value);
        setCurrentPage(1);
    }, []);

    const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const handlePreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

    // Export fetches all filtered data in one request
    const exportToCSV = useCallback(async () => {
        const params = new URLSearchParams({ view: viewFilter, page: "1", limit: "5000" });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (categoryFilter !== "All Categories") params.set("category", categoryFilter);

        const res = await fetch(`${SALES_API_URL}?${params.toString()}`);
        if (!res.ok) { alert("Failed to export!"); return; }

        const data = await res.json();
        const allItems: SalesItem[] = data.items;

        if (allItems.length === 0) { alert("No data to export!"); return; }

        const headers = ["Product Name", "Category", "Price (₹)", "Quantity Sold", "Total Revenue (₹)", "Previous Qty", "Trend"];
        const csvRows = allItems.map((item) => {
            const { text } = getTrendData(item.totalQuantitySold, item.previousQuantitySold);
            return [
                `"${item.name.replace(/"/g, '""')}"`,
                item.category,
                item.price,
                item.totalQuantitySold,
                item.totalRevenue.toFixed(2),
                item.previousQuantitySold,
                text,
            ].join(",");
        });

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Sales_Report_${viewFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [viewFilter, debouncedSearch, categoryFilter]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return {
        isLoading,
        currentTime,
        currentDate,
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        viewFilter,
        setViewFilter,
        uniqueCategories,
        currentData,
        totalRevenue,
        currentPage,
        totalResults,
        totalAll,
        totalPages,
        startIndex,
        endIndex,
        handleNextPage,
        handlePreviousPage,
        exportToCSV,
        itemsPerPage: ITEMS_PER_PAGE,
    };
};
