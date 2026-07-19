"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors",
        className
      )}
      {...props}
    />
  );
}
