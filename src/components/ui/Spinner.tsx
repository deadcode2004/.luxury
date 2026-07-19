"use client";

import React from "react";
import { cn } from "@/lib/cn";

type SpinnerProps = {
  className?: string;
  size?: number;
};

export default function Spinner({ className, size = 24 }: SpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border-2 border-primary/30 border-t-primary animate-spin",
        className
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
