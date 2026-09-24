import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PosUser from "@/models/PosUser";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const regex = new RegExp(q, "i");

    const users = await PosUser.find({
      $or: [
        { fullName: { $regex: regex } },
        { mobile: { $regex: regex } },
      ],
    })
      .select("fullName mobile")
      .sort({ lastOrderAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Customer suggestion error:", err);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
