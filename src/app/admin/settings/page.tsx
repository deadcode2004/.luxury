"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Save, User, Lock, Bell, Globe } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import SidebarNav from "@/components/layout/SidebarNav";

type Section = "personal" | "security" | "notifications" | "language";

export default function AdminSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [section, setSection] = useState<Section>("personal");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: "Admin",
    last_name: "User",
    email: "admin@paradise-store.com",
    phone: "+966 50 123 4567",
    current_password: "",
    new_password: "",
    confirm_password: "",
    orderAlerts: true,
    stockAlerts: true,
    marketing: false,
  });

  const validate = () => {
    const next: Record<string, string> = {};
    if (section === "personal") {
      if (!form.first_name.trim()) {
        next.first_name = language === "ar" ? "مطلوب" : "Required";
      }
      if (!form.email.includes("@")) {
        next.email = language === "ar" ? "بريد غير صالح" : "Invalid email";
      }
    }
    if (section === "security" && (form.new_password || form.confirm_password || form.current_password)) {
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
    if (!validate()) {
      toast(
        language === "ar" ? "يرجى تصحيح الحقول" : "Please fix the highlighted fields",
        "warning"
      );
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    if (section === "security") {
      setForm((f) => ({
        ...f,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
    }
    toast(language === "ar" ? "✔ تم حفظ الإعدادات" : "✔ Settings saved", "success");
  };

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
        <Button
          variant="secondary"
          size="md"
          className="w-full sm:w-auto"
          loading={saving}
          onClick={() => void save()}
        >
          <Save size={18} />
          {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
        </Button>
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
          {section === "personal" && (
            <Card variant="panel" padding="none" className="overflow-hidden">
              <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                  {form.first_name.charAt(0) || "A"}
                </div>
                <div>
                  <h3 className="font-bold text-secondary text-lg">
                    {form.first_name} {form.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">Store Manager</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ms-auto"
                  onClick={() =>
                    toast(
                      language === "ar"
                        ? "رفع الصورة قريباً"
                        : "Avatar upload coming soon",
                      "info"
                    )
                  }
                >
                  {language === "ar" ? "تغيير الصورة" : "Change Avatar"}
                </Button>
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
                <FormField label={language === "ar" ? "اسم العائلة" : "Last Name"}>
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
            <Card variant="panel" padding="lg" className="grid grid-cols-1 gap-6 max-w-xl">
              <FormField
                label={language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                error={errors.current_password}
              >
                <Input
                  type="password"
                  value={form.current_password}
                  onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))}
                />
              </FormField>
              <FormField
                label={language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                error={errors.new_password}
              >
                <Input
                  type="password"
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
                  value={form.confirm_password}
                  onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
                />
              </FormField>
            </Card>
          )}

          {section === "notifications" && (
            <Card variant="panel" padding="lg" className="space-y-4">
              {[
                {
                  key: "orderAlerts" as const,
                  label: language === "ar" ? "تنبيهات الطلبات الجديدة" : "New order alerts",
                },
                {
                  key: "stockAlerts" as const,
                  label: language === "ar" ? "تنبيهات نفاد المخزون" : "Low stock alerts",
                },
                {
                  key: "marketing" as const,
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
                    onChange={(e) => {
                      setForm((f) => ({ ...f, [item.key]: e.target.checked }));
                      toast(
                        e.target.checked
                          ? language === "ar"
                            ? "✔ تم التفعيل"
                            : "✔ Enabled"
                          : language === "ar"
                            ? "تم الإيقاف"
                            : "Disabled",
                        e.target.checked ? "success" : "info"
                      );
                    }}
                    className="h-5 w-5 accent-[var(--color-primary,#c9a96e)]"
                  />
                </label>
              ))}
            </Card>
          )}

          {section === "language" && (
            <Card variant="panel" padding="lg">
              <p className="text-gray-500 text-sm mb-4">
                {language === "ar"
                  ? "لغة الواجهة تُدار من زر اللغة في الشريط العلوي."
                  : "Interface language is controlled from the header language toggle."}
              </p>
              <Button
                variant="soft"
                onClick={() =>
                  toast(
                    language === "ar"
                      ? "✔ استخدم أيقونة اللغة في الأعلى للتبديل فوراً"
                      : "✔ Use the header language icon to switch instantly",
                    "info"
                  )
                }
              >
                {language === "ar" ? "فهمت" : "Got it"}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
