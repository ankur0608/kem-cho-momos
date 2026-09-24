// app/api/pos/route.js (Optimized)

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import PosUser from "@/models/PosUser";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
    try {
        await connectDB();

        // MongoDB Aggregation Pipeline for efficient bulk updates
        const aggregationResult = await Order.aggregate([
            // 1. Filter: Only orders with name and mobile
            {
                $match: {
                    "user.fullName": { $exists: true, $ne: "" },
                    "user.mobile": { $exists: true, $ne: "" },
                }
            },
            // 2. Group: Group by mobile number (the customer)
            {
                $group: {
                    _id: "$user.mobile", // Group key
                    fullName: { $last: "$user.fullName" },
                    totalOrders: { $sum: 1 },
                    lastOrderAt: { $max: "$createdAt" },
                    totalSpent: { $sum: "$total" }, // ✅ NEW: Sum of total money spent

                    // ✅ NEW: Conditional Sum for Payment Methods
                    cashOrders: { 
                        $sum: { 
                            $cond: [{ $eq: ["$paymentMethod", "Cash"] }, 1, 0] 
                        } 
                    }, 
                    onlineOrders: { 
                        $sum: { 
                            $cond: [{ $eq: ["$paymentMethod", "Online"] }, 1, 0] 
                        } 
                    },
                    // ✅ NEW: Conditional Sum for Order Type (Dine in / Parcel)
                    dineOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$orderType", "Dine in"] }, 1, 0]
                        }
                    },
                    parcelOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$orderType", "Parcel"] }, 1, 0]
                        }
                    },
                    // NOTE: Assumes paymentMethod is stored as "Cash" or "Online" (Title Case)
                }
            },
            // 3. Project: Remap fields to match the PosUser model structure
            {
                $project: {
                    _id: 0, 
                    mobile: "$_id", 
                    fullName: 1,
                    totalOrders: 1,
                    cashOrders: 1,   // ✅ NEW
                    onlineOrders: 1, // ✅ NEW
                    dineOrders: 1,   // ✅ NEW
                    parcelOrders: 1, // ✅ NEW
                    totalSpent: 1,   // ✅ NEW
                    lastOrderAt: 1,
                }
            },
            // 4. Merge: Upsert the aggregated results into the PosUser collection
            {
                $merge: {
                    into: "posusers", 
                    on: "mobile", 
                    whenMatched: "replace", 
                    whenNotMatched: "insert" 
                }
            }
        ]);

        // After the merge, query the updated PosUser collection
        // We ensure a large enough set of data is returned for the frontend component.
        const posUsers = await PosUser.find({})
            .sort({ lastOrderAt: -1 })
            .limit(100)
            .lean();

        return NextResponse.json({ success: true, users: posUsers });
    } catch (err) {
        console.error("Error running POS aggregation:", err);
        return NextResponse.json({ success: false, message: "Aggregation failed" }, { status: 500 });
    }
}