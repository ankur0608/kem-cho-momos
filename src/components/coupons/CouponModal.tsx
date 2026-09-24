// src/components/CouponModal.tsx

import React, { useState, useEffect } from "react";
import { Loader2, Wand, Percent, X, Tag, AlertTriangle } from "lucide-react";
import toast from 'react-hot-toast';
import { Coupon, formatDate } from "./couponsclientpage"; // Import types/utils

interface CouponModalProps {
    coupon: Coupon | null;
    onClose: () => void;
    onSaveSuccess: (isEditMode: boolean) => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ coupon, onClose, onSaveSuccess }) => {
    const isEditMode = !!coupon;
    const [formData, setFormData] = useState({
        code: "",
        discount: "",
        expiry: "",
        startDate: new Date().toISOString().split("T")[0],
    });
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (coupon) {
            // Helper to extract YYYY-MM-DD
            const getCleanDate = (dateString: string) => dateString.split("T")[0];
            setFormData({
                code: coupon.code,
                discount: String(coupon.discountPercentage),
                expiry: getCleanDate(coupon.expiryDate),
                startDate: getCleanDate(coupon.startDate), // Stored for display only in edit mode
            });
        } else {
            setFormData({
                code: "",
                discount: "",
                expiry: "",
                startDate: new Date().toISOString().split("T")[0],
            });
        }
    }, [coupon]);

    const generateCode = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++)
            code += letters[Math.floor(Math.random() * letters.length)];
        setFormData((prev) => ({ ...prev, code }));
    };

    const handleSaveCoupon = async () => {
        setFormError("");

        const discountNum = Number(formData.discount);
        if (!formData.code || !discountNum || !formData.expiry) {
            setFormError(
                "Coupon code, discount (1-100%), and expiry date are required."
            );
            return;
        }
        if (discountNum < 1 || discountNum > 100) {
            setFormError("Discount must be between 1% and 100%.");
            return;
        }

        setIsSaving(true);
        const action = isEditMode ? "Updating" : "Creating";
        const loadingToast = toast.loading(`${action} coupon ${formData.code}...`);

        const bodyData = {
            code: formData.code.toUpperCase().trim(),
            discountPercentage: discountNum,
            // Use original start date for edit, today's date for new
            startDate: isEditMode ? coupon!.startDate : formData.startDate,
            expiryDate: formData.expiry,
        };

        const apiMethod = isEditMode ? "PUT" : "POST";
        const apiPath = isEditMode
            ? `/api/coupons?id=${coupon!._id}`
            : "/api/coupons";

        try {
            const response = await fetch(apiPath, {
                method: apiMethod,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            const result = await response.json();

            toast.dismiss(loadingToast);

            if (!response.ok) {
                const errorMessage = result.error || "An unknown error occurred while saving.";
                setFormError(errorMessage);
                toast.error(`Failed to ${action.toLowerCase()} coupon: ${errorMessage}`);
                return;
            }

            toast.success(`Coupon ${formData.code} ${isEditMode ? 'updated' : 'created'} successfully!`);
            onSaveSuccess(isEditMode);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("API Save Error:", error);
            setFormError("Network error. Failed to connect to the server.");
            toast.error("Network error. Failed to connect to the server.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* MODAL */}
            <div className="bg-white rounded-3xl w-full max-w-lg z-10 p-6 shadow-2xl animate-fade-in-up overflow-hidden flex flex-col max-h-[95vh]">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                            <Tag className="text-rose-600" />
                            {isEditMode ? "Edit Coupon" : "Create Coupon"}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {isEditMode
                                ? "Update existing discount details."
                                : "Generate a new discount code."}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full"
                    >
                        <X className="text-slate-400 text-xl" />
                    </button>
                </div>

                {/* SCROLL BODY */}
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-6">
                        {formError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 text-lg shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        {/* Code + Discount Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Coupon Code */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    Coupon Code
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        disabled={isEditMode}
                                        value={formData.code}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                code: e.target.value.toUpperCase().replace(/\s/g, ""),
                                            })
                                        }
                                        placeholder="SUMMER25"
                                        maxLength={15}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold uppercase transition-colors focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none ${isEditMode
                                            ? "bg-gray-100 cursor-not-allowed text-slate-600"
                                            : "text-slate-800"
                                            }`}
                                    />
                                    {!isEditMode && (
                                        <button
                                            onClick={generateCode}
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-600 hover:text-rose-800 transition-colors active:scale-95"
                                            title="Generate Random Code"
                                        >
                                            <Wand />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Discount Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    Discount (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                discount: e.target.value,
                                            })
                                        }
                                        min="1"
                                        max="100"
                                        step="1"
                                        placeholder="20"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 font-medium text-slate-800 transition-colors focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                                    />
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Expiry Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.expiry}
                                    onChange={(e) =>
                                        setFormData({ ...formData, expiry: e.target.value })
                                    }
                                    min={new Date().toISOString().split("T")[0]} // Cannot expire before today
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 transition-colors focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                                />
                            </div>

                            <p className="text-xs text-slate-400 mt-1">
                                {isEditMode
                                    ? `Coupon started on ${formatDate(
                                        coupon!.startDate
                                    )} and cannot be changed.`
                                    : "Start date will be set to today upon creation."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-500 bg-white hover:bg-slate-100 active:scale-95 transition-all shadow-sm border border-slate-200"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSaveCoupon}
                        disabled={isSaving}
                        type="submit"
                        className="px-8 py-2.5 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-300 hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving && <Loader2 className="animate-spin" />}
                        {isEditMode ? "Save Changes" : "Create Coupon"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponModal;