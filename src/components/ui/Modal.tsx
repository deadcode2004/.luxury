"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-floating p-6",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          {title != null && (
            <h3 className="text-lg font-bold text-secondary">{title}</h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ms-auto p-2 text-gray-400 hover:text-secondary transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
