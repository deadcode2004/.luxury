import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Alexandria } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import { buildMetadata, PAGE_SEO } from "@/lib/seo/meta";
import { getAppBuildId } from "@/lib/build/id";
import {
  LANGUAGE_COOKIE,
  languageDir,
  readLanguageCookie,
  type AppLanguage,
} from "@/lib/i18n/language";
import {
  CURRENCY_COOKIE,
  CURRENCY_MANUAL_KEY,
  CURRENCY_STORAGE_KEY,
  readCurrencyCookie,
  type CurrencyCode,
} from "@/lib/currency/cookie";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/** Never serve a prerendered HTML shell that Chrome can keep after a deploy. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  ...buildMetadata(PAGE_SEO.home, "ar"),
  title: {
    template: "%s | PARADISE",
    default: PAGE_SEO.home.title.ar,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://luxury-khaki-eight.vercel.app"
  ),
};

/** Sync localStorage currency → cookie before paint so return visits avoid flash. */
const CURRENCY_BOOTSTRAP = `(function(){try{var m=localStorage.getItem(${JSON.stringify(CURRENCY_MANUAL_KEY)});var raw=localStorage.getItem(${JSON.stringify(CURRENCY_STORAGE_KEY)});if(!raw)return;var v=JSON.parse(raw);if(v!=="EGP"&&v!=="SAR"&&v!=="USD")return;var hasCookie=document.cookie.split(";").some(function(c){return c.trim().indexOf(${JSON.stringify(CURRENCY_COOKIE + "=")})===0});if(!hasCookie||m==="true"){document.cookie=${JSON.stringify(CURRENCY_COOKIE + "=")}+v+"; Path=/; Max-Age=31536000; SameSite=Lax";}}catch(e){}})();`;

/**
 * Runs before React. Chrome often keeps an orphaned Service Worker after "clear cache"
 * unless "Hosted app data" is also cleared — Firefox typically never registered one.
 * Unregister + wipe Cache Storage, then reload once so the live document takes over.
 */
const CACHE_BOOTSTRAP = `(function(){try{var FLAG="paradise:sw-purged";if(!("serviceWorker" in navigator))return;navigator.serviceWorker.getRegistrations().then(function(regs){var controlled=regs.length>0||!!navigator.serviceWorker.controller;if(!controlled)return;return Promise.all(regs.map(function(r){return r.unregister();})).then(function(){if(!("caches" in window))return null;return caches.keys().then(function(keys){return Promise.all(keys.map(function(k){return caches.delete(k);}));});}).then(function(){try{if(!sessionStorage.getItem(FLAG)){sessionStorage.setItem(FLAG,"1");location.reload();}}catch(e){}});});}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const language: AppLanguage = readLanguageCookie(cookieStore.get(LANGUAGE_COOKIE)?.value) ?? "ar";
  const dir = languageDir(language);
  const initialCurrency: CurrencyCode | null = readCurrencyCookie(
    cookieStore.get(CURRENCY_COOKIE)?.value
  );
  const buildId = getAppBuildId();

  return (
    <html lang={language} dir={dir} className={`${alexandria.variable} antialiased h-full`}>
      <head>
        <meta name="paradise-build-id" content={buildId} />
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <script dangerouslySetInnerHTML={{ __html: CACHE_BOOTSTRAP }} />
        <script dangerouslySetInnerHTML={{ __html: CURRENCY_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <AppProviders
          initialLanguage={language}
          initialCurrency={initialCurrency}
          buildId={buildId}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
