"use client";

import React, { useEffect } from 'react';
import { Ticket } from '@/components/pos/types';

export default function ReceiptModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void; }) {
  const subtotal = ticket.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const total = subtotal - ticket.discount;

  useEffect(() => {
    setTimeout(() => window.print(), 300);
  }, []);

  return (
    <div id="invoice-modal" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm no-print" onClick={onClose}></div>
      <div id="invoice-content" className="bg-white rounded-lg shadow-2xl w-[380px] transform scale-100 transition-all relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Receipt Content */}
        <div className="p-8 bg-white font-mono-receipt text-slate-800 text-sm leading-relaxed overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-2xl font-extrabold uppercase tracking-widest border-b-2 border-slate-800 pb-2 mb-2 inline-block">Kem Cho Momos</div>
            <p className="text-xs">123 Food Street, Ahmedabad</p>
            <p className="text-xs">GSTIN: 24ABCDE1234F1Z5</p>
            <p className="text-xs mt-1">Ph: +91 98765 43210</p>
          </div>

          <div className="border-b border-dashed border-slate-400 mb-4 pb-2 text-xs">
            <div className="flex justify-between"><span>Date:</span> <span>{new Date().toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span>Time:</span> <span>{new Date().toLocaleTimeString()}</span></div>
            <div className="flex justify-between mt-1"><span>Order #:</span> <span className="font-bold">{ticket._id}</span></div>
            <div className="flex justify-between"><span>Customer:</span> <span className="uppercase">{ticket.customer || 'Walk-in'}</span></div>
          </div>

          <table className="w-full text-left mb-4 text-xs">
            <thead>
              <tr className="border-b border-slate-300"><th className="pb-2 w-8">Qty</th><th className="pb-2">Item</th><th className="pb-2 text-right">Amt</th></tr>
            </thead>
            <tbody>
              {ticket.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="pb-2">{item.qty}</td>
                  <td className="pb-2">{item.name}</td>
                  <td className="pb-2 text-right">{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-xs mb-4">
            <div className="flex justify-between"><span>Subtotal</span> <span>₹ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span> <span>- ₹ {ticket.discount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>CGST (2.5%)</span> <span>Incl.</span></div>
            <div className="flex justify-between"><span>SGST (2.5%)</span> <span>Incl.</span></div>
          </div>

          <div className="border-t-2 border-slate-800 pt-2 flex justify-between text-lg font-bold">
            <span>TOTAL</span> <span>₹ {total.toFixed(2)}</span>
          </div>

          <div className="mt-8 text-center text-[10px] uppercase tracking-wider">
            <p>*** Thank you for dining with us! ***</p>
            <p className="mt-1">Visit again soon</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-gray-50 p-4 flex border-t border-gray-200 no-print gap-3">
          <button onClick={() => window.print()} className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg shadow hover:bg-slate-700 font-bold">Print</button>
          <button onClick={onClose} className="flex-1 border border-gray-300 text-slate-600 py-2.5 rounded-lg font-bold hover:bg-white">Close</button>
        </div>
      </div>
    </div>
  );
}