export interface Coupon {
    _id: string; 
    code: string;
    discountPercentage: number;
    startDate: string;
    expiryDate: string;
    // THIS FIELD WAS THE CAUSE OF THE ERROR
    isActive: boolean; 
}