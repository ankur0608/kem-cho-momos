"use client";
import { useEffect } from "react";

export default function SessionGuard() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/session/validate", {
          method: "GET",
          credentials: "include", // ✅ REQUIRED
        });

        if (!res.ok) {
          window.location.href = "/login?reason=session-expired";
        }
      } catch {
        window.location.href = "/login?reason=session-expired";
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return null;
}
