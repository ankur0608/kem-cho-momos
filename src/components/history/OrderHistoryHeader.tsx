// king-bites-pos/src/app/(admin)/orders/components/OrderHistoryHeader.tsx

import React from "react";
import { FaSearch } from "react-icons/fa";
import StatusFilterDropdown from "./StatusFilterDropdown";

export const STATUS_OPTIONS: {
  label: string;
  value: string;
  backendValue?: string;
}[] = [
  { label: "All", value: "All" },
  { label: "Completed", value: "Completed", backendValue: "completed" },
  { label: "Pending", value: "Pending", backendValue: "pending" },
  { label: "Cancelled", value: "Cancelled", backendValue: "rejected" },
];

interface OrderHistoryHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  onStatusSelect: (status: string) => void;
}

export default function OrderHistoryHeader({
  searchQuery,
  setSearchQuery,
  statusFilter,
  onStatusSelect,
}: OrderHistoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/50 pb-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
        Order History
      </h2>

      <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 pl-10 border border-gray-200 rounded-xl shadow-sm focus:ring-sky-500 focus:border-sky-500 transition outline-none"
          />
        </div>

        <StatusFilterDropdown
          statusOptions={STATUS_OPTIONS}
          statusFilter={statusFilter}
          onStatusSelect={onStatusSelect}
        />
      </div>
    </div>
  );
}