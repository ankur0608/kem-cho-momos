// src/components/CouponManager.tsx (or App.tsx)

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import toast from 'react-hot-toast';

// Import newly externalized components
import CouponFilterBar from "@/components/coupons/CouponFilterBar";
import CouponTable from "@/components/coupons/CouponTable";
import CouponModal from "@/components/coupons/CouponModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

// Import the new custom hook
import { useCouponManagerApi } from "@/hooks/useCouponManagerApi";
// Adjust the import path as necessary

// --- Type Definitions (Keep in Main or a separate types file) ---
export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
}

// NOTE: CouponApiResponse is now only needed in the hook
export type StatusFilter = "All" | "Active" | "Expired" | "Scheduled";

// Utility Functions (Keep here or in utils file, kept here for context)
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function CouponManager() {
  // -------------------------------------------------------------------
  // ✨ Use the Custom Hook to get all API-related state and functions
  // -------------------------------------------------------------------
  const {
    coupons,
    isLoading,
    totalCoupons,
    apiTotalPages,
    currentPage,
    filter,
    isDeleting,
    setCurrentPage,
    setFilter,
    executeDelete, // This is the API call
    handleSaveSuccess, // This handles refresh logic after save
  } = useCouponManagerApi();


  // --- Component-specific Modal State (Stays here) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // --- Component-specific Confirmation Modal State (Stays here) ---
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteCode, setConfirmDeleteCode] = useState("");

  // -------------------------------------------------------------------
  // ✍️ Modal & Deletion Handlers (Simplified/Coordinator functions)
  // -------------------------------------------------------------------

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  // New handler to coordinate closing the modal and triggering the hook's refresh logic
  const handleSaveAndRefresh = (isEditMode: boolean) => {
    handleCloseModal();
    handleSaveSuccess(isEditMode); // Use the logic from the hook
  };

  // Note: handleSaveSuccess now doesn't need to be wrapped in useCallback 
  // because it comes from the hook, which already uses useCallback.


  const openConfirmDelete = (coupon: Coupon) => {
    setConfirmDeleteId(coupon._id);
    setConfirmDeleteCode(coupon.code);
    setIsConfirmingDelete(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmingDelete(false);
    setConfirmDeleteId(null);
    setConfirmDeleteCode("");
  };

  // Wrapper function to trigger the hook's delete logic and reset local state
  const handleDeleteExecution = useCallback(async () => {
    if (!confirmDeleteId || !confirmDeleteCode) return;

    await executeDelete(confirmDeleteId, confirmDeleteCode);

    closeConfirmDelete();   // ← this closes modal AND resets state

  }, [confirmDeleteId, confirmDeleteCode, executeDelete, closeConfirmDelete]);

  // -------------------------------------------------------------------
  // ⚙️ Render UI (Mostly unchanged, but props use hook values)
  // -------------------------------------------------------------------

  return (
    <div className="min-h-screen">
      <div className="space-y-5 max-w-6xl mx-auto">

        {/* HEADER & ADD BUTTON */}
        <div className="
          flex flex-col sm:flex-row
          justify-between
          items-start sm:items-center
          gap-3 sm:gap-4
          border-b border-gray-200/50
          pb-3 sm:pb-4
        ">
          {/* TITLE BLOCK */}
          <div className="w-full sm:w-auto">
            <h2 className="
              text-2xl sm:text-3xl
              font-extrabold text-slate-800
              leading-tight
            ">
              Coupon Management
            </h2>
            <p className="
              text-slate-500
              text-xs sm:text-sm
              mt-1
            ">
              Control the discounts available for your customers.
            </p>
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto md:w-56 bg-rose-600 text-white px-5 py-2.5 rounded-xl hover:bg-rose-700 font-bold text-sm shadow-xl shadow-rose-200 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
            disabled={isModalOpen || isConfirmingDelete}
          >
            <Plus className="mr-2 w-4 h-4" /> Create New Coupon
          </button>

        </div>

        {/* --- Filter UI --- */}
        {/* Uses setFilter from the hook */}
        <CouponFilterBar filter={filter} setFilter={setFilter} />

        {/* --- Coupon Table/List --- */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 text-center text-slate-400">
            <Loader2 className="animate-spin text-5xl mb-4 mx-auto" />
            <p>Loading coupons...</p>
          </div>
        ) : (
          <CouponTable
            coupons={coupons}
            totalCount={totalCoupons}
            filter={filter}
            isDeleting={isDeleting}
            currentPage={currentPage}
            totalPages={apiTotalPages}
            onPageChange={setCurrentPage} // Uses setCurrentPage from the hook
            onEdit={handleOpenEditModal}
            onDeleteConfirm={openConfirmDelete}
            setFilter={setFilter} // Uses setFilter from the hook
          />
        )}

        {/* MODALS */}
        {isModalOpen && (
          <CouponModal
            coupon={editingCoupon}
            onClose={handleCloseModal}
            onSaveSuccess={handleSaveAndRefresh} // Now calls the combined handler
          />
        )}
        {isConfirmingDelete && (
          <DeleteConfirmModal
            couponCode={confirmDeleteCode}
            onClose={closeConfirmDelete}
            onDelete={handleDeleteExecution} // Now calls the wrapper function
          />
        )}
      </div>
    </div>
  );
}