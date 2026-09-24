// src/hooks/useOrderHistory.ts

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { HistoryOrder } from "@/components/history/types"; 
import { STATUS_OPTIONS } from "@/components/history/OrderHistoryHeader";

const ITEMS_PER_PAGE = 10;

interface UseOrderHistoryResult {
    orders: HistoryOrder[];
    loading: boolean;
    totalOrders: number;
    totalPages: number;
    isDeleting: boolean; 
    searchQuery: string;
    statusFilter: string;
    page: number;
    
    // Actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setPage: (page: number) => void;
    fetchOrders: () => Promise<void>;
    executeDelete: (orderId: string) => Promise<void>;
}

export const useOrderHistory = (): UseOrderHistoryResult => {
    const [orders, setOrders] = useState<HistoryOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalOrders, setTotalOrders] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); 
    const [page, setPage] = useState(1);
    
    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);

            let apiUrl = `/api/orders?page=${page}&limit=${ITEMS_PER_PAGE}`;

            if (debouncedSearchQuery) {
                apiUrl += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
            }

            if (statusFilter !== "All") {
                const filterOption = STATUS_OPTIONS.find(
                    (opt) => opt.value === statusFilter
                );
                if (filterOption && filterOption.backendValue) {
                    apiUrl += `&status=${filterOption.backendValue}`;
                }
            }

            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Failed to fetch orders");

            const data = await res.json();
            setTotalOrders(data.total);

            const mapped: HistoryOrder[] = data.orders.map((o: any) => ({
                id: o._id,
                customer: o.user?.fullName || "Walk-in",
                date: new Date(o.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                }),
                time: new Date(o.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
                total: o.total,
                status:
                    o.status === "pending"
                        ? "Pending"
                        : o.status === "rejected"
                            ? "Cancelled"
                            : "Completed",
                discount: o.discount || 0,
                items:
                    o.cart?.map((c: any) => ({
                        name: c.name,
                        qty: c.quantity,
                        price: c.price,
                    })) || [],
            }));

            setOrders(mapped);
        } catch (err) {
            console.error("Error fetching orders:", err);
            toast.error("Could not fetch orders. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearchQuery, statusFilter]); 
    useEffect(() => {
        const filterKey = `${debouncedSearchQuery}-${statusFilter}`;
        if (page !== 1) {
            setPage(1);
        } else {
            fetchOrders();
        }
    }, [debouncedSearchQuery, statusFilter]); 

    useEffect(() => {
        fetchOrders();
    }, [page, fetchOrders]);
    
    const executeDelete = useCallback(async (orderId: string) => {
        setIsDeleting(true);
        const loadingToast = toast.loading(`Deleting order #${orderId}...`);

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "DELETE",
            });

            toast.dismiss(loadingToast);

            if (res.ok) {
                toast.success(`Order #${orderId} successfully deleted.`);
                
                const newTotal = totalOrders - 1;
                const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE);

                if (page > newTotalPages && page > 1) {
                    setPage(newTotalPages);
                } else {
                    fetchOrders(); 
                }
            } else {
                const errorData = await res.json();
                console.error("Failed to delete order:", errorData);
                toast.error(
                    `Failed to delete order: ${errorData.message || "Server error"}`
                );
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            console.error("Error deleting order:", err);
            toast.error("An unexpected error occurred during deletion.");
        } finally {
            setIsDeleting(false);
        }
    }, [page, totalOrders, fetchOrders]);

    return {
        orders,
        loading,
        totalOrders,
        totalPages,
        isDeleting,
        searchQuery,
        statusFilter,
        page,
        setSearchQuery,
        setStatusFilter,
        setPage,
        fetchOrders,
        executeDelete,
    };
};