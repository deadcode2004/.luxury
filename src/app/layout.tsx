import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import { buildMetadata, PAGE_SEO } from "@/lib/seo/meta";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${alexandria.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
