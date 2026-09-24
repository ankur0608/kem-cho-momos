import mongoose, { Schema, models } from "mongoose";

const MenuItemSchema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },

        description: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
        category: { type: String, required: true },

        stock: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 99999 },
        badge: { type: String, default: "" },
        isMostLoved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.MenuItem ||
    mongoose.model("MenuItem", MenuItemSchema, "menu-items");
