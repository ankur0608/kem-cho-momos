// app/api/customers/route.ts (or pages/api/customers.ts)

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Ensure this path is correct
import Profile from "@/models/Profile"; // Ensure this is your Mongoose Model
import { CustomerProfile } from "@/components/customers/types"; // Import CustomerProfile type for safety

// Define the expected API Response Structure for the front-end
interface CustomerListResponse {
  profiles: CustomerProfile[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Function to handle GET requests
export async function GET(request: Request) {
  try {
    await connectDB();

    // 1. Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    // const search = searchParams.get("search") || ""; // Search parameter removed

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // --- Dynamic Filtering Logic ---
    // Remove search logic; the query object is now always empty {}
    const query: any = {}; 
    // --- End Dynamic Filtering Logic ---

    // 2. Get the total number of documents matching the query (for pagination)
    // Query is empty {}, so this gets the total count of all profiles.
    const totalCustomers = await Profile.countDocuments(query);
    const totalPages = Math.ceil(totalCustomers / limit);

    // 3. Fetch the paginated profiles
    const profiles = await Profile.find(query)
      .sort({ updatedAt: -1 }) // Sort by newest first
      .skip(skip) // Apply pagination offset
      .limit(limit) // Apply pagination limit
      .lean<CustomerProfile[]>(); // Use .lean() for faster query results

    // 4. Return the data in the required format
    const responseData: CustomerListResponse = {
      profiles: profiles,
      total: totalCustomers,
      totalPages: totalPages,
      currentPage: page,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}