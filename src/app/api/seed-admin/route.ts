import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    
    const email = "admin@company.com";
    const password = "password123";
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ 
        message: "Admin already exists! You can log in.", 
        email, 
        password 
      });
    }
    
    // Create new admin user
    const newAdmin = new User({ email, password });
    await newAdmin.save();
    
    return NextResponse.json({ 
      message: "Admin created successfully! Use these credentials to log in.", 
      email, 
      password 
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create admin: " + error.message }, { status: 500 });
  }
}
