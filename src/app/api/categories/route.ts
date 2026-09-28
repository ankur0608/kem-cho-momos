import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({}).sort({ sortOrder: 1, createdAt: 1 });
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { name } = await req.json();
        
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (existing) {
            return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }

        const newCategory = new Category({ name });
        await newCategory.save();
        
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ error: "Name parameter is required" }, { status: 400 });
        }

        await Category.deleteOne({ name: new RegExp(`^${name}$`, 'i') });
        
        return NextResponse.json({ message: "Category deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
