import { useState, useMemo, useCallback } from "react";
import { Coupon } from "@/components/pos/types";

interface UseCouponSearchParams {
  availableCoupons: Coupon[];
  subtotal: number;
  onApply: (coupon: Coupon) => void;
  onClear: () => void;
}

export function useCouponSearch({
  availableCoupons,
  subtotal,
  onApply,
  onClear,
}: UseCouponSearchParams) {
  const [couponInput, setCouponInput] = useState("");

  const today = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  // 🔍 Suggestions
  const suggestions = useMemo(() => {
    const q = couponInput.toUpperCase().trim();
    if (!q) return [];

    return availableCoupons.filter(
      (c) =>
        c.isActive &&
        c.code.includes(q) &&
        c.startDate <= today &&
        c.expiryDate >= today
    );
  }, [couponInput, availableCoupons, today]);

  // ✅ Apply coupon
  const applyCoupon = useCallback(
    (coupon?: Coupon) => {
      const code = coupon?.code || couponInput.toUpperCase().trim();

      const found = availableCoupons.find(
        (c) =>
          c.code === code &&
          c.isActive &&
          c.startDate <= today &&
          c.expiryDate >= today
      );

      if (!found) {
        clearCoupon();
        alert("Invalid or expired coupon");
        return;
      }

      onApply(found);
      setCouponInput(found.code);
    },
    [couponInput, availableCoupons, onApply, today]
  );

  const clearCoupon = useCallback(() => {
    setCouponInput("");
    onClear();
  }, [onClear]);

  return {
    couponInput,
    setCouponInput,
    suggestions,
    applyCoupon,
    clearCoupon,
  };
}
