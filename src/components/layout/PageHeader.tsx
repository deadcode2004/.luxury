"use client";

import React from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  centered?: boolean;
  showAccent?: boolean;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  action,
  centered = false,
  showAccent = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12",
        centered && "flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className={cn("flex items-start justify-between gap-4", centered && "flex-col items-center")}>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary mb-2">
            {title}
          </h1>
          {showAccent && <div className="w-20 h-1 bg-primary mx-auto mb-4" />}
          {description != null && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
