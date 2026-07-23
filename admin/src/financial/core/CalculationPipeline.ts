import { FinancialLineItem, TotalsBreakdown } from './types';
import { Money } from './Money';

export class CalculationPipeline {
  static calculateLineItem(item: FinancialLineItem): FinancialLineItem {
    const qty = Math.max(0, item.quantity || 0);
    const price = Math.max(0, item.unitPrice || 0);
    const subtotalMoney = new Money(qty * price);

    const discountVal = Math.max(0, item.discountAmount || 0);
    const discountMoney = new Money(discountVal);

    const afterDiscountMoney = subtotalMoney.subtract(discountMoney);

    const taxRate = Math.max(0, item.taxRate || 0);
    const taxMoney = afterDiscountMoney.multiply(taxRate / 100);

    const totalMoney = afterDiscountMoney.add(taxMoney);

    return {
      ...item,
      subtotal: subtotalMoney.getAmount(),
      taxTotal: taxMoney.getAmount(),
      total: totalMoney.getAmount(),
    };
  }

  static calculateTotals(items: FinancialLineItem[]): TotalsBreakdown {
    let subtotalCents = 0;
    let discountCents = 0;
    let taxCents = 0;
    let grandCents = 0;

    items.forEach((item) => {
      const calculated = this.calculateLineItem(item);
      const sub = new Money(calculated.subtotal || 0);
      const disc = new Money(item.discountAmount || 0);
      const tax = new Money(calculated.taxTotal || 0);
      const tot = new Money(calculated.total || 0);

      subtotalCents += sub.getCents();
      discountCents += disc.getCents();
      taxCents += tax.getCents();
      grandCents += tot.getCents();
    });

    const subtotalMoney = Money.fromCents(subtotalCents);
    const discountMoney = Money.fromCents(discountCents);
    const taxableMoney = subtotalMoney.subtract(discountMoney);
    const taxMoney = Money.fromCents(taxCents);
    const grandMoney = Money.fromCents(grandCents);

    return {
      subtotal: subtotalMoney.getAmount(),
      discountTotal: discountMoney.getAmount(),
      taxableAmount: taxableMoney.getAmount(),
      taxTotal: taxMoney.getAmount(),
      grandTotal: grandMoney.getAmount(),
      formattedSubtotal: subtotalMoney.format(),
      formattedDiscountTotal: discountMoney.format(),
      formattedTaxTotal: taxMoney.format(),
      formattedGrandTotal: grandMoney.format(),
    };
  }
}
