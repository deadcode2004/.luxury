"use client";

import React from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import DocumentMeta from "@/components/seo/DocumentMeta";
import type { AppLanguage } from "@/lib/i18n/language";

export default function AppProviders({
  children,
  initialLanguage = "ar",
}: {
  children: React.ReactNode;
  initialLanguage?: AppLanguage;
}) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <DocumentMeta />
                {children}
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
