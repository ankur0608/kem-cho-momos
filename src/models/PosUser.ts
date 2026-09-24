// models/PosUser.js

import mongoose, { Schema, models, Document } from "mongoose";

export interface IPosUser extends Document {
  fullName: string;
  mobile: string;
  totalOrders: number;
  cashOrders: number;
  onlineOrders: number;
  totalSpent: number;
  lastOrderAt: Date;
}

const PosUserSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  totalOrders: { type: Number, default: 0 },
  cashOrders: { type: Number, default: 0 },
  dineOrders: { type: Number, default: 0 },
  parcelOrders: { type: Number, default: 0 },
  onlineOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderAt: { type: Date },
}, {
  timestamps: true
});

// FIX: Correctly instantiate the model
export default models.PosUser || mongoose.model<IPosUser>("PosUser", PosUserSchema);