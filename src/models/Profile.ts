// models/Profile.ts (Revised)

import mongoose, { Schema, Document, Model } from "mongoose";
import { CustomerProfile, Address } from "@/components/customers/types";

export interface CustomerProfileDocument extends CustomerProfile, Document { }

const AddressSchema: Schema<Address> = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false } 
);

const ProfileSchema: Schema<CustomerProfileDocument> = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    addresses: { type: [AddressSchema], default: [] },
    totalOrders: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    lastOrderDate: { type: String, default: new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

const Profile: Model<CustomerProfileDocument> =
  mongoose.models.Profile ||
  mongoose.model<CustomerProfileDocument>("Profile", ProfileSchema, 'profile'); 

export default Profile;