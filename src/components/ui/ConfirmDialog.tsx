"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { useLanguage } from "@/contexts/LanguageContext";

type ConfirmDialogProps = {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading,
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { language } = useLanguage();

  return (
    <Modal open={open} onClose={loading ? () => undefined : onClose} title={title}>
      {description != null && <p className="text-gray-500 mb-6 leading-relaxed">{description}</p>}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel ?? (language === "ar" ? "إلغاء" : "Cancel")}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel ?? (language === "ar" ? "تأكيد الحذف" : "Confirm Delete")}
        </Button>
      </div>
    </Modal>
  );
}
