"use client";

import { getPasswordStrength } from "@/lib/auth/passwordStrength";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PasswordStrength({ password }: { password: string }) {
  const { language } = useLanguage();
  if (!password) return null;
  const level = getPasswordStrength(password);
  const width = level === "weak" ? "33%" : level === "medium" ? "66%" : "100%";
  const color =
    level === "weak" ? "bg-red-500" : level === "medium" ? "bg-amber-500" : "bg-primary";
  const label =
    level === "weak"
      ? language === "ar"
        ? "ضعيفة"
        : "Weak"
      : level === "medium"
        ? language === "ar"
          ? "متوسطة"
          : "Medium"
        : language === "ar"
          ? "قوية"
          : "Strong";

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${color}`} style={{ width }} />
      </div>
      <p className="text-xs text-gray-500">
        {language === "ar" ? "قوة كلمة المرور:" : "Password strength:"}{" "}
        <span className="font-bold text-secondary">{label}</span>
      </p>
    </div>
  );
}
