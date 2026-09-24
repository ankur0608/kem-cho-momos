// src/hooks/useCouponManagerApi.ts
import { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
import { Coupon, StatusFilter } from "@/components/coupons/couponsclientpage";

interface CouponApiResponse {
  coupons: Coupon[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 10;

interface UseCouponManagerApiResult {
  coupons: Coupon[];
  isLoading: boolean;
  totalCoupons: number;
  apiTotalPages: number;
  currentPage: number;
  filter: StatusFilter;
  isDeleting: string | null;
  setCurrentPage: (page: number) => void;
  setFilter: (filter: StatusFilter) => void;
  loadCoupons: () => Promise<void>;
  executeDelete: (id: string, code: string) => Promise<void>;
  handleSaveSuccess: (isEditMode: boolean) => void;
}

export const useCouponManagerApi = (): UseCouponManagerApiResult => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [filter, setFilter] = useState<StatusFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const loadCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = `/api/coupons?page=${currentPage}&limit=${ITEMS_PER_PAGE}&filter=${filter}`;

      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to fetch coupons: ${response.statusText}`);
      }
      const data: CouponApiResponse = await response.json();

      setCoupons(data.coupons);
      setTotalCoupons(data.total);
      setApiTotalPages(data.totalPages);

      if (currentPage !== data.currentPage) {
        setCurrentPage(data.currentPage);
      }

      if (currentPage > data.totalPages && data.totalPages > 0) {
        setCurrentPage(data.totalPages);
      }
    } catch (error) {
      console.error("Error loading coupons:", error);
      toast.error("Failed to load coupons.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    if (currentPage !== 1 && totalCoupons === 0) {
      loadCoupons();
    } else {
      loadCoupons();
    }
  }, [loadCoupons]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {

    }
  }, [filter]);

  const handleSaveSuccess = useCallback((isEditMode: boolean) => {
    if (!isEditMode) {
      setCurrentPage(1);
    }
    loadCoupons();
  }, [loadCoupons]);

  const executeDelete = useCallback(async (id: string, code: string) => {
    setIsDeleting(id);
    const loadingToast = toast.loading(`Deleting coupon ${code}...`);

    try {
      const endpoint = `/api/coupons?id=${id}`;
      const response = await fetch(endpoint, { method: "DELETE" });

      toast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error("Failed to delete coupon.");
      }

      toast.success(`Coupon ${code} deleted successfully.`);

      await loadCoupons();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("API Delete Error:", error);
      toast.error("Failed to delete coupon. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  }, [loadCoupons]);

  return {
    coupons,
    isLoading,
    totalCoupons,
    apiTotalPages,
    currentPage,
    filter,
    isDeleting,
    setCurrentPage,
    setFilter,
    loadCoupons,
    executeDelete,
    handleSaveSuccess,
  };
};