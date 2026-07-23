export class Money {
  private readonly amountInCents: number;
  private readonly currencyCode: string;

  constructor(amount: number, currencyCode = 'USD') {
    this.amountInCents = Math.round(amount * 100);
    this.currencyCode = currencyCode;
  }

  public static fromCents(cents: number, currencyCode = 'USD'): Money {
    const m = new Money(0, currencyCode);
    (m as any).amountInCents = Math.round(cents);
    return m;
  }

  public getAmount(): number {
    return this.amountInCents / 100;
  }

  public getCents(): number {
    return this.amountInCents;
  }

  public getCurrency(): string {
    return this.currencyCode;
  }

  public add(other: Money): Money {
    return Money.fromCents(this.amountInCents + other.getCents(), this.currencyCode);
  }

  public subtract(other: Money): Money {
    return Money.fromCents(Math.max(0, this.amountInCents - other.getCents()), this.currencyCode);
  }

  public multiply(factor: number): Money {
    return Money.fromCents(Math.round(this.amountInCents * factor), this.currencyCode);
  }

  public equals(other: Money): boolean {
    return this.amountInCents === other.getCents() && this.currencyCode === other.getCurrency();
  }

  public format(): string {
    const val = this.getAmount();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  }

  public toString(): string {
    return this.format();
  }
}
