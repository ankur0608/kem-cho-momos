// king-bites-pos/src/app/(admin)/orders/components/OrderTableDesktop.tsx

import React from "react";
import { FaPrint, FaTrash, FaEye, FaInbox } from "react-icons/fa";
import { HistoryOrder } from "./types";
import StatusBadge from "./StatusBadge";

interface OrderTableDesktopProps {
  orders: HistoryOrder[];
  loading: boolean;
  onView: (orderId: string) => void;
  onPrint: (order: HistoryOrder) => void;
  onDelete: (orderId: string) => void;
}

export default function OrderTableDesktop({
  orders,
  loading,
  onView,
  onPrint,
  onDelete,
}: OrderTableDesktopProps) {
  if (loading) return null; 

  return (
    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-base">
          <thead className="bg-gray-50 text-slate-500 font-bold border-b border-gray-100 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-5">Customer</th>
              <th className="p-5">Date & Time</th>
              <th className="p-5">Items</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="p-5 font-medium text-slate-800">
                    {order.customer}
                  </td>
                  <td className="p-5 text-xs text-slate-500">
                    {order.date} <br /> {order.time}
                  </td>
                  <td className="p-5 text-xs text-slate-600 max-w-xs">
                    <ul className="list-none p-0 m-0 space-y-0.5">
                      {order.items.slice(0, 3).map((item, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center pr-2"
                        >
                          <span className="truncate w-3/4">
                            {item.qty}x {item.name}
                          </span>
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="text-slate-400 pt-1 italic">
                          + {order.items.length - 3} more
                        </li>
                      )}
                    </ul>
                  </td>
                  <td className="p-5 font-bold text-slate-800">
                    ₹{order.total}
                  </td>
                  <td className="p-5">
                    <StatusBadge status={order.status as any} />
                  </td>
                  <td className="p-5 text-right flex justify-end gap-2">
                    <button
                      onClick={() => onView(order.id)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 text-slate-400 hover:text-sky-600 hover:border-sky-200 inline-flex items-center justify-center shadow-sm transition-all"
                      title="View Order Details"
                    >
                      <FaEye className="text-xs" />
                    </button>
                    <button
                      onClick={() => onPrint(order)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 inline-flex items-center justify-center shadow-sm transition-all"
                      title="View/Print Invoice"
                    >
                      <FaPrint className="text-xs" />
                    </button>
                    <button
                      onClick={() => onDelete(order.id)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 text-slate-400 hover:text-red-600 hover:border-red-200 inline-flex items-center justify-center shadow-sm transition-all"
                      title="Delete Order"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-slate-400"
                >
                  <div className="flex flex-col items-center">
                    <FaInbox className="text-4xl mb-3 opacity-30" />
                    <p>No orders found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}