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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const language: AppLanguage = readLanguageCookie(cookieStore.get(LANGUAGE_COOKIE)?.value) ?? "ar";
  const dir = languageDir(language);

  return (
    <html lang={language} dir={dir} className={`${alexandria.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <AppProviders initialLanguage={language}>{children}</AppProviders>
      </body>
    </html>
  );
}
