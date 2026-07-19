"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save, User, Lock, Bell, Globe } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import SidebarNav from "@/components/layout/SidebarNav";

export default function AdminSettings() {
  const { language } = useLanguage();

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
        <Button variant="secondary" size="md" className="w-full sm:w-auto">
          <Save size={18} />
          {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card variant="panel" padding="sm">
            <SidebarNav
              variant="light"
              activeKey="personal"
              items={[
                {
                  key: "personal",
                  label: language === "ar" ? "المعلومات الشخصية" : "Personal Information",
                  icon: <User size={18} />,
                  onClick: () => undefined,
                },
                {
                  key: "security",
                  label: language === "ar" ? "الأمان وكلمة المرور" : "Security & Password",
                  icon: <Lock size={18} />,
                  onClick: () => undefined,
                },
                {
                  key: "notifications",
                  label: language === "ar" ? "الإشعارات" : "Notifications",
                  icon: <Bell size={18} />,
                  onClick: () => undefined,
                },
                {
                  key: "language",
                  label: language === "ar" ? "اللغة والمنطقة" : "Language & Region",
                  icon: <Globe size={18} />,
                  onClick: () => undefined,
                },
              ]}
            />
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card variant="panel" padding="none" className="overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                A
              </div>
              <div>
                <h3 className="font-bold text-secondary text-lg">Admin User</h3>
                <p className="text-sm text-gray-500">Store Manager</p>
              </div>
              <Button variant="outline" size="sm" className="ms-auto">
                {language === "ar" ? "تغيير الصورة" : "Change Avatar"}
              </Button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label={language === "ar" ? "الاسم الأول" : "First Name"}>
                <Input defaultValue="Admin" className="h-12" />
              </FormField>
              <FormField label={language === "ar" ? "اسم العائلة" : "Last Name"}>
                <Input defaultValue="User" className="h-12" />
              </FormField>
              <FormField
                className="md:col-span-2"
                label={language === "ar" ? "البريد الإلكتروني" : "Email Address"}
              >
                <Input
                  type="email"
                  defaultValue="admin@paradise-store.com"
                  className="h-12 text-start dir-ltr"
                />
              </FormField>
              <FormField
                className="md:col-span-2"
                label={language === "ar" ? "رقم الهاتف" : "Phone Number"}
              >
                <Input
                  type="tel"
                  defaultValue="+966 50 123 4567"
                  className="h-12 text-start dir-ltr"
                />
              </FormField>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
