import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface CalculatedItem {
  description: string;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  discount: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  total: Prisma.Decimal;
}

export interface CalculatedEstimateTotals {
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}

@Injectable()
export class PricingCalculatorService {
  /**
   * Helper: Converts number, string, or Prisma.Decimal to a sanitized 2-decimal Prisma.Decimal
   */
  toDecimal(val: number | string | Prisma.Decimal | null | undefined, defaultVal = '0.00'): Prisma.Decimal {
    if (val === null || val === undefined) {
      return new Prisma.Decimal(defaultVal);
    }
    if (val instanceof Prisma.Decimal) {
      return val;
    }
    return new Prisma.Decimal(val);
  }

  /**
   * Calculates individual line item totals strictly using Prisma.Decimal arithmetic
   */
  calculateLineItem(params: {
    quantity: number | string | Prisma.Decimal;
    unitPrice: number | string | Prisma.Decimal;
    taxRate?: number | string | Prisma.Decimal;
    discount?: number | string | Prisma.Decimal;
  }): { subtotal: Prisma.Decimal; taxAmount: Prisma.Decimal; total: Prisma.Decimal } {
    const qty = this.toDecimal(params.quantity, '1.00');
    const price = this.toDecimal(params.unitPrice, '0.00');
    const taxPct = this.toDecimal(params.taxRate, '0.00');
    const disc = this.toDecimal(params.discount, '0.00');

    // 1. itemSubtotal = quantity * unitPrice
    const subtotal = qty.mul(price);

    // 2. taxable = itemSubtotal - discount
    const taxable = subtotal.sub(disc);

    // 3. itemTax = taxable * (taxRate / 100)
    const taxAmount = taxable.gt(0) ? taxable.mul(taxPct.div(100)) : new Prisma.Decimal('0.00');

    // 4. itemTotal = taxable + itemTax
    const total = taxable.add(taxAmount);

    return {
      subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
      taxAmount: new Prisma.Decimal(taxAmount.toFixed(2)),
      total: new Prisma.Decimal(total.toFixed(2)),
    };
  }

  /**
   * Calculates overall estimate totals from line items and overall estimate discount
   */
  calculateEstimateTotals(
    items: Array<{
      quantity: number | string | Prisma.Decimal;
      unitPrice: number | string | Prisma.Decimal;
      taxRate?: number | string | Prisma.Decimal;
      discount?: number | string | Prisma.Decimal;
    }>,
    estimateDiscount?: number | string | Prisma.Decimal,
  ): CalculatedEstimateTotals {
    let subtotalSum = new Prisma.Decimal('0.00');
    let taxSum = new Prisma.Decimal('0.00');
    let itemDiscountSum = new Prisma.Decimal('0.00');

    for (const item of items) {
      const line = this.calculateLineItem(item);
      const itemDisc = this.toDecimal(item.discount, '0.00');
      const itemSub = this.toDecimal(item.quantity).mul(this.toDecimal(item.unitPrice));

      subtotalSum = subtotalSum.add(itemSub);
      taxSum = taxSum.add(line.taxAmount);
      itemDiscountSum = itemDiscountSum.add(itemDisc);
    }

    const overallDiscount = this.toDecimal(estimateDiscount, '0.00');
    const totalDiscount = itemDiscountSum.add(overallDiscount);

    // totalAmount = subtotal - discountAmount + taxAmount
    const totalAmount = subtotalSum.sub(totalDiscount).add(taxSum);

    return {
      subtotal: new Prisma.Decimal(subtotalSum.toFixed(2)),
      taxAmount: new Prisma.Decimal(taxSum.toFixed(2)),
      discountAmount: new Prisma.Decimal(totalDiscount.toFixed(2)),
      totalAmount: new Prisma.Decimal((totalAmount.lt(0) ? new Prisma.Decimal('0.00') : totalAmount).toFixed(2)),
    };
  }
}
