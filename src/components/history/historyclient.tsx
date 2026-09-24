// src/app/components/history/OrderHistoryPage.tsx

"use client";

import React, { useState, useCallback } from "react";
import { FaInbox } from "react-icons/fa";
import { HistoryOrder } from "./types";
import HistoryInvoiceModal from "@/components/history/HistoryInvoiceModal";
import OrderDetailsModal from "@/components/history/OrderDetailsModal";
import PaginationControls from "@/components/PaginationControls";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import OrderHistoryHeader from "./OrderHistoryHeader";
import OrderTableDesktop from "./OrderTableDesktop";
import OrderCardMobile from "./OrderCardMobile";
import StatusBadge from "./StatusBadge";

export default function OrderHistoryPage() {
    const {
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
        executeDelete,
    } = useOrderHistory();

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<HistoryOrder | null>(null);
    const [orderIdToDelete, setOrderIdToDelete] = useState<string | null>(null);

    const handleStatusSelect = (status: string) => {
        setStatusFilter(status);
    };

    const handleDeleteOrder = (orderId: string) => {
        setOrderIdToDelete(orderId);
    };

    const confirmDelete = useCallback(async () => {
        if (!orderIdToDelete) return;

        const orderId = orderIdToDelete;
        setOrderIdToDelete(null);

       await executeDelete(orderId);
    }, [orderIdToDelete, executeDelete]);


    const handleViewOrder = (orderId: string) => {
        setSelectedOrderId(orderId);
    };

    const handlePrintOrder = (order: HistoryOrder) => {
        const fullOrder = orders.find((o) => o.id === order.id);
        if (fullOrder) {
            setSelectedOrder(fullOrder);
        } else {
            window.open(`/pos/print/${order.id}`, "_blank");
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const displayData = orders;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <main className="max-w-7xl mx-auto animate-fade-in">
                <div className="space-y-6">
                    <OrderHistoryHeader
                        searchQuery={searchQuery} 
                        setSearchQuery={setSearchQuery} 
                        statusFilter={statusFilter} 
                        onStatusSelect={handleStatusSelect}
                    />

                    {loading && (
                        <div className="flex justify-center py-10 text-slate-500">
                            Loading orders...
                        </div>
                    )}

                    {!loading && (
                        <>
                            <div className="block md:hidden space-y-3">
                                {displayData.length > 0 ? (
                                    displayData.map((order) => (
                                        <OrderCardMobile
                                            key={order.id}
                                            order={order}
                                            onView={handleViewOrder}
                                            onPrint={handlePrintOrder}
                                            onDelete={handleDeleteOrder}
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center py-12 text-slate-400">
                                        <FaInbox className="text-4xl mb-3 opacity-30" />
                                        <p>No orders found matching your criteria.</p>
                                    </div>
                                )}
                            </div>

                            <OrderTableDesktop
                                orders={displayData}
                                onView={handleViewOrder}
                                onPrint={handlePrintOrder}
                                onDelete={handleDeleteOrder}
                                loading={loading}
                            />
                        </>
                    )}

                    {!loading && totalPages > 1 && (
                        <div className="pt-4 flex justify-center">
                            <PaginationControls
                                itemsPerPage={displayData.length} 
                                totalItems={totalOrders}
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </main>

            {selectedOrderId && (
                <OrderDetailsModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}

            {selectedOrder && (
                <HistoryInvoiceModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            {orderIdToDelete && (
                <DeleteConfirmModal
                    couponCode={`#${orderIdToDelete}`}
                    onClose={() => setOrderIdToDelete(null)}
                    onDelete={confirmDelete}
                />
            )}
        </div>
    );
}