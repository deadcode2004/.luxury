import type { Metadata } from "next";
import { buildMetadata, PAGE_SEO } from "@/lib/seo/meta";

export const metadata: Metadata = buildMetadata(PAGE_SEO.register, "ar");

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
