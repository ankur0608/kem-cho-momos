import React from "react";
import { Trash, Ticket, PencilLine, Loader2, Calendar } from "lucide-react";
// 💡 CHANGE: Renamed import to match the provided component's export name
import PaginationStatusWrapper from "@/components/PaginationControls";
// Assuming Coupon, StatusFilter, and formatDate are imported correctly
import { Coupon, StatusFilter, formatDate } from "./couponsclientpage";

// 💡 ASSUMPTION: Define or import the number of items per page.
// You must ensure this value matches the logic used for fetching coupons.
const ITEMS_PER_PAGE = 10;

// STATUS HELPER (No changes needed here)
const getStatus = (start: string, expiry: string) => {
  const now = new Date();
  const startDate = new Date(start + "T00:00:00Z");
  const expiryDate = new Date(expiry + "T23:59:59Z");

  if (now < startDate)
    return {
      label: "Scheduled",
      color: "bg-blue-50 text-blue-700 border-blue-200", // Light blue background
    };

  if (now > expiryDate)
    return {
      label: "Expired",
      color: "bg-gray-50 text-gray-500 border-gray-200", // Light gray background
    };

  return {
    label: "Active",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200", // Light emerald background
  };
};

interface Props {
  coupons: Coupon[];
  totalCount: number;
  filter: StatusFilter;
  isDeleting: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (coupon: Coupon) => void;
  onDeleteConfirm: (coupon: Coupon) => void;
  setFilter: (filter: StatusFilter) => void;
}

export default function CouponTable(props: Props) {
  const {
    coupons,
    totalCount,
    filter,
    isDeleting,
    currentPage,
    totalPages,
    onPageChange,
    onEdit,
    onDeleteConfirm,
    setFilter,
  } = props;

  // --- Empty State ---
  if (totalCount === 0) {
    return (
      <div className="rounded-2xl shadow-xl border border-gray-100 bg-white py-16 text-center text-slate-400">
        <Ticket className="text-5xl mb-4 mx-auto text-rose-300/80" />
        <p className="text-lg font-semibold text-slate-600">
          No {filter !== "All" ? filter.toLowerCase() : ""} coupons found.
        </p>
        {filter !== "All" && (
          <button
            onClick={() => setFilter("All")}
            className="mt-3 text-rose-600 hover:text-rose-700 hover:underline text-sm font-medium transition-colors"
          >
            Show All Coupons
          </button>
        )}
      </div>
    );
  }

  // --- Main Table/Card View ---
  return (
    <div className="rounded-xl overflow-hidden">
      {/* -------------------------- */}
      {/* DESKTOP TABLE (>=640px) */}
      {/* -------------------------- */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-slate-500 font-semibold border-b text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 w-1/4">Code</th>
              <th className="p-4 w-1/6">Discount</th>
              <th className="p-4 w-1/3">Dates</th>
              <th className="p-4 w-1/6">Status</th>
              <th className="p-4 w-1/6 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c) => {
              const status = getStatus(c.startDate, c.expiryDate);

              return (
                <tr
                  key={c._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-mono font-bold text-slate-800">
                    {c.code}
                  </td>

                  <td className="p-4">
                    <span className="font-extrabold text-rose-600 text-lg">
                      {c.discountPercentage}%
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Expires: {formatDate(c.expiryDate)}
                      </span>
                      <span className="text-xs text-slate-500 ml-5 mt-0.5">
                        Starts: {formatDate(c.startDate)}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
                        title="Edit Coupon"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteConfirm(c)}
                        disabled={isDeleting === c._id}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors shadow-sm"
                        title="Delete Coupon"
                      >
                        {isDeleting === c._id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <Trash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* -------------------------- */}
      {/* MOBILE CARDS (<640px) */}
      {/* -------------------------- */}
      <div className="sm:hidden p-4 space-y-4">
        {coupons.map((c) => {
          const status = getStatus(c.startDate, c.expiryDate);

          return (
            <div
              key={c._id}
              className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col gap-4 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start border-b pb-3 border-gray-100">
                <span className="font-mono font-extrabold text-xl text-slate-800">
                  {c.code}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Discount
                  </div>
                  <div className="text-2xl font-extrabold text-rose-600 mt-0.5">
                    {c.discountPercentage}%
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-slate-700 flex items-center justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Expires: {formatDate(c.expiryDate)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Starts: {formatDate(c.startDate)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEdit(c)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
                  title="Edit Coupon"
                >
                  <PencilLine className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteConfirm(c)}
                  disabled={isDeleting === c._id}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors shadow-sm"
                  title="Delete Coupon"
                >
                  {isDeleting === c._id ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Trash className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 💡 CHANGE: Using the new PaginationStatusWrapper component for combined status and controls */}
      <div>
        <PaginationStatusWrapper
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={totalCount}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}