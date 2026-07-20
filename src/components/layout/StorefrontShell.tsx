"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const AUTH_PATHS = new Set(["/login", "/register"]);

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.has(pathname);

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
