'use client';

import React, { useState } from "react";
import { FaCloudArrowUp, FaHeart } from "react-icons/fa6"; 
import { MenuItem } from "@/types/MenuItem";
import { FaTimes } from "react-icons/fa";
import { normalizeMenuCategory } from "@/constants/menuCategories";

interface EditProductModalProps {
    onClose: () => void;
    onUpdate: (item: MenuItem) => void;
    categories: string[];
    item: MenuItem;
}

export default function EditProductModal({ onClose, onUpdate, categories, item }: EditProductModalProps) {
    const [imageUploading, setImageUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: item.name,
        price: item.price,
        category: normalizeMenuCategory(item.category),
        stock: item.stock,
        badge: item.badge || "",
        isMostLoved: item.isMostLoved || false,
        description: item.description || "",
        imageUrl: item.imageUrl || "",
        sortOrder: item.sortOrder ?? 0,
    });

    const handleImageUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageUploading(true);
        try {
            const authRes = await fetch("/api/imagekit/auth");
            const auth = await authRes.json();

            const form = new FormData();
            form.append("file", file);
            form.append("fileName", file.name);
            form.append("token", auth.token);
            form.append("expire", auth.expire);
            form.append("signature", auth.signature);
            form.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);

            const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
                method: "POST",
                body: form,
            });

            const data = await uploadRes.json();

            if (data.url) {
                setFormData(prev => ({ ...prev, imageUrl: data.url }));
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error(error);
            alert("Error uploading image");
        } finally {
            setImageUploading(false);
        }
    };

    const handleUpdate = async () => {
        const payload = { ...formData };

        try {
            const res = await fetch(`/api/menu/${item._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Failed to update");
            }

            const updatedItem = await res.json();
            onUpdate(updatedItem);
            onClose();
        } catch (error) {
            alert("Failed to update product");
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-300";
    const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white rounded-3xl w-full max-w-3xl z-10 p-8 shadow-2xl animate-fade-in-up flex flex-col max-h-[95vh]">

                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Edit Product</h2>
                        <p className="text-sm text-slate-400 mt-1">Update details for <span className="font-semibold text-rose-500">{item.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <FaTimes className="text-slate-400 text-xl" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Product Name</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Price (₹)</label>
                                    <input
                                        type="number"
                                        className={inputClass}
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Category</label>
                                    <input
                                        type="text"
                                        list="edit-category-options"
                                        className={inputClass}
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Select or type category"
                                    />
                                    <datalist id="edit-category-options">
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className={labelClass}>Sort Number</label>
                                    <input
                                        type="number"
                                        min={0}
                                        className={inputClass}
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Badge Label (Optional)</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.badge}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    placeholder="e.g. BEST SELLER"
                                />
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">

                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700 text-sm">In Stock?</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>

                                <hr className="border-slate-200" />

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                            Most Loved? <FaHeart className="text-rose-400 text-xs" />
                                        </span>
                                        <span className="text-[10px] text-slate-400">Highlights item with a heart icon</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.isMostLoved}
                                            onChange={(e) => setFormData({ ...formData, isMostLoved: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">

                            <div>
                                <label className={labelClass}>Product Image</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer relative group bg-slate-50 hover:bg-rose-50 hover:border-rose-400 transition-all overflow-hidden">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                    />

                                    {imageUploading ? (
                                        <div className="flex flex-col items-center animate-pulse">
                                            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                            <p className="text-xs font-bold text-rose-500">Uploading...</p>
                                        </div>
                                    ) : formData.imageUrl ? (
                                        <div className="w-full h-full relative group-hover:opacity-80 transition-opacity">
                                            <img src={formData.imageUrl} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Change Image</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center group-hover:scale-105 transition-transform duration-200">
                                            <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-2">
                                                <FaCloudArrowUp className="text-2xl text-slate-400 group-hover:text-rose-500" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-500 group-hover:text-rose-600">Click to upload</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    className={`${inputClass} h-32 resize-none`}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ingredients, details..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-8 py-2.5 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                        onClick={handleUpdate}
                    >
                        Update Product
                    </button>
                </div>

            </div>
        </div>
    );
}
