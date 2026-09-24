// components/pos/PosCart.tsx
"use client";

import React, { useMemo, useCallback, memo, JSX, useState, useRef, useEffect } from "react";
import {
    FaUser,
    FaTag,
    FaUtensils,
    FaPercent,
    FaPhone,
    FaMoneyBillWave
} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { Ticket, CartItem, Coupon } from "@/components/pos/types";
import { useCouponSearch } from "@/hooks/useCouponSearch";
import { useCustomerSearch } from "@/hooks/useCustomerSearch";

interface PosCartProps {
    ticket: Ticket;
    updateCart: (items: CartItem[]) => void;
    updateTicketDetails: (
        field: keyof Ticket,
        value: Ticket[keyof Ticket]
    ) => void;
    availableCoupons: Coupon[];
    onCheckout: () => void;
    isCheckingOut: boolean;
    onCloseMobile?: () => void;
}

const QUICK_DISCOUNTS = [5, 10, 15, 20, 25, 50];

function PosCart({
    ticket,
    updateCart,
    updateTicketDetails,
    availableCoupons,
    onCheckout,
    isCheckingOut,
    onCloseMobile,
}: PosCartProps): JSX.Element {

    // -------------------------------
    // 0. UI STATE & REFS (New)
    // -------------------------------
    const [activeField, setActiveField] = useState<'customer' | 'coupon' | null>(null);
    const customerRef = useRef<HTMLDivElement>(null);
    const couponRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // If clicking inside customer section, keep it active
            if (customerRef.current && customerRef.current.contains(target)) {
                setActiveField('customer');
                return;
            }

            // If clicking inside coupon section, keep it active
            if (couponRef.current && couponRef.current.contains(target)) {
                setActiveField('coupon');
                return;
            }

            // Otherwise, close all suggestions
            setActiveField(null);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // -------------------------------
    // 1. CALCULATIONS
    // -------------------------------
    const subtotal = useMemo(
        () => ticket.items.reduce((acc, i) => acc + i.price * i.qty, 0),
        [ticket.items]
    );

    const total = useMemo(
        () => Math.max(0, subtotal - ticket.discount),
        [subtotal, ticket.discount]
    );

    // -------------------------------
    // 2. COUPON LOGIC
    // -------------------------------
    const {
        couponInput,
        setCouponInput,
        suggestions,
        applyCoupon,
        clearCoupon,
    } = useCouponSearch({
        availableCoupons,
        subtotal,
        onApply: (coupon) => {
            const discount = Math.round(subtotal * (coupon.discountPercentage / 100));
            updateTicketDetails("discount", discount);
            updateTicketDetails("couponCode", coupon.code);
        },
        onClear: () => {
            updateTicketDetails("discount", 0);
            updateTicketDetails("couponCode", "");
        },
    });

    // Show suggestions only if: 
    // 1. There are suggestions
    // 2. Input doesn't match current code
    // 3. The field is ACTIVE (user clicked inside it)
    const showSuggestions =
        suggestions.length > 0 &&
        couponInput !== ticket.couponCode &&
        activeField === 'coupon';

    // -------------------------------
    // 3. CUSTOMER SEARCH LOGIC
    // -------------------------------
    const customerQuery = ticket.customer.length >= 2 ? ticket.customer : ticket.mobile;

    const { suggestions: customerSuggestions } = useCustomerSearch(customerQuery || "");

    // Show suggestions only if:
    // 1. There are suggestions
    // 2. Not an exact match
    // 3. The field is ACTIVE
    const showCustomerSuggestions =
        customerSuggestions.length > 0 &&
        !customerSuggestions.some(
            (c) => c.mobile === ticket.mobile && c.fullName === ticket.customer
        ) &&
        activeField === 'customer';

    // -------------------------------
    // 4. HANDLERS
    // -------------------------------
    const handleQtyChange = useCallback(
        (id: string, delta: number) => {
            const newItems = ticket.items
                .map((item) =>
                    item._id === id
                        ? { ...item, qty: Math.max(0, item.qty + delta) }
                        : item
                )
                .filter((item) => item.qty > 0);

            updateCart(newItems);
        },
        [ticket.items, updateCart]
    );

    const applyQuickDiscount = useCallback(
        (percentage: number) => {
            const label = `MANUAL ${percentage}%`;

            if (ticket.couponCode === label) {
                clearCoupon();
                return;
            }

            const discount = Math.round(subtotal * (percentage / 100));
            updateTicketDetails("discount", discount);
            updateTicketDetails("couponCode", label);
            setCouponInput("");
        },
        [subtotal, ticket.couponCode, updateTicketDetails, clearCoupon, setCouponInput]
    );

    // -------------------------------
    // 5. UI RENDER
    // -------------------------------
    return (
        <div className="flex flex-col h-full w-full bg-white font-sans">

            {/* --- HEADER --- */}
            <div className="p-2 border-b border-slate-200 bg-slate-50/80 shrink-0 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col">
                        <span className="font-extrabold text-slate-800 text-lg tracking-tight">
                            {ticket.label || "New Order"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {ticket.items.length} Items in cart
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onCloseMobile}
                            className="lg:hidden text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Customer Inputs */}
                <div className="space-y-1">

                    {/* CUSTOMER NAME / SEARCH INPUT */}
                    {/* Attached Ref to wrapper to detect clicks */}
                    <div className="relative" ref={customerRef}>
                        <FaUser className="absolute left-3 top-3 text-slate-400 text-xs" />
                        <input
                            type="text"
                            value={ticket.customer}
                            onFocus={() => setActiveField('customer')} // Activate on focus
                            onChange={(e) => updateTicketDetails("customer", e.target.value)}
                            placeholder="Customer Name or Mobile"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all shadow-sm"
                        />
                        {showCustomerSuggestions && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl
                                max-h-60 overflow-y-auto 
                                animate-in fade-in zoom-in-95 duration-100">
                                {customerSuggestions.map((c) => (
                                    <button
                                        key={c.mobile}
                                        onClick={() => {
                                            updateTicketDetails("customer", c.fullName);
                                            updateTicketDetails("mobile", c.mobile);
                                            setActiveField(null); // Close on selection
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-rose-50 transition-colors
                           border-b last:border-0 border-slate-50"
                                    >
                                        <div className="font-bold text-sm text-slate-700">
                                            {c.fullName}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {c.mobile}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* MOBILE NUMBER INPUT */}
                    <div className="relative">
                        <FaPhone className="absolute left-3 top-3 text-slate-400 text-xs" />
                        <input
                            type="tel"
                            value={ticket.mobile}
                            onFocus={() => setActiveField(null)} // Close suggestions if focusing mobile manually
                            onChange={(e) => updateTicketDetails("mobile", e.target.value)}
                            placeholder="Mobile Number"
                            maxLength={10}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* --- ITEMS SCROLL AREA --- */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
                {ticket.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                            <FaUtensils className="text-4xl text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">Cart is empty</p>
                        <p className="text-xs">Start adding items to the order</p>
                    </div>
                ) : (
                    ticket.items.map((item) => (
                        <div
                            key={item._id}
                            className="group flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:border-rose-200 transition-all"
                        >
                            <div className="flex-1 pr-2">
                                <div className="text-sm font-bold text-slate-700 leading-tight mb-1">
                                    {item.name}
                                </div>
                                <div className="text-xs text-slate-400 font-mono bg-slate-50 inline-block px-1.5 py-0.5 rounded">
                                    ₹{item.price}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => handleQtyChange(item._id, -1)}
                                        className="w-7 h-7 flex items-center justify-center rounded bg-white text-slate-600 shadow-sm hover:text-rose-600 active:scale-95 transition-all"
                                    >
                                        -
                                    </button>
                                    <span className="text-sm font-bold w-6 text-center text-slate-700">
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() => handleQtyChange(item._id, 1)}
                                        className="w-7 h-7 flex items-center justify-center rounded bg-rose-500 text-white shadow-sm shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-sm font-bold text-slate-800 w-14 text-right font-mono">
                                    ₹{item.price * item.qty}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- FOOTER --- */}
            <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-10">

                {/* Quick Discounts */}
                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-2">
                        <FaPercent className="text-[10px] text-rose-500" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Quick Discount
                        </p>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {QUICK_DISCOUNTS.map((pct) => {
                            const isActive = ticket.couponCode === `MANUAL ${pct}%`;
                            return (
                                <button
                                    key={pct}
                                    onClick={() => applyQuickDiscount(pct)}
                                    className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${isActive
                                        ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200 scale-105"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
                                        }`}
                                >
                                    {pct}%
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Coupon Input */}
                <div className="flex gap-2 mb-4">
                    {/* Attached Ref to wrapper */}
                    <div className="relative flex-1" ref={couponRef}>
                        <FaTag className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                        <input
                            type="text"
                            placeholder="COUPON CODE"
                            value={couponInput}
                            onFocus={() => setActiveField('coupon')} // Activate on focus
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-2 py-2 text-xs font-bold uppercase focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                        {/* Coupon Suggestions */}
                        {showSuggestions && (
                            <div className="absolute bottom-full mb-1 w-full bg-white border rounded-lg shadow-xl z-30 
                            max-h-40 overflow-y-auto 
                            animate-in fade-in zoom-in-95 duration-100">
                                {suggestions.map((c) => (
                                    <button
                                        key={c._id}
                                        onClick={() => {
                                            applyCoupon(c);
                                            setCouponInput(c.code);
                                            setActiveField(null); // Close on selection
                                        }}
                                        className="w-full px-3 py-2.5 text-left hover:bg-rose-50 flex justify-between items-center border-b last:border-0"
                                    >
                                        <span className="font-bold text-xs text-slate-700">{c.code}</span>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            {c.discountPercentage}% OFF
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => { /* Apply logic is handled by state/hook */ }}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
                    >
                        APPLY
                    </button>
                </div>

                {/* Payment Mode & Delivery Type Selection */}
                <div className="mb-4">
                    <div className="flex gap-3 divide-x divide-slate-300">
                        {/* Payment Mode */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-2">
                                <FaMoneyBillWave className="text-[9px] text-rose-500 flex-shrink-0" />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                    Payment
                                </p>
                            </div>
                            <div className="flex gap-2.5">
                                <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
                                    <input
                                        type="radio"
                                        name="paymentMode"
                                        value="CASH"
                                        checked={ticket.PaymentMode === "CASH"}
                                        onChange={(e) => updateTicketDetails("PaymentMode", e.target.value)}
                                        className="w-3.5 h-3.5 text-rose-600 flex-shrink-0"
                                    />
                                    <span className="text-[11px] font-bold text-slate-700 truncate">CASH</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
                                    <input
                                        type="radio"
                                        name="paymentMode"
                                        value="ONLINE"
                                        checked={ticket.PaymentMode === "ONLINE"}
                                        onChange={(e) => updateTicketDetails("PaymentMode", e.target.value)}
                                        className="w-3.5 h-3.5 text-rose-600 flex-shrink-0"
                                    />
                                    <span className="text-[11px] font-bold text-slate-700 truncate">ONLINE</span>
                                </label>
                            </div>
                        </div>

                        {/* Delivery Type */}
                        <div className="flex-1 min-w-0 pl-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <FaUtensils className="text-[9px] text-rose-500 flex-shrink-0" />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                    Delivery
                                </p>
                            </div>
                            <div className="flex gap-2.5">
                                <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
                                    <input
                                        type="radio"
                                        name={`deliveryType-${ticket._id}`}
                                        value="Dine in"
                                        checked={(ticket.deliveryType || "Dine in") === "Dine in"}
                                        onChange={(e) => updateTicketDetails("deliveryType", e.target.value)}
                                        className="w-3.5 h-3.5 text-rose-600 flex-shrink-0"
                                    />
                                    <span className="text-[11px] font-bold text-slate-700 truncate">Dine in</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
                                    <input
                                        type="radio"
                                        name={`deliveryType-${ticket._id}`}
                                        value="Parcel"
                                        checked={ticket.deliveryType === "Parcel"}
                                        onChange={(e) => updateTicketDetails("deliveryType", e.target.value)}
                                        className="w-3.5 h-3.5 text-rose-600 flex-shrink-0"
                                    />
                                    <span className="text-[11px] font-bold text-slate-700 truncate">Parcel</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 mb-4 text-sm border-t border-dashed border-slate-200 pt-3">
                    {ticket.discount > 0 && (
                        <>
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span className="font-mono text-slate-700">
                                    ₹{subtotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-emerald-600 bg-emerald-50 px-2 py-1 -mx-2 rounded">
                                <span className="text-xs font-bold flex items-center gap-1">
                                    DISCOUNT
                                    <span className="text-[10px] opacity-75">
                                        ({ticket.couponCode})
                                    </span>
                                </span>
                                <span className="font-mono font-bold">
                                    -₹{ticket.discount.toFixed(2)}
                                </span>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between items-end pt-2">
                        <span className="text-slate-600 font-bold text-lg">Total</span>
                        <span className="text-rose-500 font-extrabold text-xl font-mono leading-none">
                            ₹{total.toFixed(2)}
                        </span>
                    </div>
                </div>


                {/* Checkout Button */}
                <button
                    disabled={isCheckingOut}
                    onClick={onCheckout}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all transform active:scale-[0.98] ${isCheckingOut
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700 hover:shadow-rose-300"
                        }`}
                >
                    {isCheckingOut ? "PROCESSING..." : "CHECKOUT & PRINT"}
                </button>
            </div>
        </div>
    );
}

export default memo(PosCart);