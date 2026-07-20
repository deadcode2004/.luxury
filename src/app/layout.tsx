import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Alexandria } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import { buildMetadata, PAGE_SEO } from "@/lib/seo/meta";
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

  return (
    <html lang={language} dir={dir} className={`${alexandria.variable} antialiased h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CURRENCY_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <AppProviders initialLanguage={language} initialCurrency={initialCurrency}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
