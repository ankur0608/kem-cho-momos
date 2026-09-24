import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

// --- Utility function to determine coupon status for filtering ---
const getCouponStatusQuery = (statusFilter: string) => {
    const now = new Date();
    // Normalize dates for comparison (date only)
    const today = now.toISOString().split('T')[0];
    
    // Status definitions based on dates
    switch (statusFilter.toLowerCase()) {
        case 'active':
            // Starts today or earlier AND expires tomorrow or later
            return { startDate: { $lte: today }, expiryDate: { $gte: today } };
        case 'expired':
            // Expires yesterday or earlier
            return { expiryDate: { $lt: today } };
        case 'scheduled':
            // Starts tomorrow or later
            return { startDate: { $gt: today } };
        case 'all':
        default:
            return {};
    }
}

// 1. GET ALL COUPONS (with Pagination and Filtering)
export async function GET(req: Request) {
    try {
        await connectDB();
        
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10"); // Default to 10
        const statusFilter = url.searchParams.get("filter") || "All";
        const searchQuery = url.searchParams.get("search")?.trim() || "";

        const skip = (page - 1) * limit;

        // 2. Build Query Object
        let query: any = {};
        
        // Add status filter conditions
        query = getCouponStatusQuery(statusFilter);

        // Add search query conditions (search by code)
        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            query.code = { $regex: regex };
        }

        // 3. Count Total Items
        const totalCount = await Coupon.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        // 4. Fetch Paginated Data
        const coupons = await Coupon.find(query)
            .sort({ createdAt: -1 }) // Sort by newest created first
            .skip(skip)
            .limit(limit)
            .lean();

        // 5. Return Response
        return NextResponse.json({
            coupons,
            total: totalCount,
            totalPages: totalPages,
            currentPage: page,
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
    }
}

// 2. CREATE COUPON (unchanged - POST)
export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { code, discountPercentage, startDate, expiryDate } = body;

        // Validation: Start Date vs Expiry Date
        if (new Date(startDate) >= new Date(expiryDate)) {
            return NextResponse.json(
                { error: "Expiry date must be after start date" },
                { status: 400 }
            );
        }

        // Validation: Duplicate Code
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return NextResponse.json(
                { error: "Coupon code already exists" },
                { status: 400 }
            );
        }

        const newCoupon = await Coupon.create({
            code: code.toUpperCase(), // Ensure code is saved uppercase
            discountPercentage,
            startDate,
            expiryDate,
        });

        return NextResponse.json(newCoupon, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }
}

// 3. DELETE COUPON (unchanged - DELETE)
export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await Coupon.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}

// 4. UPDATE COUPON (unchanged - PUT)
export async function PUT(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Coupon ID is required" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { code, discountPercentage, startDate, expiryDate } = body;

        // Validation: Start < Expiry
        if (new Date(startDate) >= new Date(expiryDate)) {
            return NextResponse.json(
                { error: "Expiry date must be after start date" },
                { status: 400 }
            );
        }

        // Validation: Duplicate Code (ignore same coupon)
        const existing = await Coupon.findOne({
            code: code.toUpperCase(),
            _id: { $ne: id },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Coupon code already exists" },
                { status: 400 }
            );
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            {
                code: code.toUpperCase(), // Ensure code is saved uppercase
                discountPercentage,
                startDate,
                expiryDate,
            },
            { new: true }
        );

        if (!updatedCoupon) {
            return NextResponse.json(
                { error: "Coupon not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedCoupon);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update coupon" },
            { status: 500 }
        );
    }
}