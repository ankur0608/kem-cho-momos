import { connectDB } from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import { NextResponse } from "next/server";

export async function PUT(req: Request, context: any) {
    await connectDB();

    const { id } = await context.params;      // FIX
    const body = await req.json();

    const updated = await MenuItem.findByIdAndUpdate(id, body, {
        new: true,
    });

    return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: any) {
    await connectDB();

    const { id } = await context.params;      // FIX

    await MenuItem.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
}
