"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type Mode = "login" | "register";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
};

export default function AuthModal({ open, onClose, initialMode = "login" }: AuthModalProps) {
  const { language } = useLanguage();
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) {
      next.email = language === "ar" ? "البريد مطلوب" : "Email is required";
    }
    if (!form.password || form.password.length < 8) {
      next.password =
        language === "ar" ? "كلمة المرور 8 أحرف على الأقل" : "Min 8 characters";
    }
    if (mode === "register") {
      if (!form.first_name.trim()) {
        next.first_name = language === "ar" ? "الاسم مطلوب" : "Required";
      }
      if (!form.last_name.trim()) {
        next.last_name = language === "ar" ? "اسم العائلة مطلوب" : "Required";
      }
      if (form.password !== form.password_confirmation) {
        next.password_confirmation =
          language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const ok =
      mode === "login"
        ? await login(form.email, form.password)
        : await register({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone || undefined,
            password: form.password,
            password_confirmation: form.password_confirmation,
          });

    if (ok) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "login"
          ? language === "ar"
            ? "تسجيل الدخول"
            : "Sign In"
          : language === "ar"
            ? "إنشاء حساب"
            : "Create Account"
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={language === "ar" ? "الاسم الأول" : "First Name"} error={errors.first_name}>
              <Input
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className={errors.first_name ? "border-red-300" : ""}
                aria-invalid={Boolean(errors.first_name)}
              />
            </FormField>
            <FormField label={language === "ar" ? "اسم العائلة" : "Last Name"} error={errors.last_name}>
              <Input
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className={errors.last_name ? "border-red-300" : ""}
                aria-invalid={Boolean(errors.last_name)}
              />
            </FormField>
          </div>
        )}

        <FormField label={language === "ar" ? "البريد الإلكتروني" : "Email"} error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={errors.email ? "border-red-300" : ""}
            aria-invalid={Boolean(errors.email)}
          />
        </FormField>

        {mode === "register" && (
          <FormField label={language === "ar" ? "رقم الهاتف" : "Phone"}>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="dir-ltr text-start"
            />
          </FormField>
        )}

        <FormField label={language === "ar" ? "كلمة المرور" : "Password"} error={errors.password}>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={errors.password ? "border-red-300" : ""}
            aria-invalid={Boolean(errors.password)}
          />
        </FormField>

        {mode === "register" && (
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
              className={errors.password_confirmation ? "border-red-300" : ""}
              aria-invalid={Boolean(errors.password_confirmation)}
            />
          </FormField>
        )}

        <Button type="submit" variant="secondary" fullWidth loading={loading}>
          {mode === "login"
            ? language === "ar"
              ? "دخول"
              : "Sign In"
            : language === "ar"
              ? "إنشاء الحساب"
              : "Create Account"}
        </Button>

        <button
          type="button"
          className="text-sm text-primary font-bold hover:underline transition-colors"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setErrors({});
          }}
        >
          {mode === "login"
            ? language === "ar"
              ? "ليس لديك حساب؟ سجّل الآن"
              : "No account? Register"
            : language === "ar"
              ? "لديك حساب؟ سجّل الدخول"
              : "Have an account? Sign in"}
        </button>
      </form>
    </Modal>
  );
}
