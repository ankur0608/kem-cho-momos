// king-bites-pos/src/app/(admin)/orders/components/OrderCardMobile.tsx

import React from "react";
import { FaPrint, FaTrash, FaEye, FaClock, FaShoppingBag } from "react-icons/fa";
import { HistoryOrder } from "./types";
import StatusBadge from "./StatusBadge";

interface OrderCardMobileProps {
  order: HistoryOrder;
  onView: (orderId: string) => void;
  onPrint: (order: HistoryOrder) => void;
  onDelete: (orderId: string) => void;
}

export default function OrderCardMobile({
  order,
  onView,
  onPrint,
  onDelete,
}: OrderCardMobileProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-transform">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-mono font-bold text-slate-500 text-xs">
            ORD-#{order.id.slice(-4)}
          </span>
          <h3 className="font-bold text-slate-800">{order.customer}</h3>
        </div>
        <StatusBadge status={order.status as any} />
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
          <FaClock className="text-slate-400" /> {order.date}, {order.time}
        </div>
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
          <FaShoppingBag className="text-slate-400" /> {order.items.length}{" "}
          Items
        </div>
      </div>

      <div className="text-xs text-slate-600 mb-4 space-y-0.5 border-b border-gray-100 pb-2">
        <p className="font-bold text-slate-800 mb-1">Items:</p>
        {order.items.slice(0, 3).map((item, index) => (
          <p key={index} className="flex justify-between">
            <span className="truncate w-3/4">
              {item.qty}x {item.name}
            </span>
            <span className="font-bold text-slate-800 w-1/4 text-right">
              ₹{(item.price * item.qty).toFixed(2)}
            </span>
          </p>
        ))}
        {order.items.length > 3 && (
          <li className="text-slate-400 pt-1 italic">
            + {order.items.length - 3} more
          </li>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t-0">
        <span className="text-lg font-bold text-slate-800">
          Total: ₹{order.total}
        </span>
        <div className="flex gap-2">
          {/* Action Buttons (View, Print, Delete) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(order.id);
            }}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-200 flex items-center justify-center transition-colors"
            title="View Order Details"
          >
            <FaEye className="text-xs" />
          </button>
          <button
            onClick={() => onPrint(order)}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-colors"
            title="Print Invoice"
          >
            <FaPrint className="text-xs" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(order.id);
            }}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors"
            title="Delete Order"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}