// src/components/menu/CategoryFilterBar.tsx

import React from "react";

interface CategoryFilterBarProps {
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
    categories: string[];
}

const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
    activeFilter,
    setActiveFilter,
    categories,
}) => {
    const allCategories = ["All", ...categories];

    return (
        <div>
            {/* Mobile Layout: 4 buttons per row */}
            <div className="grid grid-cols-4 gap-2 w-full sm:hidden mt-2">
                {allCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`text-center px-2 py-2 rounded-lg border text-[11px] font-semibold transition-all
                        ${activeFilter === cat
                            ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                            : "bg-white border-gray-200 text-slate-600 hover:border-rose-500"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Desktop Layout: original horizontal scroll */}
            <div className="hidden sm:flex gap-2 overflow-x-auto pb-2 no-scrollbar mt-2">
                {allCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${activeFilter === cat
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-white border-gray-200 text-slate-600 hover:border-rose-500"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilterBar;