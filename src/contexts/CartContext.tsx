"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { Product } from "@/data/mock";
import { readStorage, writeStorage } from "@/lib/storage";
import { calcOrderTotals } from "@/lib/cart/totals";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPublicProducts, getCachedCatalog } from "@/lib/products/catalog";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";

export type CartLine = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  ready: boolean;
  pending: boolean;
  getQuantity: (productId: string) => number;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  setQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  clear: () => Promise<void>;
  lines: Array<Product & { quantity: number }>;
  totals: ReturnType<typeof calcOrderTotals>;
};

const CART_KEY = "paradise_cart";
const CartContext = createContext<CartContextValue | null>(null);

/** Cache backend product code/id → numeric id so add-to-cart does not refetch the catalog. */
let productCodeMapPromise: Promise<Map<string, number>> | null = null;

function invalidateProductCodeMap() {
  productCodeMapPromise = null;
}

function getProductCodeMap(token: string): Promise<Map<string, number>> {
  if (!productCodeMapPromise) {
    productCodeMapPromise = apiRequest<Array<{ id: number; code: string }>>("/products?per_page=50", {
      token,
      cache: "no-store",
    })
      .then((list) => {
        const map = new Map<string, number>();
        for (const p of list) {
          map.set(p.code, p.id);
          map.set(String(p.id), p.id);
        }
        return map;
      })
      .catch((err) => {
        productCodeMapPromise = null;
        throw err;
      });
  }
  return productCodeMapPromise;
}

function resolveProduct(productId: string): Product | undefined {
  // Live catalog only — never fall back to hardcoded mock products.
  return getCachedCatalog().find((p) => p.id === productId);
}

function stockOf(productId: string): number {
  return resolveProduct(productId)?.stock ?? 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { token, ready: authReady } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();
  const [catalogTick, setCatalogTick] = useState(0);

  useEffect(() => {
    setItems(readStorage<CartLine[]>(CART_KEY, []));
    setReady(true);
    // Warm catalog cache for stock/line resolution (no-store so edits show up).
    void fetchPublicProducts({ perPage: 50 })
      .then((list) => {
        const valid = new Set(list.map((p) => p.id));
        setItems((prev) => {
          const next = prev.filter(
            (line) => valid.has(line.productId) || /^\d+$/.test(line.productId)
          );
          return next.length === prev.length ? prev : next;
        });
        setCatalogTick((t) => t + 1);
      })
      .catch(() => undefined);
  }, []);

  useRealtimeDomains(["products"], () => {
    invalidateProductCodeMap();
    void fetchPublicProducts({ perPage: 50 })
      .then((list) => {
        const valid = new Set(list.map((p) => p.id));
        setItems((prev) => {
          const next = prev.filter(
            (line) => valid.has(line.productId) || /^\d+$/.test(line.productId)
          );
          return next.length === prev.length ? prev : next;
        });
        setCatalogTick((t) => t + 1);
      })
      .catch(() => undefined);
  });

  useEffect(() => {
    if (!ready) return;
    writeStorage(CART_KEY, items);
  }, [items, ready]);

  const syncAddToApi = useCallback(
    async (productId: string, quantity: number) => {
      if (!token || !authReady) return;
      try {
        const map = await getProductCodeMap(token);
        const matchId =
          map.get(productId) ??
          (/^\d+$/.test(productId) ? Number(productId) : undefined);
        if (!matchId) return;
        await apiRequest("/cart/items", {
          method: "POST",
          token,
          body: { product_id: matchId, quantity },
          cache: "no-store",
        });
      } catch {
        // Keep local optimistic cart; toast already handled by caller on stock errors.
      }
    },
    [authReady, token]
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const product = resolveProduct(productId);
      if (!product) {
        toast(language === "ar" ? "المنتج غير موجود" : "Product not found", "danger");
        return false;
      }

      const stock = stockOf(productId);
      const current = items.find((i) => i.productId === productId)?.quantity ?? 0;
      const nextQty = current + quantity;

      if (stock <= 0 || nextQty > stock) {
        toast(
          language === "ar"
            ? `✖ لا يوجد مخزون كافٍ (المتاح: ${stock})`
            : `✖ Insufficient stock (available: ${stock})`,
          "danger"
        );
        return false;
      }

      const previous = items;
      startTransition(() => {
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (existing) {
            return prev.map((i) =>
              i.productId === productId ? { ...i, quantity: nextQty } : i
            );
          }
          return [...prev, { productId, quantity }];
        });
      });

      toast(
        language === "ar" ? "✔ تم إضافة المنتج إلى السلة" : "✔ Added to cart",
        "success"
      );

      void syncAddToApi(productId, quantity).catch(() => {
        setItems(previous);
        toast(
          language === "ar"
            ? "✖ تعذر مزامنة السلة مع الخادم"
            : "✖ Could not sync cart with server",
          "warning"
        );
      });

      return true;
    },
    [items, language, syncAddToApi, toast]
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const stock = stockOf(productId);
      if (quantity > stock) {
        toast(
          language === "ar"
            ? `✖ لا يوجد مخزون كافٍ (المتاح: ${stock})`
            : `✖ Insufficient stock (available: ${stock})`,
          "danger"
        );
        return false;
      }

      startTransition(() => {
        setItems((prev) => {
          if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
          return prev.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          );
        });
      });

      toast(
        language === "ar" ? "✔ تم تحديث الكمية" : "✔ Quantity updated",
        "success"
      );

      return true;
    },
    [language, toast]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      startTransition(() => {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      });
      toast(
        language === "ar" ? "✔ تم حذف المنتج من السلة" : "✔ Removed from cart",
        "success"
      );
      return true;
    },
    [language, toast]
  );

  const clear = useCallback(async () => {
    setItems([]);
    toast(language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "success");
  }, [language, toast]);

  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const product = resolveProduct(item.productId);
          if (!product) return null;
          return { ...product, quantity: item.quantity };
        })
        .filter(Boolean) as Array<Product & { quantity: number }>,
    // catalogTick forces re-resolve after live catalog updates (price/stock/name).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, catalogTick]
  );

  const totals = useMemo(() => calcOrderTotals(lines), [lines]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const getQuantity = useCallback(
    (productId: string) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      ready,
      pending,
      getQuantity,
      addItem,
      setQuantity,
      removeItem,
      clear,
      lines,
      totals,
    }),
    [items, count, ready, pending, getQuantity, addItem, setQuantity, removeItem, clear, lines, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
