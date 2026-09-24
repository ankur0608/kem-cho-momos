'use client';

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useSidebar();

    return (
        // The overall flex container should use the style from the HTML body
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-brand-100 selection:text-brand-700">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Content Wrapper */}
            <div
                className={`
                    relative flex flex-col flex-1 h-screen min-w-0 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}
                    pl-0 
                `}
            >
                {/* Header (Header component not provided, assuming it works) */}
                <Header />

                {/* Page Content: Reduced mobile padding from p-6/p-10 to p-4/sm:p-6 */}
                <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    );
}