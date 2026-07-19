import React from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
