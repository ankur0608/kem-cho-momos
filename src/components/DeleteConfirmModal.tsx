// src/components/DeleteConfirmModal.tsx

import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  couponCode: string;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  couponCode,
  onClose,
  onDelete,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    />

    <div className="bg-white rounded-2xl w-full max-w-sm z-10 p-6 shadow-2xl animate-fade-in-up">
      <div className="text-center">
        <AlertTriangle className="text-6xl text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Confirm Deletion
        </h3>
        <p className="text-slate-500 mb-6">
          Are you sure you want to delete coupon{" "}
          <span className="font-mono font-bold text-slate-700">
            {couponCode}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal;