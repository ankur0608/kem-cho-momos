'use client';

import React, { useState } from "react";
import { MenuItem } from "@/types/MenuItem";
import { FaTimes } from "react-icons/fa";

interface Props {
    onClose: () => void;
    onSave: (item: MenuItem) => void;
    categories: string[];
}

export default function AddProductModal({ onClose, onSave, categories }: Props) {
    const [imageUploading, setImageUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        category: categories[0],
        stock: true,
        description: "",
        imageUrl: "",
    });

    const uploadImage = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageUploading(true);

        const form = new FormData();
        form.append("file", file);

        const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
            method: "POST",
            headers: {
                Authorization: `Basic ${btoa("public_key:private_key")}`,
            },
            body: form,
        });

        const data = await res.json();
        setFormData({ ...formData, imageUrl: data.url });

        setImageUploading(false);
    };

    const handleSubmit = async () => {
        const payload = {
            name: formData.name,
            price: formData.price,
            category: formData.category,
            stock: formData.stock,
            description: formData.description,
            imageUrl: formData.imageUrl,
        };

        const res = await fetch("/api/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const saved = await res.json();
        onSave(saved);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            <div className="bg-white rounded-2xl p-6 z-10 w-full max-w-xl space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-xl">Add Product</h2>
                    <FaTimes onClick={onClose} className="cursor-pointer" />
                </div>

                <input
                    type="text"
                    placeholder="Name"
                    className="input"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <input
                    type="number"
                    placeholder="Price"
                    className="input"
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />

                <select
                    className="input"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                    {categories.map((cat) => (
                        <option key={cat}>{cat}</option>
                    ))}
                </select>

                <textarea
                    placeholder="Description"
                    className="input"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <div className="border p-4 rounded-xl text-center cursor-pointer">
                    <label className="cursor-pointer">
                        Upload Image
                        <input type="file" hidden onChange={uploadImage} />
                    </label>

                    {imageUploading && <p>Uploading...</p>}

                    {formData.imageUrl && (
                        <img src={formData.imageUrl} className="w-32 mx-auto mt-2 rounded-xl" />
                    )}
                </div>

                <button
                    className="w-full bg-rose-600 text-white py-2 rounded-xl"
                    onClick={handleSubmit}
                >
                    Save Product
                </button>
            </div>
        </div>
    );
}
