"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth, type AuthUser } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { readStorage } from "@/lib/storage";

function LoginForm() {
  const { language } = useLanguage();
  const { login, loading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!email.includes("@")) next.email = language === "ar" ? "بريد غير صالح" : "Invalid email";
    if (password.length < 8) {
      next.password = language === "ar" ? "8 أحرف على الأقل" : "Min 8 characters";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const ok = await login(email.trim(), password);
    if (!ok) return;
    const dest = search.get("next");
    const saved = readStorage<AuthUser | null>("paradise_user", null);
    if (dest) router.replace(dest);
    else router.replace(saved?.role === "owner" ? "/admin" : "/account");
  };

  return (
    <AuthShell
      title={language === "ar" ? "تسجيل الدخول" : "Sign In"}
      subtitle={
        language === "ar"
          ? "مرحباً بعودتك إلى PARADISE"
          : "Welcome back to PARADISE"
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label={language === "ar" ? "البريد الإلكتروني" : "Email"} error={errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-start dir-ltr"
            autoComplete="email"
          />
        </FormField>
        <FormField label={language === "ar" ? "كلمة المرور" : "Password"} error={errors.password}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </FormField>
        <Button type="submit" variant="secondary" fullWidth loading={loading}>
          {language === "ar" ? "دخول" : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-center text-gray-500">
        {language === "ar" ? "ليس لديك حساب؟" : "No account?"}{" "}
        <Link href="/register" className="text-primary font-bold hover:underline">
          {language === "ar" ? "إنشاء حساب" : "Create account"}
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
