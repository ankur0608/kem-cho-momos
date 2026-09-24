// SalesTable.tsx
import React, { useMemo } from 'react';
import { ShoppingBag, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { SalesItem, getItemIcon, getTrendData } from '@/hooks/useSalesReport';

interface SalesTableRowProps {
    item: SalesItem;
    index: number;
    startIndex: number;
}

const SalesTableRow: React.FC<SalesTableRowProps> = ({ item, index, startIndex }) => {
    const { Icon, bg, text, category } = getItemIcon(item.name);

    const trendData = getTrendData(item.totalQuantitySold, item.previousQuantitySold);
    const TrendIcon = trendData.icon;
    const trendText = trendData.text;

    return (
        <tr className="hover:bg-rose-50/30 transition-colors group cursor-pointer">
            <td className="px-4 sm:px-6 py-4 text-gray-400 font-mono text-xs sm:text-sm">
                {(startIndex + index + 1).toString().padStart(2, '0')}
            </td>
            <td className="px-4 sm:px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex-shrink-0 flex items-center justify-center ${text} shadow-sm border ${bg}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">ID: #{item.name.slice(0, 2).toUpperCase()}-{Math.floor(Math.random() * 900 + 100)}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 sm:px-6 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${bg} ${text} border ${bg.replace('100', '200')}`}>{category}</span>
            </td>
            <td className="px-4 sm:px-6 py-4 text-right font-semibold text-gray-600">₹{item.price}</td>
            <td className="px-4 sm:px-6 py-4 text-center">
                <span className="font-bold text-gray-900 bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg">{item.totalQuantitySold}</span>
            </td>
            <td className="px-4 sm:px-6 py-4 text-right font-bold text-gray-900">₹{item.totalRevenue.toLocaleString('en-IN')}</td>
            <td className="px-4 sm:px-6 py-4 text-center">
                <div className={`inline-flex items-center gap-1 ${trendData.color} px-2 py-1 rounded-full text-xs font-bold border`}>
                    <TrendIcon className="w-3 h-3" /> {trendText}
                </div>
            </td>
        </tr>
    );
};

interface SalesTableProps {
    currentData: SalesItem[];
    totalRevenue: number;
    startIndex: number;
}

const customScrollbarStyle = {}; // Keep CSS empty as requested

export const SalesTable: React.FC<SalesTableProps> = ({ currentData, totalRevenue, startIndex }) => {
    return (
        <div className="w-full min-w-0 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col relative">
            <div className="absolute right-0 top-10 bottom-0 w-6 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-10 sm:hidden"></div>
            <div className="overflow-auto custom-scrollbar flex-1 relative" style={customScrollbarStyle}>
                <table className="w-full min-w-max text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-gray-900/5">
                        <tr className="bg-gray-50/90 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                            <th className="px-4 sm:px-6 py-4 w-12 sm:w-16">#</th>
                            <th className="px-4 sm:px-6 py-4">Product Details</th>
                            <th className="px-4 sm:px-6 py-4">Category</th>
                            <th className="px-4 sm:px-6 py-4 text-right">Price</th>
                            <th className="px-4 sm:px-6 py-4 text-center">Sold</th>
                            <th className="px-4 sm:px-6 py-4 text-right">Revenue</th>
                            <th className="px-4 sm:px-6 py-4 text-center">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {currentData.length > 0 ? (
                            currentData.map((item, index) => (
                                <SalesTableRow
                                    key={item.name}
                                    item={item}
                                    index={index}
                                    startIndex={startIndex}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500 text-lg bg-gray-50">
                                    <ShoppingBag className="w-10 h-10 mx-auto mb-2" />
                                    <p className="font-semibold">No sales data available for the current filter.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100/80 text-gray-900 font-extrabold border-t-2 border-rose-500">
                            <td colSpan={5} className="px-4 sm:px-6 py-4 text-right text-base">Total Revenue:</td>
                            <td className="px-4 sm:px-6 py-4 text-lg">
                                ₹{totalRevenue.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 sm:px-6 py-4"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};