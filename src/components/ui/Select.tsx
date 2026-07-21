"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors appearance-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
