"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Save, User, Lock, Bell, Globe, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FormField from "@/components/ui/FormField";
import SidebarNav from "@/components/layout/SidebarNav";
import { ApiRequestError, apiRequest } from "@/lib/api/client";
import type { AppLanguage } from "@/lib/i18n/language";
import { useAutoFetch } from "@/hooks/useAutoFetch";

type Section = "personal" | "security" | "notifications" | "language";

type AccountSettingsPayload = {
  user: {
    id: number;
    name: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    phone?: string | null;
    role: "owner" | "user";
    is_active?: boolean;
    notify_orders?: boolean;
    notify_stock?: boolean;
    notify_marketing?: boolean;
  };
  timezone: string;
  timezone_label: string;
};

export default function AdminSettings() {
  const { language, setLanguage } = useLanguage();
  const {
    token,
    user,
    ready,
    loading: authLoading,
    updateProfile,
    changePassword,
    updateNotifications,
    refreshProfile,
  } = useAuth();
  const { toast } = useToast();
  const [section, setSection] = useState<Section>("personal");
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timezoneLabel, setTimezoneLabel] = useState("UTC");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
    notify_orders: true,
    notify_stock: true,
    notify_marketing: false,
  });

  const applyUser = useCallback(
    (u: AccountSettingsPayload["user"] | null | undefined) => {
      if (!u) return;
      setForm((f) => ({
        ...f,
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        email: u.email || "",
        phone: u.phone || "",
        notify_orders: u.notify_orders ?? true,
        notify_stock: u.notify_stock ?? true,
        notify_marketing: u.notify_marketing ?? false,
      }));
    },
    []
  );

  const loadSettings = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) return;
      if (!options?.silent) setLoadingSettings(true);
      try {
        const data = await apiRequest<AccountSettingsPayload>("/account/settings", {
          token,
          cache: "no-store",
        });
        applyUser(data.user);
        setTimezoneLabel(data.timezone_label || data.timezone || "UTC");
      } catch (err) {
        // Fallback to auth user if settings endpoint fails.
        if (user) applyUser(user);
        if (!options?.silent) {
          toast(
            err instanceof ApiRequestError
              ? err.message
              : language === "ar"
                ? "تعذر تحميل الإعدادات"
                : "Failed to load settings",
            "danger"
          );
        }
      } finally {
        if (!options?.silent) setLoadingSettings(false);
        setHasFetched(true);
      }
    },
    [token, user, applyUser, language, toast]
  );

  useAutoFetch(loadSettings);

  useEffect(() => {
    if (ready && user && !hasFetched) {
      applyUser(user);
    }
  }, [ready, user, hasFetched, applyUser]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (section === "personal") {
      if (!form.first_name.trim()) {
        next.first_name = language === "ar" ? "مطلوب" : "Required";
      }
      if (!form.last_name.trim()) {
        next.last_name = language === "ar" ? "مطلوب" : "Required";
      }
      if (!form.email.includes("@")) {
        next.email = language === "ar" ? "بريد غير صالح" : "Invalid email";
      }
    }
    if (section === "security") {
      if (!form.current_password) {
        next.current_password = language === "ar" ? "مطلوب" : "Required";
      }
      if (form.new_password.length < 8) {
        next.new_password = language === "ar" ? "8 أحرف على الأقل" : "Min 8 characters";
      }
      if (form.new_password !== form.confirm_password) {
        next.confirm_password =
          language === "ar" ? "غير متطابقة" : "Passwords do not match";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (section === "language" || section === "notifications") return;
    if (!validate()) {
      toast(
        language === "ar" ? "يرجى تصحيح الحقول" : "Please fix the highlighted fields",
        "warning"
      );
      return;
    }

    setSaving(true);
    try {
      if (section === "personal") {
        const ok = await updateProfile({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
        });
        if (ok) {
          await refreshProfile();
          await loadSettings({ silent: true });
        }
      }

      if (section === "security") {
        const ok = await changePassword({
          current_password: form.current_password,
          password: form.new_password,
          password_confirmation: form.confirm_password,
        });
        if (ok) {
          setForm((f) => ({
            ...f,
            current_password: "",
            new_password: "",
            confirm_password: "",
          }));
          setErrors({});
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = async (
    key: "notify_orders" | "notify_stock" | "notify_marketing",
    value: boolean
  ) => {
    const previous = form[key];
    setForm((f) => ({ ...f, [key]: value }));
    const ok = await updateNotifications({ [key]: value });
    if (!ok) {
      setForm((f) => ({ ...f, [key]: previous }));
      return;
    }
    toast(
      value
        ? language === "ar"
          ? "✔ تم التفعيل"
          : "✔ Enabled"
        : language === "ar"
          ? "تم الإيقاف"
          : "Disabled",
      value ? "success" : "info"
    );
  };

  const initials =
    `${form.first_name.charAt(0)}${form.last_name.charAt(0)}`.trim().toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "A";

  const showSave = section === "personal" || section === "security";

  return (
    <div className="flex flex-col gap-8">
      <Card
        variant="panel"
        padding="md"
        className="flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-secondary mb-1">
            {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
          </h2>
          <p className="text-gray-500 text-sm">
            {language === "ar"
              ? "إدارة تفضيلات حسابك الشخصي والأمان"
              : "Manage your personal account preferences and security"}
          </p>
        </div>
        {showSave ? (
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto"
            loading={saving || authLoading}
            disabled={loadingSettings}
            onClick={() => void save()}
          >
            <Save size={18} />
            {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
          </Button>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card variant="panel" padding="sm">
            <SidebarNav
              variant="light"
              activeKey={section}
              items={[
                {
                  key: "personal",
                  label: language === "ar" ? "المعلومات الشخصية" : "Personal Information",
                  icon: <User size={18} />,
                  onClick: () => setSection("personal"),
                },
                {
                  key: "security",
                  label: language === "ar" ? "الأمان وكلمة المرور" : "Security & Password",
                  icon: <Lock size={18} />,
                  onClick: () => setSection("security"),
                },
                {
                  key: "notifications",
                  label: language === "ar" ? "الإشعارات" : "Notifications",
                  icon: <Bell size={18} />,
                  onClick: () => setSection("notifications"),
                },
                {
                  key: "language",
                  label: language === "ar" ? "اللغة والمنطقة" : "Language & Region",
                  icon: <Globe size={18} />,
                  onClick: () => setSection("language"),
                },
              ]}
            />
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          {loadingSettings && !hasFetched ? (
            <Card variant="panel" padding="lg" className="text-sm text-gray-400">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </Card>
          ) : null}

          {section === "personal" && (
            <Card variant="panel" padding="none" className="overflow-hidden">
              <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-secondary text-lg truncate">
                    {form.first_name} {form.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user?.role === "owner"
                      ? language === "ar"
                        ? "مالك المتجر"
                        : "Store owner"
                      : language === "ar"
                        ? "مستخدم"
                        : "User"}
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label={language === "ar" ? "الاسم الأول" : "First Name"}
                  error={errors.first_name}
                >
                  <Input
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="h-12"
                  />
                </FormField>
                <FormField
                  label={language === "ar" ? "اسم العائلة" : "Last Name"}
                  error={errors.last_name}
                >
                  <Input
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="h-12"
                  />
                </FormField>
                <FormField
                  className="md:col-span-2"
                  label={language === "ar" ? "البريد الإلكتروني" : "Email Address"}
                  error={errors.email}
                >
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="h-12 text-start dir-ltr"
                  />
                </FormField>
                <FormField
                  className="md:col-span-2"
                  label={language === "ar" ? "رقم الهاتف" : "Phone Number"}
                >
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="h-12 text-start dir-ltr"
                  />
                </FormField>
              </div>
            </Card>
          )}

          {section === "security" && (
            <div className="flex flex-col gap-6">
              <Card variant="panel" padding="lg" className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-secondary">
                    {language === "ar" ? "حالة الحساب" : "Account status"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {user?.is_active === false
                      ? language === "ar"
                        ? "الحساب غير نشط"
                        : "Account is inactive"
                      : language === "ar"
                        ? "الحساب نشط ومحمي بكلمة مرور"
                        : "Account is active and password-protected"}
                  </p>
                </div>
              </Card>

              <Card variant="panel" padding="lg" className="grid grid-cols-1 gap-6 max-w-xl">
                <div>
                  <h3 className="font-bold text-secondary mb-1">
                    {language === "ar" ? "تغيير كلمة المرور" : "Change password"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {language === "ar"
                      ? "أدخل كلمة المرور الحالية ثم كلمة المرور الجديدة."
                      : "Enter your current password, then the new password."}
                  </p>
                </div>
                <FormField
                  label={language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                  error={errors.current_password}
                >
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={form.current_password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, current_password: e.target.value }))
                    }
                  />
                </FormField>
                <FormField
                  label={language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                  error={errors.new_password}
                >
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={form.new_password}
                    onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
                  />
                </FormField>
                <FormField
                  label={language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                  error={errors.confirm_password}
                >
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={form.confirm_password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, confirm_password: e.target.value }))
                    }
                  />
                </FormField>
              </Card>
            </div>
          )}

          {section === "notifications" && (
            <Card variant="panel" padding="lg" className="space-y-4">
              {[
                {
                  key: "notify_orders" as const,
                  label: language === "ar" ? "تنبيهات الطلبات الجديدة" : "New order alerts",
                },
                {
                  key: "notify_stock" as const,
                  label: language === "ar" ? "تنبيهات نفاد المخزون" : "Low stock alerts",
                },
                {
                  key: "notify_marketing" as const,
                  label: language === "ar" ? "رسائل تسويقية" : "Marketing emails",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-secondary">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={form[item.key]}
                    onChange={(e) => void toggleNotification(item.key, e.target.checked)}
                    className="h-5 w-5 accent-[var(--color-primary,#c9a96e)]"
                  />
                </label>
              ))}
            </Card>
          )}

          {section === "language" && (
            <Card variant="panel" padding="lg" className="flex flex-col gap-6 max-w-xl">
              <FormField label={language === "ar" ? "لغة لوحة التحكم" : "Dashboard language"}>
                <Select
                  className="h-12"
                  value={language}
                  onChange={(e) => {
                    const next = e.target.value as AppLanguage;
                    setLanguage(next);
                    toast(
                      next === "ar"
                        ? "✔ تم تغيير لغة اللوحة إلى العربية"
                        : "✔ Dashboard language set to English",
                      "success"
                    );
                  }}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </Select>
              </FormField>

              <FormField label={language === "ar" ? "المنطقة الزمنية" : "Timezone"}>
                <Input
                  className="h-12 text-start dir-ltr"
                  value={timezoneLabel}
                  readOnly
                  disabled
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  {language === "ar"
                    ? "تُجلب تلقائياً من إعدادات السيرفر ولا يمكن تعديلها من هنا."
                    : "Fetched automatically from server settings and cannot be changed here."}
                </p>
              </FormField>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
