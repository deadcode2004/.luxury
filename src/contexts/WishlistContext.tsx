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
import { readStorage, writeStorage } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/data/mock";
import { fetchPublicProducts, getCachedCatalog } from "@/lib/products/catalog";

type WishlistContextValue = {
  ids: string[];
  count: number;
  ready: boolean;
  pending: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<boolean>;
  items: Product[];
};

const WISHLIST_KEY = "paradise_wishlist";
const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setIds(readStorage<string[]>(WISHLIST_KEY, []));
    setReady(true);
    void fetchPublicProducts({ perPage: 50 })
      .then((list) => {
        const valid = new Set(list.map((p) => p.id));
        setIds((prev) => {
          // Drop legacy mock ids like "p1" that are not in the live catalog.
          const next = prev.filter((id) => valid.has(id) || /^\d+$/.test(id));
          return next.length === prev.length ? prev : next;
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStorage(WISHLIST_KEY, ids);
  }, [ids, ready]);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  const toggle = useCallback(
    async (productId: string) => {
      const exists = ids.includes(productId);
      startTransition(() => {
        setIds((prev) =>
          exists ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
      });
      toast(
        exists
          ? language === "ar"
            ? "✔ تمت الإزالة من المفضلة"
            : "✔ Removed from wishlist"
          : language === "ar"
            ? "✔ تمت إضافة المنتج للمفضلة"
            : "✔ Added to wishlist",
        "success"
      );
      return !exists;
    },
    [ids, language, toast]
  );

  const remove = useCallback(
    async (productId: string) => {
      startTransition(() => {
        setIds((prev) => prev.filter((id) => id !== productId));
      });
      toast(
        language === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist",
        "success"
      );
      return true;
    },
    [language, toast]
  );

  const items = useMemo(
    () => getCachedCatalog().filter((p) => ids.includes(p.id)),
    [ids]
  );

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      ready,
      pending,
      has,
      toggle,
      remove,
      items,
    }),
    [ids, ready, pending, has, toggle, remove, items]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
