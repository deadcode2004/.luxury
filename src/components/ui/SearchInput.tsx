"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
};

export default function SearchInput({
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full sm:w-96", containerClassName)}>
      <input
        type="search"
        className={cn(
          "w-full bg-gray-50 border border-gray-200 rounded-lg h-10 px-4 rtl:pl-10 ltr:pr-10 focus:outline-none focus:border-primary transition-colors text-sm",
          className
        )}
        {...props}
      />
      <Search
        size={18}
        className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
