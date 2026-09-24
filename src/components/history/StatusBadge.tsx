// king-bites-pos/src/app/(admin)/orders/components/StatusBadge.tsx

import React from "react";

interface StatusBadgeProps {
  status: "Completed" | "Pending" | "Cancelled" | "Rejected" | "New";
}

const getStatusBadgeClasses = (status: StatusBadgeProps["status"]) => {
  switch (status) {
    case "Cancelled":
    case "Rejected":
      return "bg-red-50 text-red-600 border-red-100";
    case "Pending":
    case "New":
      return "bg-yellow-50 text-yellow-600 border-yellow-100";
    case "Completed":
    default:
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
  }
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const classes = getStatusBadgeClasses(status);
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${classes}`}
    >
      {status}
    </span>
  );
}