'use client';

import React from 'react';
import { FaBarsStaggered, FaCrown, FaBell } from 'react-icons/fa6'; 
import { useSidebar } from '@/context/SidebarContext'; 

export default function MobileDashboardShell({ children }: { children: React.ReactNode }) {
    const { toggleSidebar } = useSidebar();

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white shadow-sm lg:hidden border-b border-gray-100">
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-slate-500 hover:text-rose-600 transition-colors rounded-lg bg-gray-50 active:bg-gray-100"
                        aria-label="Toggle navigation menu"
                    >
                        <FaBarsStaggered className="text-xl" />
                    </button>
                    
                    <div className="flex items-center">
                        <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-1.5 rounded-md shadow-md shadow-rose-200">
                            <FaCrown className="text-base" />
                        </div>
                        <h1 className="ml-2 text-base font-bold text-slate-800 leading-none">
                            Kem Cho <span className="text-rose-600">Momos</span>
                        </h1>
                    </div>
                </div>

                <button
                    className="p-2 text-slate-500 hover:text-rose-600 transition-colors rounded-full relative"
                    aria-label="View notifications"
                >
                    <FaBell className="text-xl" />
                    <span className="absolute top-2 right-2 block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
            </header>

           <main className="p-4 sm:p-6 lg:ml-72"> 
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}