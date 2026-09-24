'use client';

import React, { useEffect } from 'react';
import { HistoryOrder } from '@/components/history/types';

export default function HistoryInvoiceModal({
    order,
    onClose,
}: {
    order: HistoryOrder;
    onClose: () => void;
}) {

    const subtotal = order.items.reduce((acc, i) => acc + i.price * i.qty, 0);
    const total = subtotal - (order.discount || 0);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div id="invoice-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* FIXED: PRINT CSS */}
            <style jsx global>{`
        @media print {

          /* Hide everything */
          body * {
            visibility: hidden !important;
          }

          /* Show ONLY invoice content */
          #invoice-content,
          #invoice-content * {
            visibility: visible !important;
          }

          /* Force print area */
          #invoice-content {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 80mm !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
          }

          /* Hide UI buttons and backdrop */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm no-print"
                onClick={onClose}
            ></div>

            {/* Printable Wrapper */}
            <div className="z-10 flex justify-center w-full pointer-events-none">

                {/* FIXED: use #invoice-content */}
                <div
                    id="invoice-content"
                    className="bg-white w-full max-w-[380px] shadow-2xl rounded-lg overflow-hidden pointer-events-auto"
                >
                    <div className="p-8 bg-white font-mono text-slate-800 text-sm leading-relaxed">

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="text-2xl font-extrabold uppercase tracking-widest border-b-2 border-slate-800 pb-2 mb-2 inline-block">
                                Kem Cho Momos
                            </div>
                            <p className="text-[10px] text-slate-500">123 Food Street, Ahmedabad</p>
                            <p className="text-[10px] text-slate-500">GSTIN: 24ABCDE1234F1Z5</p>
                        </div>

                        {/* Order Details */}
                        <div className="border-b border-dashed border-slate-300 mb-4 pb-3 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span>Date:</span>
                                <span className="font-bold">{order.date} {order.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Order #:</span>
                                <span className="font-bold">#{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Customer:</span>
                                <span className="font-bold uppercase">{order.customer}</span>
                            </div>
                        </div>

                        {/* Items */}
                        <table className="w-full text-left mb-4 text-xs">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="pb-2 w-8 font-normal">Qty</th>
                                    <th className="pb-2 font-normal">Item</th>
                                    <th className="pb-2 text-right font-normal">Amt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed divide-slate-200">
                                {order.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2 font-bold">{item.qty}</td>
                                        <td className="py-2">{item.name}</td>
                                        <td className="py-2 text-right font-bold">
                                            {(item.price * item.qty).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="border-t border-slate-800 pt-3 space-y-1 text-xs mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹ {subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span>- ₹ {order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-extrabold mt-2 pt-2 border-t border-dashed border-slate-300">
                                <span>TOTAL</span>
                                <span>₹ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center text-[10px] uppercase tracking-wider text-slate-400">
                            <p>*** Duplicate Receipt ***</p>
                        </div>
                    </div>

                    {/* Buttons (Hidden on print) */}
                    <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-3 no-print">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg font-bold text-sm"
                        >
                            Print Again
                        </button>

                        <button
                            onClick={onClose}
                            className="flex-1 bg-white border border-gray-300 text-slate-600 py-2.5 rounded-lg font-bold text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
