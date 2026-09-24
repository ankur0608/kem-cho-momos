// src/components/history/OrderDetailsModal.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaPrint, FaClock, FaUser, FaMoneyBillWave, FaSpinner, FaTimes } from 'react-icons/fa';
import { OrderDetails } from './types';
import HistoryInvoiceModal from '@/components/history/HistoryInvoiceModal';

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Rejected':
            return 'bg-red-100 text-red-700';
        case 'New':
            return 'bg-yellow-100 text-yellow-700';
        case 'Completed':
        default:
            return 'bg-emerald-100 text-emerald-700';
    }
};

interface OrderDetailsModalProps {
    orderId: string;
    onClose: () => void;
}

export default function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) {
            setError('No Order ID provided.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const apiUrl = `/api/orders/${orderId}`;
            const res = await fetch(apiUrl);

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to fetch order details');
            }

            const o = await res.json();

            const subtotal = o.cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

            const mappedOrder: OrderDetails = {
                id: o._id,
                customer: o.user?.fullName || o.orderType || 'Walk-in',
                date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                total: o.total,
                status: o.status === 'pending' ? 'New' : o.status === 'rejected' ? 'Rejected' : 'Completed',
                discount: (o.discount || subtotal - o.total) || 0, 
                items: o.cart.map((c: any) => ({
                    name: c.name,
                    qty: c.quantity,
                    price: c.price,
                })),
                deliveryAddress: o.deliveryAddress || 'N/A',
                paymentMethod: o.paymentMethod || 'Cash',
                notes: o.notes || '',
            };

            setOrder(mappedOrder);
        } catch (err: any) {
            console.error('Error fetching order details:', err);
            setError(err.message || 'An unexpected error occurred while fetching order details.');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isInvoiceModalOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isInvoiceModalOpen]);

    const subtotalAmount = order?.items.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;
    const discountAmount = order?.discount || 0;
    const totalDue = order?.total || 0;

    return (
        <div className="fixed z-50 inset-0 bg-black/60 backdrop-blur-sm transition-opacity flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto transform transition-all p-0"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{order?.customer || 'Loading...'}</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            ORD-{orderId.slice(-3)} • {order?.date} at {order?.time}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <FaTimes />
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center py-8">
                        <FaSpinner className="animate-spin text-xl text-slate-600 mr-2" />
                        <p className="text-slate-600 text-sm">Fetching data...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8 px-4 bg-red-50 text-red-700 rounded-b-xl">
                        <p className="font-semibold text-sm">Error: {error}</p>
                    </div>
                )}

                {order && !loading && !error && (
                    <>
                        <div className="p-5 space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase">Items Ordered</h3>

                            <div className="space-y-2">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-slate-800 font-medium">
                                            {item.qty}x {item.name}
                                        </span>
                                        <span className="text-slate-800 font-medium">
                                            ₹{(item.price * item.qty).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-dashed border-gray-200">
                                
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-base text-green-600 font-semibold mb-2">
                                        <span>Discount</span>
                                        <span>- ₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                <div className={`flex justify-between ${discountAmount > 0 ? 'py-2 border-t border-gray-200' : ''}`}>
                                    <span className="text-lg font-bold text-slate-800">Total Amount</span>
                                    <span className="text-lg font-bold text-red-600">₹{totalDue.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 pt-4 border-t border-gray-100 text-sm">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Status</p>
                                    <span
                                        className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${getStatusBadge(order.status)}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                                    <p className="font-semibold text-slate-800">{order.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 rounded-lg font-bold text-slate-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors text-sm"
                            >
                                Close
                            </button>
                            
                        </div>
                    </>
                )}

                {isInvoiceModalOpen && order && (
                    <HistoryInvoiceModal
                        order={order}
                        onClose={() => setIsInvoiceModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}