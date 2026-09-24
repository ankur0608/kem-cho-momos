import mongoose, { Schema, models } from "mongoose";

const OrderSchema = new Schema(
    {
        cart: [
            {
                _id: { type: String },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                category: { type: String },
                imageUrl: { type: String },
                code: { type: String },
            },
        ],
        subtotal: Number,
        deliveryFee: Number,
        discount: Number,
        total: Number,
        orderType: { type: String, enum: ["Dine in", "Parcel"], default: "Dine in" },

        paymentMethod: String,
        paymentId: String,
        razorpayOrderId: String,
        razorpaySignature: String,

        status: { type: String, default: "pending" },

        user: {
            fullName: { type: String },
            phoneNumber: { type: String }, 
            mobile: { type: String },      
            email: { type: String },
            street: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            type: { type: String },
            name: { type: String },
        },
    },
    { timestamps: true }
);

export default models.Order || mongoose.model("Order", OrderSchema);