"use client";

import React from "react";
import {
    Mail,
    Lock,
    LogIn,
    Loader2,
    AlertTriangle,
    Eye,
    EyeOff,
    Crown,
} from "lucide-react";

// Import the custom hook
import { useAuthLogin } from "@/hooks/useAuthLogin"; // Assuming hook is in the same directory or adjust path

export default function App() {
    // Consume the custom hook
    const {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        success,
        showPassword,
        isDisabled,
        togglePasswordVisibility,
        login,
    } = useAuthLogin();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-inter">


            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 border border-gray-100/70">
                <div className="text-center mb-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-center mb-2">
                        <Crown className="text-rose-600 w-9 h-9 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        Kem Cho Momos Admin Login
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Access your Admin Panel
                    </p>
                </div>

                {error && (
                    <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2">
                        <LogIn className="w-5 h-5 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={login} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-medium text-slate-800 transition-colors focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                                disabled={isDisabled}
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 py-3 font-medium text-slate-800 transition-colors focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                                disabled={isDisabled}
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 transition-colors rounded-full active:scale-95"
                                disabled={isDisabled}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isDisabled}
                        className="w-full mt-8 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-300 hover:bg-rose-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                {/* <div className="mt-8 text-center text-sm text-slate-400">
                    <p>To test, make sure you have users in MongoDB.</p>
                </div> */}
            </div>
        </div>
    );
}