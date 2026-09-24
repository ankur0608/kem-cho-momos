import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

type CartEntry = {
  name: string;
  price: number;
  quantity: number;
};

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await connectDB();

  const { id } = await ctx.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const formatted = {
      ...order.toObject(),
      items: order.cart.map((c: CartEntry) => ({
        name: c.name,
        price: c.price,
        qty: c.quantity,
      })),
    };

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await ctx.params;
  await Order.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await ctx.params;
  const body = await req.json();
  const updated = await Order.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated);
}
