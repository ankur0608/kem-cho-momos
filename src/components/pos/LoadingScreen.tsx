"use client";

import React from "react";
import { FaSpinner } from "react-icons/fa6";

export default function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 text-slate-500 gap-3">
      <FaSpinner className="animate-spin text-2xl" />
      Loading POS...
    </div>
  );
}
