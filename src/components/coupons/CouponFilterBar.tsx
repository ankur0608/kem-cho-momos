// src/components/CouponFilterBar.tsx

import React from "react";
import { Filter } from "lucide-react";
// Assuming this type import is correct for your structure
import { StatusFilter } from "./couponsclientpage";

interface CouponFilterBarProps {
    filter: StatusFilter;
    setFilter: (filter: StatusFilter) => void;
}

const CouponFilterBar: React.FC<CouponFilterBarProps> = ({ filter, setFilter }) => {
    const filterOptions: StatusFilter[] = ["All", "Active", "Expired"];

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl overflow-x-auto no-scrollbar">
                <Filter className="text-slate-500 shrink-0 ml-1 mr-2 w-4 h-4" />

                {/* Desktop Layout: Rounded full buttons */}
                <div className="hidden sm:flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {filterOptions.map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            // 💡 UPDATED: Added rounded-full for desktop/tablet view
                            className={`shrink-0 px-4 py-1.5 text-xs font-bold rounded-full transition-colors border whitespace-nowrap ${filter === status
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white border-gray-200 text-slate-600 hover:border-rose-500"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Mobile Layout: Hidden on desktop (sm:hidden) */}
                {/* We use a grid layout on mobile (grid-cols-4) similar to the Menu filter */}
                <div className="grid grid-cols-4 gap-2 w-full sm:hidden">
                    {filterOptions.map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            // 💡 UPDATED: Mobile button classes for 4-column grid look
                            className={`text-center px-2.5 py-2 rounded-lg border text-[11px] font-semibold transition-all
              ${filter === status
                                    ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                                    : "bg-white border-gray-200 text-slate-600 hover:border-rose-500"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CouponFilterBar;