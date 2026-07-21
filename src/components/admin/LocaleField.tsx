"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Input, { type InputProps } from "@/components/ui/Input";
import Textarea, { type TextareaProps } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

type LocaleValueProps = {
  /** Arabic source value (always what gets saved). */
  ar: string;
  /** Auto-translated English from last save (shown when dashboard language is EN). */
  en?: string | null;
};

type LocaleInputProps = LocaleValueProps &
  Omit<InputProps, "value" | "onChange" | "readOnly" | "dir"> & {
    onArChange: (ar: string) => void;
  };

type LocaleTextareaProps = LocaleValueProps &
  Omit<TextareaProps, "value" | "onChange" | "readOnly" | "dir"> & {
    onArChange: (ar: string) => void;
  };

/**
 * Owner content field: edit Arabic when UI is Arabic; show English translation
 * in the same field when UI is English (read-only until they switch back).
 */
export function LocaleInput({ ar, en, onArChange, className, ...props }: LocaleInputProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const display = isAr ? ar : en?.trim() || ar;

  return (
    <Input
      {...props}
      dir={isAr ? "rtl" : "ltr"}
      className={cn(!isAr && "text-start", className)}
      value={display}
      readOnly={!isAr}
      onChange={(e) => {
        if (!isAr) return;
        onArChange(e.target.value);
      }}
    />
  );
}

export function LocaleTextarea({
  ar,
  en,
  onArChange,
  className,
  ...props
}: LocaleTextareaProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const display = isAr ? ar : en?.trim() || ar;

  return (
    <Textarea
      {...props}
      dir={isAr ? "rtl" : "ltr"}
      className={cn(!isAr && "text-start", className)}
      value={display}
      readOnly={!isAr}
      onChange={(e) => {
        if (!isAr) return;
        onArChange(e.target.value);
      }}
    />
  );
}
