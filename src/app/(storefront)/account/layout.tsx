import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حسابي",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
