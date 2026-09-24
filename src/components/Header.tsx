'use client';

import { useState } from 'react';

import { FaBell, FaPowerOff, FaBars } from 'react-icons/fa6';
import { useSidebar } from '@/context/SidebarContext';
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Header() {
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    // Logout function
    const handleLogout = async () => {
        try {
            const res = await fetch("/api/logout", { method: "GET" });

            if (res.ok) {
                toast.success("Logged out successfully");
                router.push("/login");
            } else {
                toast.error("Failed to logout");
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Something went wrong");
        }
    };

    return (
        <>
            <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 md:px-12 z-20 sticky top-0 transition-all">

                {/* LEFT SECTION */}
                <div className="flex items-center gap-4 md:gap-6 flex-1 max-w-2xl">
                    {/* MOBILE HAMBURGER BUTTON */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden w-10 h-10 rounded-full bg-white border border-gray-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all"
                    >
                        <FaBars className="text-lg" />
                    </button>

                </div>

                {/* RIGHT SECTION */}
                <div className="flex items-center gap-3 md:gap-4">

                    {/* POWER / LOGOUT ICON */}
                    <button
                        onClick={() => setIsLogoutDialogOpen(true)}
                        className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-slate-800 text-white hover:bg-rose-600 flex items-center justify-center transition-all"
                    >
                        <FaPowerOff className="text-base md:text-lg" />
                    </button>
                </div>
            </header>

            {/* LOGOUT CONFIRMATION DIALOG */}
            {isLogoutDialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 mx-auto mb-4">
                            <FaPowerOff className="text-rose-500 text-xl" />
                        </div>

                        <h2 className="text-lg font-semibold text-slate-900 text-center">
                            Log out of Dashboard?
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 text-center">
                            You will be redirected to the login page. You can log in again anytime.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsLogoutDialogOpen(false)}
                                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsLogoutDialogOpen(false);
                                    await handleLogout();
                                }}
                                className="flex-1 h-10 rounded-xl bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
