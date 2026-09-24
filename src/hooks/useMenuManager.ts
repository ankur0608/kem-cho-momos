import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface MenuItem {
    _id?: string;
    name: string;
    price: number;
    category: string;
    stock: boolean;
    imageUrl: string;
    description: string;
}

interface MenuResponse {
    items: MenuItem[];
    totalPages: number;
    currentPage: number;
}

const ITEMS_PER_PAGE = 12;

interface ItemToDelete {
    id: string;
    name: string;
}

interface UseMenuManagerResult {
    menuItems: MenuItem[];
    activeFilter: string;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    loadMenu: () => Promise<void>;
    setActiveFilter: (filter: string) => void;
    setCurrentPage: (page: number) => void;
    handleSaveSuccess: (isNew: boolean, item?: MenuItem) => Promise<void>;
    toggleStock: (item: MenuItem) => Promise<void>;
    confirmDelete: (itemToDelete: ItemToDelete) => Promise<void>;
    categories: string[];
}

export const useMenuManager = (): UseMenuManagerResult => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);

    // --------------------------------------------------
    // Load menu (fetch)
    // --------------------------------------------------
    const loadMenu = useCallback(async () => {
        setIsLoading(true);
        try {
            const categoryQuery =
                activeFilter !== "All" ? `&category=${activeFilter}` : "";
            const pageQuery = `page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

            const res = await fetch(
                `/api/menu?${pageQuery}${categoryQuery}`,
                { cache: "no-store" }
            );

            if (!res.ok) throw new Error("Failed to fetch menu.");

            const data: MenuResponse & { categories?: string[] } = await res.json();

            setMenuItems(data.items);
            setTotalPages(data.totalPages);
            if (data.categories) {
                setCategories(data.categories);
            }

            if (currentPage > data.totalPages && data.totalPages > 0) {
                setCurrentPage(data.totalPages);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to load menu. Check network connection.");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, activeFilter]);

    // Initial + dependency-based load
    useEffect(() => {
        loadMenu();
    }, [loadMenu]);

    // Reset page when filter changes
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            loadMenu(); // ✅ reload even if already on page 1
        }
    }, [activeFilter]);

    // --------------------------------------------------
    // Handle save success (FIXED)
    // --------------------------------------------------
    const handleSaveSuccess = useCallback(
        async (isNew: boolean, updatedItem?: MenuItem) => {
            if (isNew) {
                setCurrentPage(1);
                await loadMenu(); // ✅ force refresh after add
            } else if (updatedItem) {
                await loadMenu(); // Refresh list after edits so sortOrder changes take effect
            }
        },
        [loadMenu]
    );

    // --------------------------------------------------
    // Toggle stock
    // --------------------------------------------------
    const toggleStock = useCallback(async (item: MenuItem) => {
        const action = item.stock ? "Out of Stock" : "Back in Stock";
        const loadingToast = toast.loading(`${action} for ${item.name}...`);

        try {
            const res = await fetch(`/api/menu/${item._id!}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stock: !item.stock }),
            });

            const updated = await res.json();

            toast.dismiss(loadingToast);

            if (res.ok) {
                setMenuItems((prev) =>
                    prev.map((i) => (i._id === updated._id ? updated : i))
                );
                toast.success(`"${item.name}" set to ${action}.`);
            } else {
                toast.error(`Failed to change stock for "${item.name}".`);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Network error. Failed to update stock.");
        }
    }, []);

    // --------------------------------------------------
    // Delete item
    // --------------------------------------------------
    const confirmDelete = useCallback(
        async (itemToDelete: ItemToDelete) => {
            const { id, name } = itemToDelete;
            const loadingToast = toast.loading(`Deleting "${name}"...`);

            try {
                const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });

                toast.dismiss(loadingToast);

                if (res.ok) {
                    toast.success(`Product "${name}" deleted successfully.`);
                    await loadMenu(); // ✅ reload after delete
                } else {
                    toast.error(`Failed to delete "${name}".`);
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error("Network error. Failed to delete product.");
            }
        },
        [loadMenu]
    );

    return {
        menuItems,
        activeFilter,
        currentPage,
        totalPages,
        isLoading,
        loadMenu,
        setActiveFilter,
        setCurrentPage,
        handleSaveSuccess,
        toggleStock,
        confirmDelete,
        categories,
    };
};
