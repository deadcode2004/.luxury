"use client";

import React from "react";
import { cn } from "@/lib/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-gray-200/80", className)}
      {...props}
    />
  );
}
