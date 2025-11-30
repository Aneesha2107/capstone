export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  BRL: 4.97,
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  CHF: "Fr",
  CNY: "¥",
  BRL: "R$",
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1
  const toRate = EXCHANGE_RATES[toCurrency] || 1
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate
  return usdAmount * toRate
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || "$"
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(amount)
  return `${symbol}${formatted}`
}

// Convert amounts from USD (stored in DB) to user's currency
export function convertFromUSD(amount: number, toCurrency: string): number {
  return amount * (EXCHANGE_RATES[toCurrency] || 1)
}

// Convert amounts from user's currency to USD (for storage)
export function convertToUSD(amount: number, fromCurrency: string): number {
  return amount / (EXCHANGE_RATES[fromCurrency] || 1)
}
