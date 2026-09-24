import React from 'react';
import { SalesCategory } from '@/components/Dashboard/type/dashboard';

export const SalesCategoryItem: React.FC<SalesCategory> = ({
    name,
    percent,
    color,
}) => (
    <div>
        <div className="flex justify-between text-sm mb-1 font-medium text-slate-600">
            <span>{name}</span> <span>{percent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
                className={`h-2.5 rounded-full ${color}`}
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    </div>
);