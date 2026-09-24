// app/posuser/page.js

"use client";

import { useEffect, useState } from "react";

// --- Helper Functions for Formatting ---
// FIX 1: Explicitly define 'amount' as number
const formatCurrency = (amount: number) => {
  // Assuming Indian Rupees based on your previous examples
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// FIX 2: Explicitly define 'dateString' as string
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// --- Updated Interface to Match PosUser Model ---
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
        // Fetch data from the optimized MongoDB POS route
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

  if (loading) {
    return <div className="p-6 text-lg font-medium text-slate-600">Loading POS Users...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">POS User Sales Overview</h1>

      {users.length === 0 ? (
        <p className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
          No eligible customers found in the system.
        </p>
      ) : (
        <div className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header */}
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Mobile
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-bold text-red-500 uppercase tracking-wider"
                >
                  Total Spent
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-bold text-blue-500 uppercase tracking-wider"
                >
                  Total Orders
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Last Order
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((u, index) => (
                <tr
                  key={u._id}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  {/* Customer Name */}
                  <td className="px-6 py-3 text-sm font-semibold text-slate-900">
                    {u.fullName}
                  </td>

                  {/* Mobile */}
                  <td className="px-6 py-3 text-sm text-slate-600 font-mono">
                    {u.mobile}
                  </td>

                  {/* Total Spent */}
                  <td className="px-6 py-3 text-right text-sm font-bold text-red-600">
                    {formatCurrency(u.totalSpent)}
                  </td>

                  {/* Total Orders */}
                  <td className="px-6 py-3 text-center text-sm font-bold text-blue-600">
                    {u.totalOrders}
                  </td>

                  {/* Last Order Date */}
                  <td className="px-6 py-3 text-right text-sm text-slate-500">
                    {formatDate(u.lastOrderAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}