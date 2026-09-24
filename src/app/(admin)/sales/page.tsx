"use client";

import React from "react";
import { Loader2, Crown, Download, Search, ChevronDown, Calendar } from "lucide-react";
import { useSalesReport, ViewFilter } from "@/hooks/useSalesReport";
import { SalesTable } from "@/components/sales/SalesTable";

// --- The Main Component ---
export default function SalesReportPage() {
    const {
        isLoading,
        currentTime,
        currentDate,
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        viewFilter,
        setViewFilter,
        uniqueCategories,
        currentData,
        totalRevenue,
        totalResults,
        totalAll,
        totalPages,
        startIndex,
        endIndex,
        handleNextPage,
        handlePreviousPage,
        exportToCSV,
        currentPage,
    } = useSalesReport();

    // --- LOADING STATE RENDER ---
    if (isLoading) {
        return (
            <div className="p-4 md:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="flex justify-center items-center py-10 bg-white rounded-xl shadow-lg w-full max-w-lg">
                    <Loader2 className="animate-spin h-8 w-8 text-rose-600 mr-3" />
                    <span className="text-gray-700 text-lg font-medium">Fetching sales report...</span>
                </div>
            </div>
        );
    }

    // --- MAIN REPORT RENDER ---
    return (
        <div className="bg-slate-50 text-slate-800 flex flex-col p-2 min-w-0 w-full overflow-hidden">

            <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden min-w-0">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-6 sm:mb-8">
                    <div className="flex-1">
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-rose-500 text-white p-2 rounded-lg shadow-sm shadow-rose-200">
                                    <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <span className="font-bold text-xl tracking-tight text-gray-900">Kem Cho <span className="text-rose-500">Momos</span></span>
                            </div>
                            <div className="sm:hidden text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                                <span className="text-rose-600 tabular-nums">{currentTime}</span>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-3">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Product Sales Report</h1>
                            <p className="text-gray-500 text-sm mt-1 leading-relaxed">Performance analytics and trends across all categories.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                        <div className="hidden sm:flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm text-sm font-medium text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-rose-500" />
                                <span>{currentDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-px h-4 bg-gray-300"></span>
                                <span className="text-rose-600 tabular-nums">{currentTime}</span>
                            </div>
                        </div>

                        <button
                            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3.5 sm:py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-rose-200 active:scale-95 w-full sm:w-auto touch-manipulation"
                            onClick={exportToCSV}
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>

                {/* Controls Section (FILTERS) */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4 sm:mb-6 top-2 z-20 sm:static">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">

                        {/* Search Bar */}
                        <div className="relative w-full md:w-3/5 lg:w-2/5">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder-gray-400 text-gray-700"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3 w-full md:w-auto">
                            {/* Category Filter */}
                            <div className="relative flex-1">
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 sm:py-2.5 pl-4 pr-8 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 cursor-pointer appearance-none text-center sm:text-left"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option>All Categories</option>
                                    {/* These are now fixed categories from the menu */}
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none hidden sm:block" />
                            </div>

                            {/* View Filter (UPDATED: Today & All) */}
                            <div className="relative flex-1">
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 sm:py-2.5 pl-4 pr-8 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 cursor-pointer appearance-none text-center sm:text-left"
                                    value={viewFilter}
                                    onChange={(e) => setViewFilter(e.target.value as ViewFilter)}
                                >
                                    <option value="today">View: Today</option>
                                    <option value="all">View: All Time</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none hidden sm:block" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table Container */}
                <SalesTable
                    currentData={currentData}
                    totalRevenue={totalRevenue}
                    startIndex={startIndex}
                />

                {/* PAGINATION CONTROLS */}
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0 rounded-b-2xl shadow-inner mt-[-1px] z-10">
                    <p className="text-sm text-gray-600 font-medium text-center sm:text-left">
                        Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> - <span className="font-bold text-gray-900">{Math.min(endIndex, totalResults)}</span> of <span className="font-bold text-gray-900">{totalResults}</span> products
                        {totalResults !== totalAll && <span className="text-gray-500 ml-1">(Filtered from {totalAll})</span>}
                    </p>
                    <div className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto">
                        <button
                            className="px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-white hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm font-semibold text-sm flex-1 sm:flex-none"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <button
                            className="px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-white hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm font-semibold text-sm flex-1 sm:flex-none"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400 font-medium pb-4 sm:pb-0">
                    &copy; 2025 Kem Cho Momos Admin Panel. All rights reserved.
                </div>
            </main>
        </div>
    );
}