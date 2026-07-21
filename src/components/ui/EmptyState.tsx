"use client";

import React from "react";
import { cn } from "@/lib/cn";
import Card from "./Card";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "glass" | "panel";
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "glass",
}: EmptyStateProps) {
  return (
    <Card
      variant={variant}
      padding="none"
      className={cn("text-center py-24 px-6", className)}
    >
      {icon != null && (
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>
      )}
      <h2 className="text-2xl font-bold text-secondary mb-4">{title}</h2>
      {description != null && (
        <p className="text-gray-500 mb-8 max-w-md mx-auto">{description}</p>
      )}
      {action}
    </Card>
  );
}
