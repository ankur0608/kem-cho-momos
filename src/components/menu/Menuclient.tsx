"use client";

import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import toast from 'react-hot-toast';
import { MenuItem } from "@/types/MenuItem";
import AddProductModal from "@/components/menu/AddProductModal";
import EditProductModal from "@/components/menu/EditProductModal";
import PaginationControls from "@/components/PaginationControls";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useMenuManager } from "@/hooks/useMenuManager";
import MenuHeader from "@/components/menu/MenuHeader";
import CategoryFilterBar from "@/components/menu/CategoryFilterBar";
import MenuItemGrid from "@/components/menu/MenuItemGrid";
import { MENU_CATEGORIES } from "@/constants/menuCategories";

interface ItemToDelete {
    id: string;
    name: string;
}

export default function MenuPage() {
    const {
        menuItems,
        activeFilter,
        currentPage,
        totalPages,
        isLoading,
        categories: dbCategories,
        setActiveFilter,
        setCurrentPage,
        handleSaveSuccess,
        toggleStock,
        confirmDelete: executeDelete,
    } = useMenuManager();

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);

    // Combine static and dynamic categories and remove duplicates
    const allCategories = Array.from(new Set([...MENU_CATEGORIES, ...(dbCategories || [])]));

    const handleAddNewItem = (savedItem: MenuItem) => {
        toast.success(`Product "${savedItem.name}" added!`);
        handleSaveSuccess(true);
        setAddModalOpen(false);
    };

    const handleUpdateItem = (updated: MenuItem) => {
        toast.success(`Product "${updated.name}" updated!`);
        handleSaveSuccess(false, updated);
        setEditingItem(null);
    };

    const handleDeleteOpen = (id: string) => {
        const item = menuItems.find((i) => i._id === id);
        if (item) {
            setItemToDelete({ id: item._id!, name: item.name });
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        await executeDelete(itemToDelete);

        setItemToDelete(null);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="bg-slate-50/50 flex overflow-hidden">
            <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

                <MenuHeader setAddModalOpen={setAddModalOpen} />

                <CategoryFilterBar
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter} // Hook setter
                    categories={allCategories}
                />

                {isLoading ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow">
                        <div className="text-xl font-medium text-slate-500 flex items-center gap-2">
                            <FaPlus className="animate-spin" /> Loading Menu...
                        </div>
                    </div>
                ) : (
                    <MenuItemGrid
                        menuItems={menuItems}
                        onEdit={setEditingItem}
                        onDelete={handleDeleteOpen}
                        onToggleStock={toggleStock}
                    />
                )}

                {totalPages > 1 && (
                    <div className="pt-4 flex justify-center">
                        <PaginationControls
                            itemsPerPage={menuItems.length}
                            totalItems={totalPages * menuItems.length} // Estimate total items
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange} // Hook setter
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            {addModalOpen && (
                <AddProductModal
                    onClose={() => setAddModalOpen(false)}
                    onSave={handleAddNewItem}
                    categories={allCategories}
                />
            )}

            {editingItem && (
                <EditProductModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onUpdate={handleUpdateItem}
                    categories={allCategories}
                />
            )}

            {itemToDelete && (
                <DeleteConfirmModal
                    couponCode={itemToDelete.name}
                    onClose={() => setItemToDelete(null)}
                    onDelete={handleConfirmDelete}
                />
            )}
        </div>
    );
}
