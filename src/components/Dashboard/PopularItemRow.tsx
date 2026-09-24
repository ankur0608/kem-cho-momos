import React from 'react';
import { FaChevronRight } from "react-icons/fa6";
import { PopularItem } from '@/components/Dashboard/type/dashboard';

export const PopularItemRow: React.FC<PopularItem> = ({ name, orders, icon: Icon, colorIcon }) => (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div
                className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 ${colorIcon}`}
            >
                <Icon />
            </div>
            <div className="min-w-0">
                <div className="font-bold text-sm text-slate-800 truncate">{name}</div>
                <div className="text-xs text-slate-400">{orders} orders today</div>
            </div>
        </div>
        <FaChevronRight className="text-gray-300 text-xs shrink-0" />
    </div>
);