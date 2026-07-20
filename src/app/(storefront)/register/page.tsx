"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPasswordStrength } from "@/lib/auth/passwordStrength";

export default function RegisterPage() {
  const { language } = useLanguage();
  const { register, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) {
      next.first_name = language === "ar" ? "مطلوب" : "Required";
    }
    if (!form.last_name.trim()) {
      next.last_name = language === "ar" ? "مطلوب" : "Required";
    }
    if (!form.email.includes("@")) {
      next.email = language === "ar" ? "بريد غير صالح" : "Invalid email";
    }
    if (getPasswordStrength(form.password) === "weak") {
      next.password =
        language === "ar"
          ? "كلمة المرور ضعيفة. استخدم أحرفاً كبيرة وصغيرة ورقماً ورمزاً."
          : "Password is weak. Use upper/lowercase, a number, and a symbol.";
    }
    if (form.password !== form.password_confirmation) {
      next.password_confirmation =
        language === "ar" ? "غير متطابقة" : "Passwords do not match";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const ok = await register({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password,
      password_confirmation: form.password_confirmation,
    });
    if (ok) router.replace("/account");
  };

  return (
    <AuthShell
      title={language === "ar" ? "إنشاء حساب" : "Create Account"}
      subtitle={
        language === "ar"
          ? "انضم إلى عالم PARADISE الفاخر"
          : "Join the world of PARADISE luxury"
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label={language === "ar" ? "الاسم الأول" : "First Name"}
            error={errors.first_name}
          >
            <Input
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              autoComplete="given-name"
            />
          </FormField>
          <FormField
            label={language === "ar" ? "اسم العائلة" : "Last Name"}
            error={errors.last_name}
          >
            <Input
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              autoComplete="family-name"
            />
          </FormField>
        </div>
        <FormField label={language === "ar" ? "البريد الإلكتروني" : "Email"} error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="text-start dir-ltr"
            autoComplete="email"
          />
        </FormField>
        <FormField label={language === "ar" ? "رقم الهاتف" : "Phone Number"}>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="text-start dir-ltr"
            autoComplete="tel"
          />
        </FormField>
        <FormField label={language === "ar" ? "كلمة المرور" : "Password"} error={errors.password}>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="new-password"
          />
          <PasswordStrength password={form.password} />
        </FormField>
        <FormField
          label={language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
          error={errors.password_confirmation}
        >
          <Input
            type="password"
            value={form.password_confirmation}
            onChange={(e) =>
              setForm((f) => ({ ...f, password_confirmation: e.target.value }))
            }
            autoComplete="new-password"
          />
        </FormField>
        <Button type="submit" variant="secondary" fullWidth loading={loading}>
          {language === "ar" ? "إنشاء الحساب" : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-center text-gray-500">
        {language === "ar" ? "لديك حساب؟" : "Already have an account?"}{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          {language === "ar" ? "تسجيل الدخول" : "Sign in"}
        </Link>
      </p>
    </AuthShell>
  );
}
