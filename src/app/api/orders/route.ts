import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import PosUser from "@/models/PosUser";

interface OrderUser {
    fullName?: string;
    mobile?: string;
    phoneNumber?: string;
}

interface OrderDocument {
    _id: string;
    createdAt: Date;
    user: OrderUser;
}

interface OrderDocument {
    _id: string;
    createdAt: Date;
    total: number;
    status: string;
    paymentMethod: 'CASH' | 'ONLINE';
    user: OrderUser;
}

// export async function GET(req: Request) {
//     try {
//         await connectDB();

//         const { searchParams } = new URL(req.url);


//         const dashboardTime = searchParams.get("dashboard"); 
//         const paymentMode = searchParams.get("paymentMode");

//         const page = Number(searchParams.get("page")) || 1;
//         const limit = Number(searchParams.get("limit")) || 5000;
//         const statusFilter = searchParams.get("status");
//         const searchQuery = searchParams.get("search");
//         const requestedUserId = searchParams.get("userId");

//         const skip = (page - 1) * limit;

//         const query: any = {};

//         if (dashboardTime === "today") {
//             const now = new Date();
//             const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//             query.createdAt = { $gte: todayStart };
//         }

//         if (paymentMode && (paymentMode.toUpperCase() === "CASH" || paymentMode.toUpperCase() === "ONLINE")) {
//             query.paymentMethod = {
//                 $regex: paymentMode,
//                 $options: "i"
//             };
//         }

//         // 3. Status filter
//         if (statusFilter) {
//             query.status = statusFilter;
//         }

//         // 4. User filter
//         if (requestedUserId) {
//             query.user = requestedUserId;
//         }

//         // 5. Search filter
//         if (searchQuery) {
//             query._id = { $regex: searchQuery, $options: "i" };
//         }

//         const total = await Order.countDocuments(query);

//         const orders = await Order.find(query)
//             .populate("user", "fullName mobile")
//             .sort({ createdAt: -1 })
//             .skip(dashboardTime ? 0 : skip)
//             .limit(limit);

//         const mappedOrders = orders.map(order => ({
//             ...order.toObject(),

//             paymentMethod: (order as any).paymentMethod?.toLowerCase() === 'cash' ? 'Cash' : 'Online',
//             user: (order as any).user ? { fullName: (order as any).user.fullName } : null,
//             _id: order._id.toString(),
//         }));


//         return NextResponse.json({ total, orders: mappedOrders });

//     } catch (error) {
//         console.error("Order GET error:", error);
//         return NextResponse.json(
//             { error: "Failed to fetch orders" },
//             { status: 500 }
//         );
//     }
// }
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        // --- NEW: Get start and end dates for Sales Report ---
        const startParam = searchParams.get("start");
        const endParam = searchParams.get("end");
        // ----------------------------------------------------

        const dashboardTime = searchParams.get("dashboard");
        const paymentMode = searchParams.get("paymentMode");

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 5000;
        const statusFilter = searchParams.get("status");
        const searchQuery = searchParams.get("search");
        const requestedUserId = searchParams.get("userId");

        const skip = (page - 1) * limit;

        const query: any = {};

        // --- NEW: Logic for Sales Report (Today & All Time) ---
        if (startParam && endParam) {
            query.createdAt = {
                $gte: new Date(startParam),
                $lte: new Date(endParam)
            };
        }
        // Existing Dashboard logic (fallback)
        else if (dashboardTime === "today") {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            query.createdAt = { $gte: todayStart };
        }
        // -----------------------------------------------------

        if (paymentMode && (paymentMode.toUpperCase() === "CASH" || paymentMode.toUpperCase() === "ONLINE")) {
            query.paymentMethod = {
                $regex: paymentMode,
                $options: "i"
            };
        }

        // 3. Status filter
        if (statusFilter) {
            query.status = statusFilter;
        }

        // 4. User filter
        if (requestedUserId) {
            query.user = requestedUserId;
        }

        // 5. Search filter
        if (searchQuery) {
            query._id = { $regex: searchQuery, $options: "i" };
        }

        const total = await Order.countDocuments(query);

        const orders = await Order.find(query)
            .populate("user", "fullName mobile")
            .sort({ createdAt: -1 })
            .skip(dashboardTime ? 0 : skip)
            .limit(limit)
            .lean();

        const mappedOrders = orders.map(order => ({
            ...(order as any),
            paymentMethod: (order as any).paymentMethod?.toLowerCase() === 'cash' ? 'Cash' : 'Online',
            user: (order as any).user ? { fullName: (order as any).user.fullName } : null,
            _id: (order as any)._id.toString(),
        }));


        return NextResponse.json({ total, orders: mappedOrders });

    } catch (error) {
        console.error("Order GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // 1. Create the new Order
        const createdOrder = await Order.create(body);

        const singleOrderResult = Array.isArray(createdOrder) ? createdOrder[0] : createdOrder;

        // Note: Casting to OrderDocument to ensure access to paymentMethod, total, etc.
        const newOrder = singleOrderResult as unknown as OrderDocument & { total: number, paymentMethod: string };

        console.log("Order created successfully:", newOrder);

        const { fullName, mobile, phoneNumber } = (newOrder as any).user; // Use type assertion
        const posUserMobileKey = mobile || phoneNumber;

        if (fullName && posUserMobileKey) {
            // Determine payment type
            const paymentMode = newOrder.paymentMethod ? newOrder.paymentMethod.toUpperCase() : null;
            const isCash = paymentMode === "CASH";
            const isOnline = paymentMode === "ONLINE";

            // The total amount spent by this order
            const totalOrderAmount = newOrder.total;

            // 2. Update POS customer (Upsert logic)
            await PosUser.findOneAndUpdate(
                { mobile: posUserMobileKey },
                {
                    $set: {
                        fullName: fullName,
                        lastOrderAt: newOrder.createdAt,
                    },
                    $inc: {
                        // Increment counts and total spent
                        totalOrders: 1,
                        totalSpent: totalOrderAmount, // ✅ NEW: Increment total spent
                        cashOrders: isCash ? 1 : 0,   // ✅ NEW: Increment cash orders
                        onlineOrders: isOnline ? 1 : 0, // ✅ NEW: Increment online orders
                                dineOrders: (newOrder as any).orderType === "Dine in" ? 1 : 0, // ✅ NEW: Increment dine orders
                                parcelOrders: (newOrder as any).orderType === "Parcel" ? 1 : 0, // ✅ NEW: Increment parcel orders
                    },
                },
                // options: upsert=true creates the document if it doesn't exist
                { upsert: true, new: true }
            );
            console.log(`PosUser updated for key: ${posUserMobileKey}`);
        } else {
            console.log("Skipped PosUser update: Missing fullName or mobile/phoneNumber.");
        }
        return NextResponse.json({ success: true, order: newOrder });
    } catch (err: any) {
        console.error("Order POST error:", err);
        return NextResponse.json(
            { error: "Order save failed", details: err.message },
            { status: 500 }
        );
    }
}