export interface FinancialLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRate?: number;
  subtotal?: number;
  taxTotal?: number;
  total?: number;
}

export interface TotalsBreakdown {
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  taxTotal: number;
  grandTotal: number;
  formattedSubtotal: string;
  formattedDiscountTotal: string;
  formattedTaxTotal: string;
  formattedGrandTotal: string;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'TAX_EXCLUSIVE' | 'TAX_INCLUSIVE';
  value: number;
}
