"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaIndianRupeeSign,
  FaBagShopping,
  FaChartSimple,
  FaBell,
  FaClockRotateLeft,
  FaMoneyBillWave,
  FaCreditCard,

} from "react-icons/fa6";
import { useRouter } from "next/navigation";

import { getStatusBadge } from '@/components/Dashboard/status';
import { useIsMobile } from '@/components/Dashboard/useIsMobile';
import { useDashboardData } from '@/components/Dashboard/useDashboardData';
import { MobileStatCard, DesktopStatCard } from '@/components/Dashboard/StatCards';
import { SalesCategoryItem } from '@/components/Dashboard/SalesCategoryItem';
import { PopularItemRow } from '@/components/Dashboard/PopularItemRow';
import { FaCalendarAlt } from "react-icons/fa";

type PaymentFilter = "All" | "Cash" | "Online";

export default function Dashboard() {
  const [time, setTime] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("Today");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("All");


  const isMobile = useIsMobile();
  const CardComponent = DesktopStatCard;
  const navigate = useRouter();

  const { dashboardData, loading, recentOrdersToShow } = useDashboardData(timeFilter, paymentFilter);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);
    setTime(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    return () => clearInterval(interval);
  }, []);

  const currentStats =
    timeFilter === "Today" ? dashboardData.stats.Today : dashboardData.stats.All;

  const handleViewSwitch = (view: string) => {
    if (view === "Order History") {
      navigate.push("/history");
    } else {
      alert(`Navigating to ${view} view (Simulated)`);
    }
  };
  const handleViewSwitchAndRedirect = (view: string) => {
    navigate.push("/sales");
  };
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] w-full animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-100"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-transparent border-t-rose-600 border-r-rose-600"></div>
        </div>
        <p className="mt-6 text-slate-500 font-medium tracking-wide animate-pulse">Loading Dashboard Metrics...</p>
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in max-w-full h-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                Dashboard
              </h2>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <span className="bg-rose-50 text-rose-600 font-mono text-xs font-bold px-3 py-1.5 border-r border-gray-200 flex items-center gap-1.5 shrink-0">
                  <FaCalendarAlt className="text-rose-400" />
                  {time || "..."}
                </span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer px-3 py-1.5"
                >
                  <option value="Today">Today</option>
                  <option value="All">All Time</option>
                </select>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Overview of your store's performance.
            </p>
          </div>

          <div className="flex w-full md:w-auto p-1 bg-gray-100 rounded-xl">
            {(["All", "Cash", "Online"] as PaymentFilter[]).map((pFilter) => (
              <button
                key={pFilter}
                onClick={() => setPaymentFilter(pFilter)}
                className={`
                  flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200
                  ${paymentFilter === pFilter
                    ? "bg-white text-rose-600 shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-700 hover:bg-gray-200/50"
                  }
                `}
              >
                {pFilter === "Cash" && <FaMoneyBillWave className="text-emerald-500" />}
                {pFilter === "Online" && <FaCreditCard className="text-blue-500" />}
                {pFilter === "All" && <FaBagShopping className="text-rose-500" />}
                {pFilter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        <CardComponent
          icon={FaIndianRupeeSign}
          color="blue"
          value={`₹ ${currentStats.revenue.toLocaleString()}`}
          label="Revenue"
          // percentage="12%"
        />
        <CardComponent
          icon={FaBagShopping}
          color="orange"
          value={currentStats.orders}
          label="Orders"
        />
        <CardComponent
          icon={FaChartSimple}
          color="purple"
          value={currentStats.dineIn}
          label="Dine In"
        />
        <CardComponent
          icon={FaBell}
          color="orange"
          value={currentStats.parcel}
          label="Parcel"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        <div className="order-2 xl:order-1 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:col-span-1">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center justify-between">
            <span>Popular Items</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">{timeFilter === 'Today' ? 'Today' : 'All Time'} | {paymentFilter}</span>
          </h3>
          <div className="flex-1 space-y-4">
            {dashboardData.popularItems.length > 0 ? (
              dashboardData.popularItems.map((item, index) => (
                <PopularItemRow key={index} {...item} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                   <FaBagShopping className="text-xl text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">No popular items</p>
                <p className="text-slate-400 text-xs mt-1">No completed orders found.</p>
              </div>
            )}
          </div>
          <button
            onClick={() => handleViewSwitchAndRedirect("Menu")}
            className="w-full mt-4 py-3 bg-gray-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
          >
            View All Items
          </button>
        </div>

        <div className="order-1 w-full xl:order-2 xl:col-span-2 bg-white p-5 sm:p-2 md:p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 w-full">
            <h3 className="font-bold text-lg text-slate-800">
              Sales by Category
            </h3>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              {timeFilter === "Today" ? "Today" : "All Time"} | {paymentFilter}
            </span>
          </div>

          <div className="space-y-4 w-full">
            {dashboardData.salesByCategory.length > 0 ? (
              dashboardData.salesByCategory.map((category) => (
                <SalesCategoryItem
                  key={category.name}
                  name={category.name}
                  percent={category.percent}
                  color={category.color}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                   <FaChartSimple className="text-2xl text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">No sales data available</p>
                <p className="text-slate-400 text-xs mt-1">Complete some orders to see categories here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
        <div className="p-5 sm:p-6 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
            <span className="hidden sm:inline-flex text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">{timeFilter === 'Today' ? 'Today' : 'All Time'} | {paymentFilter}</span>
          </div>
          <button
            onClick={() => handleViewSwitch("Order History")}
            className="text-rose-600 text-sm font-bold hover:underline flex items-center gap-1"
          >
            <FaClockRotateLeft className="text-xs" /> View All History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 hidden sm:table-cell">ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4 hidden md:table-cell">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrdersToShow.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 font-mono font-bold text-slate-600 text-xs hidden sm:table-cell">
                    #{order._id.slice(-5)} 
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {order.user?.fullName || "Walk-in"}
                  </td>
                  <td className="p-4 font-bold text-slate-700">
                    ₹{order.total}
                  </td>
                  <td className="p-4 text-slate-500 text-xs hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded font-bold uppercase text-[10px] ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrdersToShow.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                         <FaClockRotateLeft className="text-xl text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium text-sm">No recent activity</p>
                      <p className="text-slate-400 text-xs mt-1">Orders will appear here as they come in.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}