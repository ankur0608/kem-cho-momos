import { useQuery } from "@tanstack/react-query";
import { MenuItem, Coupon } from "@/components/pos/types";

export function usePosData() {
  const menuQuery = useQuery<MenuItem[]>({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch("/api/menu?page=1&limit=200");
      const json = await res.json();
      return (Array.isArray(json) ? json : json.items || []).map((item: MenuItem) => ({
        ...item,
        category: item.category || "Uncategorised",
        }));
    },
    staleTime: 1000 * 60 * 5,
  });

  const couponQuery = useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      const res = await fetch("/api/coupons?filter=active&page=1&limit=200");
      const json = await res.json();
      return Array.isArray(json) ? json : json.coupons || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    menuItems: menuQuery.data || [],
    coupons: couponQuery.data || [],
    loading: menuQuery.isLoading || couponQuery.isLoading,
    error: menuQuery.error || couponQuery.error,
  };
}
