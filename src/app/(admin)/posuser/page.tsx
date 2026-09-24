"use client";

import { useEffect, useState } from "react";
import { FaUsers, FaUserSlash, FaCircleNotch, FaUser } from "react-icons/fa6";

// --- Helper Functions for Formatting ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface PosUser {
  _id: string;
  fullName: string;
  mobile: string;
  totalSpent: number;
  totalOrders: number;
  lastOrderAt: string;
}

export default function PosUserPage() {
  const [users, setUsers] = useState<PosUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/pos");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to load POS users:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="bg-slate-50/50 min-h-screen py-6 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3 mb-1">
            <FaUsers className="text-rose-600" />
            POS Customer Insights
          </h1>
          <p className="text-sm text-slate-500">
            Overview of customers and their order history from the POS terminal.
          </p>
        </div>
        
        {!loading && users.length > 0 && (
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">Total Customers:</span>
            <span className="text-rose-600 font-bold text-lg">{users.length}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-slate-100">
          <FaCircleNotch className="animate-spin text-4xl text-rose-500 mb-4" />
          <div className="text-lg font-medium text-slate-600">Loading customer data...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FaUserSlash className="text-4xl text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Customers Found</h3>
          <p className="text-slate-500 text-sm max-w-md">
            We don't have any eligible POS customers in the system yet. Once customers make purchases through the POS, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 whitespace-nowrap">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Last Order
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {users.map((u, index) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-sm" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      {u.mobile}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                      {formatCurrency(u.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                        {u.totalOrders} {u.totalOrders === 1 ? 'Order' : 'Orders'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500">
                      {formatDate(u.lastOrderAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}