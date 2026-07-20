export type CartLine = {
  price: number;
  quantity: number;
};

export type OrderTotals = {
  subtotal: number;
  tax: number;
  total: number;
  vatRate: number;
};

export function calcOrderTotals(
  items: CartLine[],
  options?: { vatRate?: number }
): OrderTotals {
  const vatRate = options?.vatRate ?? 0.15;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * vatRate;
  const total = subtotal + tax;

  return { subtotal, tax, total, vatRate };
}
