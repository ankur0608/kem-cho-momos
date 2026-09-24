// src/components/menu/MenuItemGrid.tsx

import React from "react";
import Image from "next/image";
import { FaPen, FaImage, FaTrash } from "react-icons/fa6";
import { MenuItem } from "@/types/MenuItem"; 

interface MenuItemGridProps {
    menuItems: MenuItem[];
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
    onToggleStock: (item: MenuItem) => void;
}

const MenuItemGrid: React.FC<MenuItemGridProps> = ({
    menuItems,
    onEdit,
    onDelete,
    onToggleStock,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {menuItems.map((item) => (
                <div
                    key={item._id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center relative group hover:shadow-lg transition-all"
                >
                    {/* {typeof item.sortOrder === 'number' && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full border border-rose-100">
                            #{item.sortOrder}
                        </span>
                    )} */}
                    {/* Edit Button */}
                    <button
                        className="absolute top-3 right-10 w-7 h-7 rounded-full bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
                        onClick={() => onEdit(item)}
                    >
                        <FaPen className="text-xs" />
                    </button>

                    {/* Delete Button */}
                    <button
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                        onClick={() => onDelete(item._id!)}
                    >
                        <FaTrash className="text-xs" />
                    </button>

                    {/* Product Image */}
                    <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded-xl"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <FaImage className="text-2xl text-slate-300" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4
                            className="font-bold text-slate-800 text-sm line-clamp-2 h-10 leading-tight mb-1"
                            title={item.name}
                        >
                            {item.name}
                        </h4>

                        <p className="text-slate-500 text-[10px] line-clamp-1 mb-2">
                            {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-1">
                            <p className="text-rose-600 font-mono font-bold text-sm">
                                ₹{item.price}
                            </p>

                            {/* Stock Toggle */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={item.stock}
                                    onChange={() => onToggleStock(item)}
                                />
                                <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:bg-white after:rounded-full after:transition-all"></div>
                            </label>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MenuItemGrid;