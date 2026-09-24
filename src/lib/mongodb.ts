import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MongoDB URI missing. Add MONGODB_URI in .env");

let cached = (global as any).mongoose || { conn: null, promise: null };
// console.log("MONGODB_URI =", process.env.MONGODB_URI);  // DEBUG

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                bufferCommands: false,
            })
            .then((mongoose) => mongoose)
            .catch((err) => {
                cached.promise = null; // Clear promise on failure so we can retry
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    (global as any).mongoose = cached;

    return cached.conn;
}
