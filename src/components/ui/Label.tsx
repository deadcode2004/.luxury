"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-sm font-bold text-gray-600 mb-2", className)}
      {...props}
    />
  );
}
