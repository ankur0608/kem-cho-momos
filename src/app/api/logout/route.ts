import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully",
    });

    // Clear the auth cookie
    response.cookies.set("authToken", "", {
        path: "/",
        expires: new Date(0),
    });

    return response;
}
