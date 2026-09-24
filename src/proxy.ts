import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  const protectedRoutes = ["/", "/dashboard", "/admin", "/orders"];
  const isProtected = protectedRoutes.some((r) =>
    req.nextUrl.pathname.startsWith(r)
  );

  if (!isProtected) return NextResponse.next();
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await connectDB();
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id).select("+activeToken");

    if (!user || user.activeToken !== token) {
      return forceLogout(req);
    }

    return NextResponse.next();
  } catch {
    return forceLogout(req);
  }
}

function forceLogout(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login?reason=session-expired", req.url));
  res.cookies.delete("authToken");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|login).*)"],
};
