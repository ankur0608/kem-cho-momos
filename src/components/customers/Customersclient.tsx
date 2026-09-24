"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUserTag,
  FaChevronLeft,
  FaShoppingBag,
  FaDollarSign,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import PaginationControls from "@/components/PaginationControls";

const ITEMS_PER_PAGE = 10;

export interface CustomerProfile {
  userId: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  updatedAt: string;
  addresses: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    type: string;
  }[];
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
}

interface OrderSummary {
  _id: string;
  total: number;
  createdAt: string;
  status: string;
}

interface CustomerListResponse {
  profiles: CustomerProfile[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewCustomerBase, setViewCustomerBase] = useState<CustomerProfile | null>(null);
  const [viewCustomerAugmented, setViewCustomerAugmented] = useState<CustomerProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const getInitial = useCallback(
    (name: string) => (name ? name.charAt(0).toUpperCase() : "?"),
    []
  );

  const formatDate = useCallback((dateString: string, long = false) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: long ? "long" : "short",
      year: long ? "numeric" : "2-digit"
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-100';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const handleViewCustomer = useCallback((c: CustomerProfile) => {
    setViewCustomerBase(c);
    setViewCustomerAugmented(c);
    setRecentOrders([]);
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setCurrentPage(p);
  }, []);

  const handleViewAllOrders = useCallback(() => {
    if (viewCustomerAugmented?.userId) {
      router.push(`/orders?userId=${viewCustomerAugmented.userId}`);
    }
  }, [viewCustomerAugmented, router]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = `/api/customers?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);

      const data: CustomerListResponse = await res.json();

      setCustomers(data.profiles);
      setTotalCustomers(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Fetch customers failed:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchRecentOrders = useCallback(async (userId: string) => {
    setLoadingOrders(true);

    try {
      const apiUrl = `/api/orders?userId=${userId}&limit=1000&status=completed&sort=-createdAt`;

      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);

      const data: { orders: OrderSummary[] } = await res.json();

      setRecentOrders(data.orders);
    } catch (error) {
      console.error("Fetch recent orders failed:", error);
      setRecentOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (viewCustomerBase?.userId) {
      fetchRecentOrders(viewCustomerBase.userId);
    }
  }, [viewCustomerBase?.userId, fetchRecentOrders]); 


  useEffect(() => {
    if (viewCustomerBase) {
      if (recentOrders.length > 0) {
        const calculatedTotalSpend = recentOrders.reduce((sum, order) => sum + order.total, 0);

        const calculatedTotalOrders = recentOrders.length;

        const mostRecentOrder = recentOrders.reduce((latest, order) => {
          const latestDate = new Date(latest.createdAt);
          const orderDate = new Date(order.createdAt);
          return orderDate > latestDate ? order : latest;
        });

        const calculatedLastOrderDate = mostRecentOrder.createdAt;

        setViewCustomerAugmented({
          ...viewCustomerBase,
          totalSpend: calculatedTotalSpend,
          totalOrders: calculatedTotalOrders,
          lastOrderDate: calculatedLastOrderDate,
        });
      } else if (!loadingOrders) {
        setViewCustomerAugmented({
          ...viewCustomerBase,
          totalSpend: 0,
          totalOrders: 0,
          lastOrderDate: "",
        });
      }
    }
  }, [recentOrders, loadingOrders, viewCustomerBase]); 
  const displayCustomers = useMemo(() => customers, [customers]);

  if (loading && customers.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
          <span>Loading customers...</span>
        </div>
      </div>
    );
  }

  if (viewCustomerAugmented) {
    const viewCustomer = viewCustomerAugmented;
    const primary = viewCustomer.addresses?.[0] || null;
    const lastOrderDateDisplay = viewCustomer.lastOrderDate ? formatDate(viewCustomer.lastOrderDate, true) : "Never Ordered";

    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <button
          onClick={() => setViewCustomerBase(null)}
          className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium mb-8 p-2 -ml-2 transition-colors"
        >
          <FaChevronLeft className="text-sm" />
          Back to Customer List
        </button>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold shadow-md">
              {getInitial(viewCustomer.fullName)}
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-800">
                {viewCustomer.fullName}
              </h2>
              <div className="text-sm font-mono text-slate-500 mt-1">
                Customer ID: <span className="font-bold">{viewCustomer.userId}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-400">Profile Updated:</p>
            <p className="font-mono text-slate-600 text-sm">
              {formatDate(viewCustomer.updatedAt, true)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
              <FaShoppingBag />
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase font-bold">Total Orders</p>
              <p className="text-2xl font-extrabold text-slate-800">{viewCustomer.totalOrders}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
              <FaDollarSign />
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase font-bold">Total Spend</p>
              <p className="text-2xl font-extrabold text-slate-800">
                ₹{viewCustomer?.totalSpend?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase font-bold">Last Order</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">
                {lastOrderDateDisplay}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-600 font-medium mb-1">
              <FaPhone className="text-slate-400 text-xs" />
              {viewCustomer.phoneNumber || "N/A"}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <FaEnvelope className="text-slate-400 text-xs" />
              <span className="truncate">{viewCustomer.email || "N/A"}</span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-rose-500" /> Primary Address
            </h3>
            {primary ? (
              <div className="space-y-1 text-slate-600">
                <p className="font-semibold">{primary.name}</p>
                <p>{primary.address}</p>
                <p>
                  {primary.city}, {primary.state} -{" "}
                  <span className="font-mono">{primary.pincode}</span>
                </p>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded inline-block mt-2 font-mono">
                  Type: {primary.type}
                </span>
              </div>
            ) : (
              <p className="italic text-slate-400">No primary address saved.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaClipboardList className="text-rose-500" /> Recent Orders
            </h3>

            {loadingOrders ? (
              <div className="flex items-center justify-center h-24 text-slate-500">
                <span className="animate-spin mr-2">🔄</span> Fetching orders...
              </div>
            ) : recentOrders.length > 0 ? (
              <ul className="space-y-3">
                {recentOrders.slice(0, 3).map((order) => (
                  <li key={order._id} className="flex justify-between items-center text-sm text-slate-600 border-b border-gray-50 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Order #{order._id.slice(-5)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">₹{order.total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-slate-400 italic">
                No recent completed orders found.
              </div>
            )}

            <button
              onClick={handleViewAllOrders}
              className="w-full mt-4 py-2 bg-rose-50 text-rose-600 font-bold text-sm rounded-lg hover:bg-rose-100 transition-colors"
              disabled={!viewCustomer?.userId}
            >
              View All Orders ({viewCustomer?.totalOrders || 0})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Customers</h2>
          <p className="text-sm text-slate-500 mt-1">
            Showing {customers.length} of {totalCustomers} results.
          </p>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-slate-500 font-bold border-b border-gray-100 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-5">User Profile</th>
                <th className="p-5">Customer ID</th>
                <th className="p-5">Contact Info</th>
                <th className="p-5">Primary Address</th>
                <th className="p-5">Last Updated</th>
                <th className="p-5">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {displayCustomers.length > 0 ? (
                displayCustomers.map((c) => (
                  <tr
                    key={c.userId}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => handleViewCustomer(c)}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-base font-bold shadow-sm">
                          {getInitial(c.fullName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{c.fullName}</div>
                          <div className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">
                            DB ID: {c.userId.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-5 font-mono font-bold text-xs text-rose-600">
                      {c.userId}
                    </td>

                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <FaPhone className="text-slate-400 text-xs" />
                          {c.phoneNumber || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <FaEnvelope className="text-slate-400 text-xs" />
                          {c.email || "N/A"}
                        </div>
                      </div>
                    </td>

                    <td className="p-5 text-xs text-slate-500">
                      {c.addresses?.length ? (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-rose-500" />
                            {c.addresses[0].type || "Home"}
                          </div>
                          <p className="line-clamp-1">
                            {c.addresses[0].address}, {c.addresses[0].city}
                          </p>
                        </div>
                      ) : (
                        <span className="italic text-slate-400">No address saved</span>
                      )}
                    </td>

                    <td className="p-5 text-xs text-slate-400 font-medium">
                      {formatDate(c.updatedAt)}
                    </td>

                    <td className="p-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomer(c);
                        }}
                        className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {displayCustomers.length > 0 ? (
          displayCustomers.map((c) => (
            <div
              key={c.userId}
              onClick={() => handleViewCustomer(c)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold">
                    {getInitial(c.fullName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{c.fullName}</h3>
                    <div className="flex items-center gap-1 text-xs font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      <FaUserTag className="text-[10px]" />
                      <span className="truncate max-w-[100px]">{c.userId}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  {formatDate(c.updatedAt)}
                </div>
              </div>

              <hr className="border-gray-50" />

              {/* CONTACT */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
                    <FaPhone className="text-xs" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Phone</p>
                    <p className="text-sm font-medium text-slate-700">
                      {c.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-500 shadow-sm">
                    <FaEnvelope className="text-xs" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Email</p>
                    <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                      {c.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              {c.addresses?.length > 0 && (
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-xs uppercase">
                    <FaMapMarkerAlt />
                    <span>{c.addresses[0].type}</span>
                  </div>
                  <p className="text-sm text-slate-600">{c.addresses[0].address}</p>
                  <p className="text-sm text-slate-600 font-medium mt-1">
                    {c.addresses[0].city}, {c.addresses[0].state} - {c.addresses[0].pincode}
                  </p>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCustomer(c);
                }}
                className="w-full mt-2 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-gray-200">
            No customers found.
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="pt-4 flex justify-center">
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={totalCustomers}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}