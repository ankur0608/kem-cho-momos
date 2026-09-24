// src/components/menu/MenuHeader.tsx

import React from "react";
import { FaPlus } from "react-icons/fa6";

interface MenuHeaderProps {
    setAddModalOpen: (isOpen: boolean) => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ setAddModalOpen }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Menu Management</h2>
                <p className="text-slate-500 text-sm mt-1">
                    Add items, update prices, and manage availability.
                </p>
            </div>

            <button
                onClick={() => setAddModalOpen(true)}
                className="bg-rose-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 font-bold text-sm transition-all flex items-center"
            >
                <FaPlus className="mr-2" /> Add Product
            </button>
        </div>
    );
};

export default MenuHeader;