import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

interface CategoryFilterBarProps {
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
    categories: string[];
    onCategoryAdded?: () => void;
}

const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
    activeFilter,
    setActiveFilter,
    categories,
    onCategoryAdded
}) => {
    const allCategories = ["All", ...categories];
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategory.trim() })
            });
            
            if (res.ok) {
                toast.success("Category added!");
                setNewCategory("");
                setIsAdding(false);
                if (onCategoryAdded) onCategoryAdded();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to add category");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleDeleteCategory = async (name: string) => {
        if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

        try {
            const res = await fetch(`/api/categories?name=${encodeURIComponent(name)}`, {
                method: "DELETE"
            });
            
            if (res.ok) {
                toast.success("Category deleted!");
                if (activeFilter === name) setActiveFilter("All");
                if (onCategoryAdded) onCategoryAdded(); // Reuse to reload menu categories
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete category");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full">
                {/* Mobile Layout */}
                <div className="grid grid-cols-4 gap-2 w-full sm:hidden mt-2">
                    {allCategories.map((cat) => (
                        <div key={cat} className="relative group">
                            <button
                                onClick={() => setActiveFilter(cat)}
                                className={`w-full h-full text-center px-2 py-2 rounded-lg border text-[11px] font-semibold transition-all
                                ${activeFilter === cat
                                    ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                                    : "bg-white border-gray-200 text-slate-600 hover:border-rose-500"
                                }`}
                            >
                                {cat}
                            </button>
                            {cat !== "All" && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex gap-2 overflow-x-auto pb-2 no-scrollbar mt-2 items-center pt-2">
                    {allCategories.map((cat) => (
                        <div key={cat} className="relative group inline-block">
                            <button
                                onClick={() => setActiveFilter(cat)}
                                className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${activeFilter === cat
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white border-gray-200 text-slate-600 hover:border-rose-500"
                                    }`}
                            >
                                {cat}
                            </button>
                            {cat !== "All" && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                                    className="absolute -top-1.5 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-sm"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {/* Add Category Section */}
                    {isAdding ? (
                        <div className="flex items-center gap-1 ml-2">
                            <input 
                                type="text"
                                className="border rounded-full px-3 py-1 text-xs outline-none focus:border-rose-500"
                                placeholder="New Category"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAddCategory()}
                                autoFocus
                            />
                            <button onClick={handleAddCategory} className="bg-rose-500 text-white rounded-full px-3 py-1.5 text-xs font-bold shadow hover:bg-rose-600">
                                Save
                            </button>
                            <button onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-700 rounded-full px-3 py-1.5 text-xs font-bold hover:bg-gray-300">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="px-4 py-1.5 rounded-full border border-dashed border-gray-400 text-xs font-bold text-gray-500 hover:text-rose-500 hover:border-rose-500 ml-2 whitespace-nowrap"
                        >
                            + Add Category
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryFilterBar;