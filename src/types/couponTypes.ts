// src/types/couponTypes.ts

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  startDate: string;
  expiryDate: string;
}

export interface CouponApiResponse {
  coupons: Coupon[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export type StatusFilter = "All" | "Active" | "Expired" | "Scheduled";