import mongoose, { Schema, models } from "mongoose";

const CategorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default models.Category || mongoose.model("Category", CategorySchema);
