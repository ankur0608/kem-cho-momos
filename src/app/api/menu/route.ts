import { connectDB } from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import { NextResponse } from "next/server";
import { getMenuCategoryVariants } from "@/constants/menuCategories";

export async function GET(req: Request) {
    await connectDB();
    
    // ------------------------------------------
    // PAGINATION LOGIC
    // ------------------------------------------
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "8"); // Default to 8 items per page
    const category = url.searchParams.get("category");

    const skip = (page - 1) * limit;

    // Build query object for filtering
    const query: any = {};
    if (category && category !== "All") {
        query.category = { $in: getMenuCategoryVariants(category) };
    }

    try {
        // 1. Get the total count of items matching the filter
        const totalItems = await MenuItem.countDocuments(query);
        
        // 2. Calculate the total number of pages
        const totalPages = Math.ceil(totalItems / limit);

        // 3. Fetch the paginated and filtered items using a sort value that
        //    keeps explicit sortOrder values ahead of default/empty values.
        const items = await MenuItem.aggregate([
            { $match: query },
            {
                $addFields: {
                    sortValue: {
                        $cond: [
                            { $or: [{ $eq: ["$sortOrder", null] }, { $eq: ["$sortOrder", 0] }] },
                            99999,
                            "$sortOrder",
                        ],
                    },
                },
            },
            { $sort: { sortValue: 1, name: 1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        // 4. Fetch distinct categories
        const dbCategories = await MenuItem.distinct("category");

        return NextResponse.json({
            items,
            totalPages,
            currentPage: page,
            categories: dbCategories,
        });

    } catch (error) {
        console.error("Error fetching menu items:", error);
        return NextResponse.json({ message: "Failed to fetch menu items" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await connectDB();
    const data = await req.json();
    const item = await MenuItem.create(data);
    return NextResponse.json(item);
}
