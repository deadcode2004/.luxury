"use client";

import React from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import DocumentMeta from "@/components/seo/DocumentMeta";
import type { AppLanguage } from "@/lib/i18n/language";
import type { CurrencyCode } from "@/lib/currency/cookie";

export default function AppProviders({
  children,
  initialLanguage = "ar",
  initialCurrency = null,
}: {
  children: React.ReactNode;
  initialLanguage?: AppLanguage;
  initialCurrency?: CurrencyCode | null;
}) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <ToastProvider>
        <CurrencyProvider initialCurrency={initialCurrency}>
          <RealtimeProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <DocumentMeta />
                  {children}
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </RealtimeProvider>
        </CurrencyProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
