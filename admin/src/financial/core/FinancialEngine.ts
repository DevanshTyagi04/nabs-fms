import { FinancialLineItem, TotalsBreakdown } from './types';
import { CalculationPipeline } from './CalculationPipeline';

export class FinancialEngine {
  static calculate(items: FinancialLineItem[]): {
    calculatedItems: FinancialLineItem[];
    totals: TotalsBreakdown;
  } {
    const calculatedItems = items.map((item) => CalculationPipeline.calculateLineItem(item));
    const totals = CalculationPipeline.calculateTotals(calculatedItems);
    return { calculatedItems, totals };
  }
}

export class FinancialValidationEngine {
  static validateLineItem(item: FinancialLineItem): string | null {
    if (!item.description || item.description.trim() === '') {
      return 'Item description is required';
    }
    if (item.quantity === undefined || item.quantity <= 0) {
      return 'Quantity must be greater than 0';
    }
    if (item.unitPrice === undefined || item.unitPrice < 0) {
      return 'Unit price cannot be negative';
    }
    return null;
  }

  static validateEstimate(items: FinancialLineItem[]): string | null {
    if (!items || items.length === 0) {
      return 'At least one line item is required';
    }
    for (const item of items) {
      const err = this.validateLineItem(item);
      if (err) return err;
    }
    return null;
  }
}
