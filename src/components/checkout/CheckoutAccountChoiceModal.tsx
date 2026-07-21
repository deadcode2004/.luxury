"use client";

import React from "react";
import { LogIn, UserPlus, UserRound } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

type CheckoutAccountChoiceModalProps = {
  open: boolean;
  onClose: () => void;
  onGuest: () => void;
  onLogin: () => void;
  onRegister: () => void;
  loading?: boolean;
};

export default function CheckoutAccountChoiceModal({
  open,
  onClose,
  onGuest,
  onLogin,
  onRegister,
  loading = false,
}: CheckoutAccountChoiceModalProps) {
  const { language } = useLanguage();

  const options = [
    {
      key: "login",
      icon: LogIn,
      title: language === "ar" ? "تسجيل الدخول" : "Sign in",
      desc:
        language === "ar"
          ? "لديك حساب؟ اربط الطلب بحسابك"
          : "Already have an account? Link this order to it",
      action: onLogin,
      variant: "secondary" as const,
    },
    {
      key: "register",
      icon: UserPlus,
      title: language === "ar" ? "إنشاء حساب جديد" : "Create an account",
      desc:
        language === "ar"
          ? "أنشئ حساباً واحفظ طلباتك للمتابعة لاحقاً"
          : "Create an account to track this and future orders",
      action: onRegister,
      variant: "outline" as const,
    },
    {
      key: "guest",
      icon: UserRound,
      title: language === "ar" ? "المتابعة كزائر" : "Continue as guest",
      desc:
        language === "ar"
          ? "أكمل الطلب الآن دون إنشاء حساب"
          : "Complete your order now without creating an account",
      action: onGuest,
      variant: "ghost" as const,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={language === "ar" ? "كيف تريد إتمام الطلب؟" : "How would you like to checkout?"}
    >
      <p className="text-sm text-gray-500 mb-5">
        {language === "ar"
          ? "اختر الطريقة الأنسب لك — التسجيل اختياري ولا نُجبرك عليه."
          : "Choose what works best — creating an account is optional."}
      </p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            disabled={loading}
            onClick={opt.action}
            className="flex items-start gap-4 rounded-xl border border-surface bg-background/50 p-4 text-start transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] disabled:opacity-50"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <opt.icon size={20} />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-secondary">{opt.title}</span>
              <span className="mt-0.5 block text-sm text-gray-500">{opt.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="button" variant="outline" size="sm" disabled={loading} onClick={onClose}>
          {language === "ar" ? "رجوع" : "Back"}
        </Button>
      </div>
    </Modal>
  );
}
