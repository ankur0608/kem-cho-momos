import mongoose, { Schema, models } from "mongoose";

const CustomerSchema = new Schema(
  {
    fullName: String,
    mobile: { type: String, unique: true },
    totalOrders: { type: Number, default: 0 },
    lastOrderDate: Date,
  },
  { timestamps: true }
);

export default models.Customer || mongoose.model("Customer", CustomerSchema);
