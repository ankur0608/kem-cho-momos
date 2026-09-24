'use client';

import React from 'react';
import { FaClock, FaMotorcycle, FaUtensils } from 'react-icons/fa6';
import { QueueOrder } from '@/app/(admin)/live-queue/types';

interface OrderCardProps {
  order: QueueOrder;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

export default function OrderCard({ order, onAccept, onReject }: OrderCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative hover:shadow-md transition-all animate-fade-in group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
        <div className="flex items-center gap-3">
          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide animate-pulse">
            {order.status}
          </span>
          <span className="text-xs text-slate-400 font-medium flex items-center">
            <FaClock className="mr-1" /> {order.time}
          </span>
        </div>
        <span className="font-mono font-bold text-slate-800 text-lg">#{order.id}</span>
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">{order.customer}</h4>
        <p className="text-xs text-slate-500 font-medium flex items-center">
          {order.type === 'Delivery' ? (
            <><FaMotorcycle className="mr-1.5 text-slate-300" /> Delivery • {order.paymentStatus}</>
          ) : (
            <><FaUtensils className="mr-1.5 text-slate-300" /> Dine-in • {order.paymentStatus}</>
          )}
        </p>
      </div>

      {/* Items List */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm items-center">
            <div className="flex items-center">
              <span className="bg-white border border-gray-200 w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-slate-700 mr-2 shadow-sm">
                {item.qty}
              </span>
              <span className="text-slate-600 font-medium">{item.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-5 px-1">
        <span className="text-xs font-bold text-slate-400 uppercase">Total Bill</span>
        <span className="text-xl font-extrabold text-rose-600">₹ {order.total}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button 
          onClick={() => onReject(order.id)}
          className="flex-1 border border-red-100 bg-white text-red-500 py-2.5 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors"
        >
          Reject
        </button>
        <button 
          onClick={() => onAccept(order.id)}
          className="flex-1 bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 transition-all"
        >
          Accept & Cook
        </button>
      </div>
    </div>
  );
}