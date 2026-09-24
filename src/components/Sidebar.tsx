'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FaCrown, FaChartPie, FaStopwatch, FaCalculator, FaClockRotateLeft,
    FaUtensils, FaUsers, FaTicket, FaXmark,
    FaMoneyBillTrendUp,
    FaSalesforce,
} from 'react-icons/fa6';

import { useSidebar } from '@/context/SidebarContext';

const NavItem = ({ icon: Icon, label, href }: any) => {
    const pathname = usePathname();
    const isActive = href === '/' ? pathname === '/' : pathname.endsWith(href);

    return (
        <Link
            href={href}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all group font-medium ${isActive ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                }`}
        >
            <Icon
                className={`text-lg w-8 transition-transform group-hover:scale-110 ${isActive ? 'text-rose-600' : ''}`}
            />
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    );
};

export default function Sidebar() {
    const { isSidebarOpen, closeSidebar } = useSidebar();

    return (
        <>
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <nav
                className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50
                    shadow-[4px_0_24px_rgba(0,0,0,0.02)] w-72
                    transition-transform duration-300
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo */}
                <div className="h-20 flex items-center justify-between px-4 border-b border-gray-50 shrink-0">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-2.5 rounded-xl shadow-lg shadow-rose-200">
                            <FaCrown className="text-xl" />
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-extrabold text-slate-800 leading-none">
                                Kem Cho <span className="text-rose-600">Momos</span>
                            </h1>
                            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                                Admin Panel
                            </span>
                        </div>
                    </div>

                    {/* Close button (only mobile) */}
                    <button
                        onClick={closeSidebar}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors lg:hidden"
                    >
                        <FaXmark className="text-xl" />
                    </button>
                </div>

                {/* Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
                    <div>
                        <p className="px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                            Operations
                        </p>
                        <ul className="space-y-1">
                            <li><NavItem icon={FaChartPie} label="Dashboard" href="/" /></li>
                            <li><NavItem icon={FaStopwatch} label="Live Queue" href="/live-queue" /></li>
                            <li><NavItem icon={FaCalculator} label="POS Terminal" href="/pos" /></li>
                            <li><NavItem icon={FaSalesforce} label="Sales" href="/sales" /></li>
                            <li><NavItem icon={FaClockRotateLeft} label="Order History" href="/history" /></li>
                        </ul>
                    </div>

                    <div>
                        <p className="px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                            Management
                        </p>
                        <ul className="space-y-1">
                            <li><NavItem icon={FaUtensils} label="Menu & Items" href="/menu" /></li>
                            <li><NavItem icon={FaUsers} label="Customers" href="/posuser" /></li>
                            {/* <li><NavItem icon={FaUsers} label="Customers" href="/customers" /></li> */}
                            <li><NavItem icon={FaTicket} label="Coupons" href="/coupons" /></li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 shrink-0">
                    <div className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-white hover:shadow-md transition-all">
                        <img
                            src="https://ui-avatars.com/api/?name=Admin&background=f43f5e&color=fff"
                            className="w-10 h-10 rounded-lg"
                            alt="Admin"
                        />
                        <div className="ml-3">
                            <p className="text-sm font-bold text-slate-800">Store Manager</p>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase">Online</p>
                        </div>
                    </div>
                </div>
            </nav >
        </>
    );
}
