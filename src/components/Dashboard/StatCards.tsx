import React from 'react';
import { FaArrowUp } from "react-icons/fa6";

interface StatCardProps {
    icon: any;
    color: 'blue' | 'orange' | 'purple';
    value: string | number;
    label: string;
    percentage?: string;
    isAction?: boolean;
    onClick?: () => void;
}

export const MobileStatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    color,
    value,
    label,
    percentage,
    isAction = false,
    onClick,
}) => {
    if (isAction) {
        return (
            <div
                onClick={onClick}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl shadow-md cursor-pointer active:scale-[.99] transition-transform"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                        <Icon className="text-xl" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
                </div>
                <h3 className="text-xl font-extrabold">{value}</h3>
            </div>
        );
    }

    const colorClasses: Record<string, string> = {
        blue: "text-blue-600",
        orange: "text-orange-600",
        purple: "text-purple-600",
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-[.99] transition-transform">
            <div className="flex items-center gap-3">
                <div
                    className={`w-9 h-9 p-0 rounded-full bg-gray-100 flex items-center justify-center shrink-0 ${colorClasses[color]}`}
                >
                    <Icon className="text-base" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                        {label}
                    </p>
                    <h3 className="text-xl font-extrabold text-slate-800">{value}</h3>
                </div>
            </div>
            {percentage && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                    <FaArrowUp className="text-[10px]" /> {percentage}
                </span>
            )}
        </div>
    );
};

export const DesktopStatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    color,
    value,
    label,
    percentage,
    isAction = false,
    onClick,
}) => {
    const baseClasses =
        "p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-shadow group";

    if (isAction) {
        return (
            <div
                onClick={onClick}
                className="bg-gradient-to-br from-rose-500 to-rose-600 p-5 sm:p-6 rounded-2xl shadow-lg shadow-rose-200 text-white relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
            >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Icon className="text-xl animate-pulse" />
                    </div>
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg whitespace-nowrap">
                        Action Needed
                    </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold relative z-10 min-w-0">
                    {value}
                </h3>
                <p className="text-rose-100 text-xs font-bold uppercase tracking-wider mt-1 relative z-10">
                    {label}
                </p>
            </div>
        );
    }

    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        orange:
            "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
        purple:
            "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    };

    return (
        <div className={`bg-white ${baseClasses}`}>
            <div className="flex justify-between items-start mb-4">
                <div
                    className={`p-3 rounded-xl transition-colors ${colorClasses[color]}`}
                >
                    <Icon className="text-xl" />
                </div>
                {percentage && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <FaArrowUp /> {percentage}
                    </span>
                )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 min-w-0">
                {value}
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                {label}
            </p>
        </div>
    );
};