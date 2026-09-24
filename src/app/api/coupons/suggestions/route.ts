import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toUpperCase();

    if (!q || q.length < 2) {
      return NextResponse.json({ coupons: [] });
    }

    // 🔑 STRING DATE (same logic as your main coupon API)
    const today = new Date().toISOString().split("T")[0];

    const coupons = await Coupon.find({
      code: { $regex: q, $options: "i" },
      startDate: { $lte: today },
      expiryDate: { $gte: today },
    })
      .select("code discountPercentage expiryDate")
      .limit(5)
      .lean();

    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("Coupon suggestion error:", err);
    return NextResponse.json({ coupons: [] }, { status: 500 });
  }
}
