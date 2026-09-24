'use client';

import React, { useState } from 'react';
import { FaClipboardCheck } from 'react-icons/fa6';
import OrderCard from '@/components/live-queue/OrderCard';
import { QueueOrder } from './types';
import { FaPlusCircle } from 'react-icons/fa';

export default function LiveQueuePage() {
    const [orders, setOrders] = useState<QueueOrder[]>([]);

    // --- Logic to Simulate Random Orders ---
    const simulateIncomingOrder = () => {
        const randomCustomer = ["Anjali S.", "Rohan M.", "Suresh K.", "Priya D.", "Amit B."][Math.floor(Math.random() * 5)];
        const menuItems = [
            { name: "Cheese Vadapav", price: 35 },
            { name: "Coke (300ml)", price: 40 },
            { name: "Veg Grill Sandwich", price: 80 },
            { name: "Masala Chai", price: 15 },
            { name: "Peri Peri Fries", price: 80 }
        ];

        // Pick 1-3 random items
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const newItems = [];
        let currentTotal = 0;

        for (let i = 0; i < itemCount; i++) {
            const item = menuItems[Math.floor(Math.random() * menuItems.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            newItems.push({ name: item.name, qty });
            currentTotal += item.price * qty;
        }

        const newOrder: QueueOrder = {
            id: Math.floor(100 + Math.random() * 900),
            customer: randomCustomer,
            type: Math.random() > 0.5 ? 'Delivery' : 'Dine-in',
            paymentStatus: Math.random() > 0.5 ? 'COD' : 'Paid',
            time: "Just now",
            items: newItems,
            total: currentTotal,
            status: 'New'
        };

        setOrders(prev => [newOrder, ...prev]);
    };

    const handleProcessOrder = (id: number, action: 'accept' | 'reject') => {
        setOrders(prev => prev.filter(o => o.id !== id));
        console.log(`Order ${id} ${action}ed`);
    };

    // Note: No Sidebar, Header, or Main wrapper here. 
    // This content flows directly into the RootLayout's {children}
    return (
        <div className="space-y-8 animate-fade-in">

            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Live Queue</h2>
                    <p className="text-slate-500 text-sm mt-1">Real-time kitchen order display system.</p>
                </div>
                <button
                    onClick={simulateIncomingOrder}
                    className="bg-slate-800 text-white px-5 lg:py-2.5 sm:py-2 rounded-xl text-sm font-bold hover:bg-slate-700 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center"
                >
                    <FaPlusCircle className="mr-2" /> <span className='text-sm'>Simulate Order</span>
                </button>
            </div>

            {/* Grid Area */}
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-50">
                    <FaClipboardCheck className="text-6xl mb-4 text-slate-300" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-sm">No pending orders in the queue.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                    {orders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onAccept={(id) => handleProcessOrder(id, 'accept')}
                            onReject={(id) => handleProcessOrder(id, 'reject')}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}