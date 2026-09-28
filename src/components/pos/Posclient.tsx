// app/pos/page.tsx or similar
"use client";
import toast from 'react-hot-toast';

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  JSX,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaCashRegister,
  FaPlus,
  FaArrowRightFromBracket,
  FaBurger,
  FaBacon,
  FaLayerGroup,
  FaMugHot,
  FaUtensils,
  FaSpinner,
  FaCartShopping,
  FaChevronDown,
} from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { MenuItem, Ticket, CartItem, Coupon } from "./types";
import PosCart from "@/components/pos/PosCart";
import { usePosData } from "@/hooks/usePosData";
import LoadingScreen from "./LoadingScreen";
import {
  MENU_CATEGORIES,
  getSortedMenuCategories,
  normalizeMenuCategory,
} from "@/constants/menuCategories";
const createInitialTickets = (): Ticket[] => [
  {
    _id: 1,
    label: "Order #1",
    items: [],
    PaymentMode: "ONLINE",
    customer: "",
    mobile: "",        // ← ADD THIS
    couponCode: "",
    discount: 0,
    deliveryType: "Dine in",
  },
];

export default function PosPage(): JSX.Element {
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [tickets, setTickets] = useState<Ticket[]>(createInitialTickets);
  const [activeTicketId, setActiveTicketId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"items" | "cart">("items");
  const { menuItems, coupons: availableCoupons, loading } = usePosData();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Listen for print completion from iframe
  useEffect(() => {
    const handlePrintMessage = (
      event: MessageEvent<{ printed?: boolean }>
    ) => {
      if (event.data && event.data.printed) {
        // Reset POS to a new empty ticket
        // setTickets(createInitialTickets());
        // setActiveTicketId(1);
      }
    };

    window.addEventListener("message", handlePrintMessage);
    return () => window.removeEventListener("message", handlePrintMessage);
  }, []);


  const currentTicket = useMemo(
    () =>
      tickets.find((t) => t._id === activeTicketId) ??
      tickets[0],
    [tickets, activeTicketId]
  );

  const currentTicketTotalQty = useMemo(
    () => currentTicket.items.reduce((acc, i) => acc + i.qty, 0),
    [currentTicket.items]
  );

  const currentTicketSubtotal = useMemo(
    () =>
      currentTicket.items.reduce(
        (acc, i) => acc + i.price * i.qty,
        0
      ),
    [currentTicket.items]
  );

  const currentTicketTotal = useMemo(
    () => Math.max(0, currentTicketSubtotal - currentTicket.discount),
    [currentTicketSubtotal, currentTicket.discount]
  );

  // app/pos/page.tsx (Updated useEffect)

  useEffect(() => {
    const sortedCats = getSortedMenuCategories([
      ...MENU_CATEGORIES,
      ...menuItems.map((item) => item.category),
    ]);

    setCategories(["All", ...sortedCats]);

    setActiveCategory("All");
  }, [menuItems]);

  const displayedItems = useMemo(() => {
    const items = menuItems;

    if (searchQuery) {
      const lowered = searchQuery.toLowerCase();
      return items.filter(
        (i) =>
          i.name.toLowerCase().includes(lowered) ||
          (i.code && i.code.toLowerCase().includes(lowered))
      );
    }

    if (activeCategory === "All") {
      return items;
    }

    return items.filter(
      (i) => normalizeMenuCategory(i.category) === activeCategory
    );
  }, [activeCategory, searchQuery, menuItems]);

  const getIcon = useCallback((cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("burger") || c.includes("vadapav"))
      return <FaBurger className="text-orange-500" />;
    if (c.includes("fries"))
      return <FaBacon className="text-yellow-500" />;
    if (c.includes("sandwich"))
      return <FaLayerGroup className="text-green-500" />;
    if (c.includes("coffee") || c.includes("tea"))
      return <FaMugHot className="text-amber-800" />;

    return <FaUtensils className="text-slate-400" />;
  }, []);

  const addTicket = useCallback(() => {
    setTickets((prev) => {
      const newId =
        prev.length > 0
          ? Math.max(...prev.map((t) => t._id)) + 1
          : 1;

      const newTicket: Ticket = {
        _id: newId,
        label: `Order #${newId}`,
        items: [],
        customer: "",
        couponCode: "",
        PaymentMode: "ONLINE",
        discount: 0,
        mobile: "",
        deliveryType: "Dine in",
      };

      const nextTickets = [...prev, newTicket];
      setActiveTicketId(newId);
      return nextTickets;
    });
  }, []);

  const removeTicket = useCallback(
    (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setTickets((prev) => {
        if (prev.length === 1) {
          alert("Cannot delete the last ticket");
          return prev;
        }

        const updated = prev.filter((t) => t._id !== id);
        if (activeTicketId === id && updated.length > 0) {
          setActiveTicketId(updated[0]._id);
        }
        return updated;
      });
    },
    [activeTicketId]
  );

  const addToCart = useCallback(
    (item: MenuItem) => {
      const isAvailable =
        item.isAvailable !== undefined
          ? item.isAvailable
          : item.stock !== undefined
            ? item.stock
            : true;

      if (!isAvailable) return;

      setTickets((prev) =>
        prev.map((t) => {
          if (t._id === activeTicketId) {
            const existing = t.items.find(
              (i) => i._id === item._id
            );
            if (existing) {
              return {
                ...t,
                items: t.items.map((i) =>
                  i._id === item._id
                    ? { ...i, qty: i.qty + 1 }
                    : i
                ),
              };
            }
            return {
              ...t,
              items: [
                ...t.items,
                { ...item, qty: 1, id: item._id },
              ],
            };
          }
          return t;
        })
      );
    },
    [activeTicketId]
  );

  const updateCart = useCallback(
    (newItems: CartItem[]) => {
      setTickets((prev) =>
        prev.map((t) =>
          t._id === activeTicketId ? { ...t, items: newItems } : t
        )
      );
    },
    [activeTicketId]
  );

  const updateTicketDetails = useCallback(
    (field: keyof Ticket, value: Ticket[keyof Ticket]) => {
      setTickets((prev) =>
        prev.map((t) =>
          t._id === activeTicketId ? { ...t, [field]: value } : t
        )
      );
    },
    [activeTicketId]
  );

  // const handleCheckout = useCallback(async () => {
  //   if (currentTicket.items.length === 0) {
  //     alert("Cart is empty!");
  //     return;
  //   }
  //   // extra guard
  //   if (isCheckingOut) return;

  //   setIsCheckingOut(true);
  //   try {
  //     const orderPayload = {
  //       cart: currentTicket.items.map((i) => ({
  //         name: i.name,
  //         price: i.price,
  //         quantity: i.qty,
  //         _id: i._id,
  //         category: i.category,     // ← IMPORTANT
  //         imageUrl: i.imageUrl,
  //         code: i.code || "",
  //       })),
  //       subtotal: currentTicketSubtotal,
  //       discount: currentTicket.discount,
  //       couponCode: currentTicket.couponCode,
  //       total: currentTicketTotal,
  //       mobile: currentTicket.mobile,
  //       user: {
  //         fullName: currentTicket.customer || "Walk-in",
  //         mobile: currentTicket.mobile || "",
  //       },

  //       status: "completed",
  //       paymentMethod: "cash",
  //     };
  //     console.log("Order Payload:", orderPayload);

  //     const res = await fetch("/api/orders", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(orderPayload),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       console.error(data);
  //       alert("Order save failed");
  //       return;
  //     }

  //     // ---- INVISIBLE IFRAME PRINTING ----
  //     const iframe = document.createElement("iframe");
  //     iframe.style.position = "absolute";
  //     iframe.style.width = "0";
  //     iframe.style.height = "0";
  //     iframe.style.opacity = "0";
  //     iframe.style.pointerEvents = "none";
  //     iframe.src = `/pos/print/${data.order._id}?iframe=true`;
  //     document.body.appendChild(iframe);
  //   } catch (error) {
  //     console.error("Checkout error:", error);
  //     alert("Something went wrong!");
  //   } finally {
  //     setIsCheckingOut(false);
  //   }
  // }, [
  //   currentTicket.items,
  //   currentTicketSubtotal,
  //   currentTicket.discount,
  //   currentTicketTotal,
  //   currentTicket.customer,
  //   currentTicket.mobile,
  //   isCheckingOut
  // ]);
  const handleCheckout = useCallback(async () => {
    if (currentTicket.items.length === 0) {
      toast.error("Your cart is empty. Please add items to continue.");
      return;
    }

    if (isCheckingOut) return;

    if (!currentTicket.PaymentMode) {
      toast.error("Please select a payment mode before checkout.");
      return;
    }
    setIsCheckingOut(true); // Disable button

    try {
      // 2. Prepare Payload
      const orderPayload = {
        cart: currentTicket.items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.qty,
          _id: i._id,
          category: i.category,
          imageUrl: i.imageUrl,
          code: i.code || "",
        })),
        subtotal: currentTicketSubtotal,
        discount: currentTicket.discount,
        couponCode: currentTicket.couponCode,
        total: currentTicketTotal,
        mobile: currentTicket.mobile,
        orderType: currentTicket.deliveryType || "Dine in",
        user: {
          fullName: currentTicket.customer || "Walk-in",
          mobile: currentTicket.mobile || "",
        },
        paymentMethod: currentTicket.PaymentMode, // e.g., "CASH" or "ONLINE"
        status: "completed",

      };

      console.log("Order Payload:", orderPayload);

      // 3. API Call to Create Order
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      // Handle API failure
      if (!res.ok) {
        console.error(data);
        throw new Error(data.message || "Order save failed");
      }

      // 4. Successful Checkout - Reset POS State (Crucial Step!)
      setTickets((prev) => {
        // Filter out the ticket that was just checked out
        const updatedTickets = prev.filter((t) => t._id !== activeTicketId);

        if (updatedTickets.length === 0) {
          // If no tickets are left, create the initial one
          const newInitial = createInitialTickets();
          setActiveTicketId(newInitial[0]._id);
          return newInitial;
        } else {
          // Switch to the next available ticket (the first one)
          setActiveTicketId(updatedTickets[0]._id);
          return updatedTickets;
        }
      });


      // Show Success Toast
      const orderId = data.order._id ? data.order._id.slice(-6).toUpperCase() : 'placed';
      toast.success(`Order #${orderId} placed successfully!`);
      
      // Redirect back to items view on mobile
      setMobileView("items");

    } catch (error) {
      // 6. Handle Error
      console.error("Checkout error:", error);
      toast.error(`Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      // 7. Re-enable button
      setIsCheckingOut(false);
    }
  }, [
    currentTicket.items,
    currentTicketSubtotal,
    currentTicket.discount,
    currentTicketTotal,
    currentTicket.customer,
    currentTicket.mobile,
    currentTicket.PaymentMode, // <-- Added dependency
    isCheckingOut,
    activeTicketId, // Added dependency
  ]);
  const handleSetMobileItems = useCallback(
    () => setMobileView("items"),
    []
  );

  const handleSetMobileCart = useCallback(
    () => setMobileView("cart"),
    []
  );

  if (loading)
    return (
      <LoadingScreen />
    );

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
      {/* HEADER (BORDERLESS) */}
      <div className="bg-white h-16 flex items-center px-3 sm:px-4 shadow-sm z-20 justify-between shrink-0">
        <div className="flex items-center w-24 sm:w-64">
          <div className="bg-rose-600 text-white w-8 h-8 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-md">
            <FaCashRegister className="text-sm" />
          </div>
          <h2 className="font-bold text-slate-800 text-lg sm:text-xl">
            POS
          </h2>
        </div>

        {/* TABS */}
        <div className="flex-1 hidden sm:flex justify-center overflow-x-auto no-scrollbar px-4">
          {tickets.map((t) => (
            <div
              key={t._id}
              onClick={() => setActiveTicketId(t._id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all mr-2 cursor-pointer select-none ${t._id === activeTicketId
                ? "bg-slate-800 text-white shadow"
                : "bg-gray-50 text-slate-500 hover:bg-white hover:text-rose-600"
                }`}
            >
              <span>{t.label}</span>
              <span className="ml-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md">
                {t.items.reduce(
                  (acc, i) => acc + i.qty,
                  0
                )}
              </span>

              {tickets.length > 1 && (
                <button
                  onClick={(e) => removeTicket(t._id, e)}
                  className="ml-3 text-[10px] opacity-60 hover:opacity-100 hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex lg:hidden gap-2">
            <button
              onClick={handleSetMobileItems}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${mobileView === "items"
                ? "bg-slate-800 text-white"
                : "bg-gray-100 text-slate-600"
                }`}
            >
              <FaUtensils />
            </button>

            <button
              onClick={handleSetMobileCart}
              className={`w-10 h-10 rounded-full flex items-center justify-center relative ${mobileView === "cart"
                ? "bg-slate-800 text-white"
                : "bg-gray-100 text-slate-600"
                }`}
            >
              <FaCartShopping />
              {currentTicketTotalQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 rounded-full border border-white">
                  {currentTicketTotalQty}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={addTicket}
            className="hidden sm:flex w-9 h-9 rounded-full bg-gray-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 justify-center items-center"
          >
            <FaPlus />
          </button>

          <Link
            href="/"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 flex items-center shadow-md"
          >
            <FaArrowRightFromBracket className="mr-2" /> Exit
          </Link>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3 relative">
        {/* LEFT CATEGORY SIDEBAR — NO BORDER */}
        <div className="hidden lg:flex w-48 bg-white rounded-xl flex-col shadow-sm">
          <div className="p-3 bg-gray-50 text-xs text-slate-400 font-bold uppercase text-center">
            Categories
          </div>

          <div className="overflow-y-auto p-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold mb-1 ${activeCategory === cat
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ITEMS PANEL — NO BORDER */}
        <div
          className={`flex-1 bg-white rounded-xl flex flex-col shadow-sm ${mobileView === "cart" ? "hidden lg:flex" : "flex"
            }`}
        >
          <div className="p-3 flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex items-center w-full sm:w-auto">
              <div className="lg:hidden grid grid-cols-3 gap-2 w-full pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setSearchQuery("");
                    }}
                    className={`truncate px-2 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-colors ${
                      activeCategory === cat
                        ? "bg-slate-800 text-white shadow"
                        : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <h3 className="hidden lg:block font-bold text-lg text-slate-800 pl-2">
                {searchQuery
                  ? `Search: "${searchQuery}"`
                  : activeCategory}
              </h3>
            </div>

            <div className="relative w-full sm:w-56 mt-2 sm:mt-0">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search item..."
                className="bg-gray-50 rounded-lg pl-8 pr-3 py-2 text-sm w-full"
              />
            </div>
          </div>

          <div className="flex-1 p-2 sm:p-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 overflow-y-auto pb-24 lg:pb-4">
            {displayedItems.length === 0 ? (
              <div className="col-span-full flex flex-col items-center text-slate-400">
                <FaUtensils className="text-4xl opacity-30 mb-2" />
                No items found
              </div>
            ) : (
              displayedItems.map((item) => {
                const isAvailable =
                  item.stock !== undefined
                    ? item.stock
                    : item.isAvailable !== undefined
                      ? item.isAvailable
                      : true;

                return (
                  <button
                    key={item._id}
                    onClick={() => addToCart(item)}
                    disabled={!isAvailable}
                    className={`group bg-white rounded-xl p-2 sm:p-3 hover:shadow-lg transition-all h-48 sm:h-56 flex flex-col justify-between relative ${!isAvailable
                      ? "opacity-60 grayscale cursor-not-allowed"
                      : ""
                      }`}
                  >
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-20">
                        <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    <div className="relative w-full h-24 sm:h-32 bg-gray-50 rounded overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-all"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-80">
                          {getIcon(item.category)}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 text-[11px] sm:text-sm leading-tight line-clamp-2 block mt-2">
                        {item.name}
                      </span>

                      <div className="flex justify-between items-center mt-1">
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
                          ₹{item.price}
                        </span>
                        {item.code && (
                          <span className="text-[10px] text-gray-400">
                            #{item.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Floating Button */}
          <div
            className={`lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white shadow-xl transition-all ${currentTicketTotalQty > 0 &&
              mobileView === "items"
              ? "translate-y-0"
              : "translate-y-full"
              }`}
          >
            <button
              onClick={handleSetMobileCart}
              className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg flex justify-between px-6"
            >
              <span>VIEW CART ({currentTicketTotalQty})</span>
              <span>₹{currentTicketTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>

        {/* CART PANEL (NO BORDER) */}
        <div
          className={`bg-white rounded-xl shadow-xl flex flex-col ${mobileView === "cart"
            ? "fixed inset-0 w-full rounded-none sm:rounded-xl sm:relative sm:w-96"
            : "hidden lg:flex lg:w-96"
            }`}
        >
          <PosCart
            ticket={currentTicket}
            updateCart={updateCart}
            updateTicketDetails={updateTicketDetails}
            availableCoupons={availableCoupons}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
            onCloseMobile={handleSetMobileItems}
          />
        </div>
      </div>
    </div>
  );
}
