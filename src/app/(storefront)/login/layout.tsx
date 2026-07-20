import type { Metadata } from "next";
import { buildMetadata, PAGE_SEO } from "@/lib/seo/meta";

export const metadata: Metadata = buildMetadata(PAGE_SEO.login, "ar");

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
