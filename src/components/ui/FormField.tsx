"use client";

import React from "react";
import { cn } from "@/lib/cn";
import Label from "./Label";

type FormFieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  className,
  children,
  hint,
}: FormFieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {label != null && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint != null && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
