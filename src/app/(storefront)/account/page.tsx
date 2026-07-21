"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Package, UserCircle, MapPin, User, Lock, Bell, Globe, ShieldCheck, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FormField from "@/components/ui/FormField";
import StatusBadge from "@/components/ui/StatusBadge";
import Badge from "@/components/ui/Badge";
import DashboardShell from "@/components/layout/DashboardShell";
import SidebarNav from "@/components/layout/SidebarNav";
import Table, { TableRow, TableCell } from "@/components/ui/Table";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import AuthModal from "@/components/auth/AuthModal";
import AvatarUploader from "@/components/account/AvatarUploader";
import { displayPersonName } from "@/lib/i18n/localeText";
import { cn } from "@/lib/cn";
import type { AppLanguage } from "@/lib/i18n/language";

type Tab = "orders" | "profile" | "addresses";
type SettingsSection = "personal" | "security" | "notifications" | "language";

const REGION_KEY = "paradise:user-region";

type Address = {
  id: number;
  name: string;
  text: string;
  isDefault: boolean;
};

const INITIAL_ORDERS = [
  { id: "#ORD-9021", date: "12 Oct 2026", status: "delivered", total: "1,250.00", currency: "EGP" },
  { id: "#ORD-9022", date: "05 Nov 2026", status: "processing", total: "840.00", currency: "EGP" },
];

const INITIAL_ADDRESSES: Address[] = [
  { id: 1, name: "Home", text: "123 Olaya St, Riyadh, Saudi Arabia", isDefault: true },
  { id: 2, name: "Work", text: "King Abdullah Financial District, Riyadh", isDefault: false },
];

export default function AccountPage() {
  const { language, setLanguage } = useLanguage();
  const {
    user,
    loading: authLoading,
    updateProfile,
    changePassword,
    updateNotifications,
    logout,
    ready,
  } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("personal");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "profile" || tab === "orders" || tab === "addresses") {
      setActiveTab(tab);
    }
    const section = searchParams.get("section");
    if (
      section === "personal" ||
      section === "security" ||
      section === "notifications" ||
      section === "language"
    ) {
      setActiveTab("profile");
      setSettingsSection(section);
    }
  }, [searchParams]);
  const [authOpen, setAuthOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({ name: "", text: "" });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [selectedOrder, setSelectedOrder] = useState<(typeof INITIAL_ORDERS)[number] | null>(null);
  const [region, setRegion] = useState("EG");

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REGION_KEY);
      if (saved) setRegion(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const parts = (user.name || "").trim().split(/\s+/);
    setForm((f) => ({
      ...f,
      first_name: user.first_name || parts[0] || "",
      last_name: user.last_name || parts.slice(1).join(" ") || "",
      email: user.email || "",
      phone: user.phone || "",
      notify_orders: user.notify_orders ?? true,
      notify_stock: user.notify_stock ?? true,
      notify_marketing: user.notify_marketing ?? false,
    }));
  }, [user]);

  const welcomeName = useMemo(() => {
    if (!user) return language === "ar" ? "زائر" : "Guest";
    return (
      displayPersonName(user, language, "") ||
      `${form.first_name} ${form.last_name}`.trim() ||
      user.email
    );
  }, [user, language, form.first_name, form.last_name]);

  const [welcomePhase, setWelcomePhase] = useState<"hidden" | "enter" | "shown" | "leave">(
    "hidden"
  );

  useEffect(() => {
    if (!ready || !user) {
      setWelcomePhase("hidden");
      return;
    }

    const storageKey = `paradise:account-welcome:${user.id}`;
    try {
      if (sessionStorage.getItem(storageKey)) {
        setWelcomePhase("hidden");
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Private mode / blocked storage — still show once for this mount only.
    }

    setWelcomePhase("enter");
    const enterId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setWelcomePhase("shown"));
    });
    const leaveId = window.setTimeout(() => setWelcomePhase("leave"), 2600);
    const hideId = window.setTimeout(() => setWelcomePhase("hidden"), 3200);

    return () => {
      window.cancelAnimationFrame(enterId);
      window.clearTimeout(leaveId);
      window.clearTimeout(hideId);
    };
  }, [ready, user?.id]);

  const requireAuth = () => {
    if (user) return true;
    setAuthOpen(true);
    toast(language === "ar" ? "سجّل الدخول أولاً" : "Please sign in first", "warning");
    return false;
  };

  const savePersonal = async () => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) {
      next.first_name = language === "ar" ? "الاسم الأول مطلوب" : "First name is required";
    }
    if (!form.last_name.trim()) {
      next.last_name = language === "ar" ? "اسم العائلة مطلوب" : "Last name is required";
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = language === "ar" ? "البريد غير صالح" : "Invalid email";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    if (!requireAuth()) return;

    setSaving(true);
    try {
      await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSecurity = async () => {
    const next: Record<string, string> = {};
    if (!form.current_password) {
      next.current_password = language === "ar" ? "مطلوب" : "Required";
    }
    if (form.new_password.length < 8) {
      next.new_password = language === "ar" ? "8 أحرف على الأقل" : "Min 8 characters";
    }
    if (form.new_password !== form.confirm_password) {
      next.confirm_password = language === "ar" ? "غير متطابقة" : "Passwords do not match";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      toast(
        language === "ar" ? "يرجى تصحيح الحقول" : "Please fix the highlighted fields",
        "warning"
      );
      return;
    }
    if (!requireAuth()) return;

    setSaving(true);
    try {
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
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = async (
    key: "notify_orders" | "notify_stock" | "notify_marketing",
    value: boolean
  ) => {
    if (!requireAuth()) return;
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

  const showSettingsSave = settingsSection === "personal" || settingsSection === "security";

  const openAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({ name: address.name, text: address.text });
    } else {
      setEditingAddress(null);
      setAddressForm({ name: "", text: "" });
    }
    setAddressErrors({});
    setAddressModalOpen(true);
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!addressForm.name.trim()) {
      next.name = language === "ar" ? "اسم العنوان مطلوب" : "Label is required";
    }
    if (!addressForm.text.trim()) {
      next.text = language === "ar" ? "العنوان مطلوب" : "Address is required";
    }
    setAddressErrors(next);
    if (Object.keys(next).length) return;

    setAddressSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddress.id
            ? { ...a, name: addressForm.name.trim(), text: addressForm.text.trim() }
            : a
        )
      );
      toast(language === "ar" ? "✔ تم تحديث العنوان" : "✔ Address updated", "success");
    } else {
      setAddresses((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: addressForm.name.trim(),
          text: addressForm.text.trim(),
          isDefault: prev.length === 0,
        },
      ]);
      toast(language === "ar" ? "✔ تمت إضافة العنوان" : "✔ Address added", "success");
    }
    setAddressSaving(false);
    setAddressModalOpen(false);
  };

  return (
    <DashboardShell
      links={[
        {
          key: "orders",
          name: { ar: "طلباتي", en: "My Orders" },
          icon: <Package size={20} />,
          onClick: () => setActiveTab("orders"),
        },
        {
          key: "profile",
          name: { ar: "إعدادات الحساب", en: "Profile Settings" },
          icon: <UserCircle size={20} />,
          onClick: () => setActiveTab("profile"),
        },
        {
          key: "addresses",
          name: { ar: "العناوين المحفوظة", en: "Saved Addresses" },
          icon: <MapPin size={20} />,
          onClick: () => setActiveTab("addresses"),
        },
      ]}
      activeKey={activeTab}
      brandHref="/account"
      brandLabel={
        <>
          ACCOUNT<span className="text-primary">.</span>
        </>
      }
      userName={welcomeName}
      userRole={language === "ar" ? "مستخدم" : "User"}
      settingsHref="/account?tab=profile"
      logoutHref="/login"
      logoutLabel={{ ar: "تسجيل الخروج", en: "Log Out" }}
      loginLabel={{ ar: "تسجيل الدخول", en: "Sign In" }}
      showLogin={!user}
      onLogin={() => setAuthOpen(true)}
      onLogout={() => setConfirmLogout(true)}
    >
      {welcomePhase !== "hidden" ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-24 z-[45] flex justify-center px-4"
          aria-live="polite"
        >
          <div
            className={cn(
              "min-w-[min(100%,18rem)] rounded-2xl border border-white/15 bg-secondary/92 px-6 py-4 text-center text-background shadow-floating backdrop-blur-xl",
              "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
              welcomePhase === "shown"
                ? "translate-y-0 scale-100 opacity-100"
                : welcomePhase === "leave"
                  ? "-translate-y-3 scale-[0.97] opacity-0"
                  : "translate-y-4 scale-95 opacity-0"
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-background/55">
              {language === "ar" ? "مرحباً بعودتك" : "Welcome back"}
            </p>
            <p className="mt-1.5 text-lg font-bold tracking-tight truncate max-w-[16rem] mx-auto">
              {welcomeName}
            </p>
          </div>
        </div>
      ) : null}

      <div className="max-w-6xl">
            {activeTab === "orders" && (
              <Card variant="panel" padding="lg">
                <h2 className="text-2xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                  {language === "ar" ? "سجل الطلبات" : "Order History"}
                </h2>
                <Table
                  framed={false}
                  minWidth="600px"
                  headers={[
                    language === "ar" ? "رقم الطلب" : "Order ID",
                    language === "ar" ? "التاريخ" : "Date",
                    language === "ar" ? "الحالة" : "Status",
                    language === "ar" ? "الإجمالي" : "Total",
                    "",
                  ]}
                >
                  {INITIAL_ORDERS.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold text-secondary">{order.id}</TableCell>
                      <TableCell className="text-gray-500">{order.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="font-bold text-secondary">
                        {order.total} {order.currency || "EGP"}
                      </TableCell>
                      <TableCell align="end">
                        <button
                          type="button"
                          className="text-primary font-medium hover:underline transition-colors active:scale-95"
                          onClick={() => setSelectedOrder(order)}
                        >
                          {language === "ar" ? "عرض التفاصيل" : "View Details"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Card>
            )}

            {activeTab === "profile" && (
              <div className="flex flex-col gap-4 sm:gap-6 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 w-full min-w-0">
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-secondary tracking-tight">
                      {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {language === "ar"
                        ? "إدارة بياناتك الشخصية والأمان والتفضيلات"
                        : "Manage your personal details, security, and preferences"}
                    </p>
                  </div>
                  {showSettingsSave ? (
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full sm:w-auto shrink-0"
                      loading={saving || authLoading}
                      disabled={saving}
                      onClick={() =>
                        void (settingsSection === "security" ? saveSecurity() : savePersonal())
                      }
                    >
                      <Save size={18} />
                      {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                    </Button>
                  ) : null}
                </div>

                <section className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-surface bg-white/70 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch w-full min-w-0">
                    <aside className="lg:col-span-4 min-w-0 w-full border-b lg:border-b-0 lg:border-e border-surface bg-background/50 p-3 sm:p-4">
                      <SidebarNav
                        variant="light"
                        activeKey={settingsSection}
                        items={[
                          {
                            key: "personal",
                            label:
                              language === "ar" ? "المعلومات الشخصية" : "Personal Information",
                            icon: <User size={18} />,
                            onClick: () => {
                              setErrors({});
                              setSettingsSection("personal");
                            },
                          },
                          {
                            key: "security",
                            label:
                              language === "ar" ? "الأمان وكلمة المرور" : "Security & Password",
                            icon: <Lock size={18} />,
                            onClick: () => {
                              setErrors({});
                              setSettingsSection("security");
                            },
                          },
                          {
                            key: "notifications",
                            label: language === "ar" ? "الإشعارات" : "Notifications",
                            icon: <Bell size={18} />,
                            onClick: () => {
                              setErrors({});
                              setSettingsSection("notifications");
                            },
                          },
                          {
                            key: "language",
                            label: language === "ar" ? "اللغة والمنطقة" : "Language & Region",
                            icon: <Globe size={18} />,
                            onClick: () => {
                              setErrors({});
                              setSettingsSection("language");
                            },
                          },
                        ]}
                      />
                    </aside>

                    <div className="lg:col-span-8 min-w-0 w-full flex flex-col">
                      {settingsSection === "personal" && (
                        <>
                          {!user && ready ? (
                            <div className="mx-5 sm:mx-6 mt-5 sm:mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-secondary">
                              {language === "ar"
                                ? "أنت تتصفح كزائر. سجّل الدخول لحفظ بياناتك."
                                : "You're browsing as a guest. Sign in to save your profile."}
                            </div>
                          ) : null}
                          {user ? (
                            <div className="bg-background/60 p-5 sm:p-6 border-b border-surface/70">
                              <AvatarUploader fallbackLabel={welcomeName} />
                            </div>
                          ) : null}
                          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              label={language === "ar" ? "الاسم الأول" : "First Name"}
                              error={errors.first_name}
                            >
                              <Input
                                type="text"
                                value={form.first_name}
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, first_name: e.target.value }))
                                }
                                aria-invalid={Boolean(errors.first_name)}
                              />
                            </FormField>
                            <FormField
                              label={language === "ar" ? "اسم العائلة" : "Last Name"}
                              error={errors.last_name}
                            >
                              <Input
                                type="text"
                                value={form.last_name}
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, last_name: e.target.value }))
                                }
                                aria-invalid={Boolean(errors.last_name)}
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
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, email: e.target.value }))
                                }
                                className="text-start dir-ltr"
                                aria-invalid={Boolean(errors.email)}
                              />
                            </FormField>
                            <FormField
                              className="md:col-span-2"
                              label={language === "ar" ? "رقم الهاتف" : "Phone Number"}
                            >
                              <Input
                                type="tel"
                                value={form.phone}
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, phone: e.target.value }))
                                }
                                className="text-start dir-ltr"
                              />
                            </FormField>
                            {!user ? (
                              <div className="md:col-span-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="lg"
                                  onClick={() => setAuthOpen(true)}
                                >
                                  {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </>
                      )}

                      {settingsSection === "security" && (
                        <div className="p-5 sm:p-6 flex flex-col gap-8 max-w-xl">
                          <div className="flex items-start gap-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <ShieldCheck size={20} />
                            </span>
                            <div className="min-w-0">
                              <h3 className="font-bold text-secondary">
                                {language === "ar" ? "حالة الحساب" : "Account status"}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {!user
                                  ? language === "ar"
                                    ? "سجّل الدخول لإدارة كلمة المرور"
                                    : "Sign in to manage your password"
                                  : user.is_active === false
                                    ? language === "ar"
                                      ? "الحساب غير نشط"
                                      : "Account is inactive"
                                    : language === "ar"
                                      ? "الحساب نشط ومحمي بكلمة مرور"
                                      : "Account is active and password-protected"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
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
                              label={
                                language === "ar" ? "كلمة المرور الحالية" : "Current Password"
                              }
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
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, new_password: e.target.value }))
                                }
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
                          </div>
                        </div>
                      )}

                      {settingsSection === "notifications" && (
                        <div className="p-5 sm:p-6 space-y-4">
                          {[
                            {
                              key: "notify_orders" as const,
                              label:
                                language === "ar"
                                  ? "تحديثات حالة الطلبات"
                                  : "Order status updates",
                            },
                            {
                              key: "notify_stock" as const,
                              label:
                                language === "ar"
                                  ? "تنبيهات عودة المنتج للمخزون"
                                  : "Back-in-stock alerts",
                            },
                            {
                              key: "notify_marketing" as const,
                              label:
                                language === "ar" ? "رسائل تسويقية وعروض" : "Marketing & offers",
                            },
                          ].map((item) => (
                            <label
                              key={item.key}
                              className="flex items-center justify-between gap-4 rounded-xl border border-surface px-4 py-3 hover:border-primary/40 transition-colors cursor-pointer"
                            >
                              <span className="font-medium text-secondary">{item.label}</span>
                              <input
                                type="checkbox"
                                checked={form[item.key]}
                                onChange={(e) =>
                                  void toggleNotification(item.key, e.target.checked)
                                }
                                className="h-5 w-5 accent-[var(--color-primary,#c9a96e)]"
                              />
                            </label>
                          ))}
                        </div>
                      )}

                      {settingsSection === "language" && (
                        <div className="p-5 sm:p-6 flex flex-col gap-6 max-w-xl">
                          <FormField label={language === "ar" ? "لغة الموقع" : "Site language"}>
                            <Select
                              className="h-12"
                              value={language}
                              onChange={(e) => {
                                const next = e.target.value as AppLanguage;
                                setLanguage(next);
                                toast(
                                  next === "ar"
                                    ? "✔ تم تغيير اللغة إلى العربية"
                                    : "✔ Language set to English",
                                  "success"
                                );
                              }}
                            >
                              <option value="ar">العربية</option>
                              <option value="en">English</option>
                            </Select>
                          </FormField>

                          <FormField label={language === "ar" ? "المنطقة" : "Region"}>
                            <Select
                              className="h-12"
                              value={region}
                              onChange={(e) => {
                                const next = e.target.value;
                                setRegion(next);
                                try {
                                  localStorage.setItem(REGION_KEY, next);
                                } catch {
                                  // ignore
                                }
                                toast(
                                  language === "ar" ? "✔ تم حفظ المنطقة" : "✔ Region saved",
                                  "success"
                                );
                              }}
                            >
                              <option value="EG">
                                {language === "ar" ? "مصر" : "Egypt"}
                              </option>
                              <option value="SA">
                                {language === "ar" ? "السعودية" : "Saudi Arabia"}
                              </option>
                              <option value="AE">
                                {language === "ar" ? "الإمارات" : "United Arab Emirates"}
                              </option>
                              <option value="KW">
                                {language === "ar" ? "الكويت" : "Kuwait"}
                              </option>
                              <option value="QA">
                                {language === "ar" ? "قطر" : "Qatar"}
                              </option>
                            </Select>
                          </FormField>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "addresses" && (
              <Card variant="panel" padding="lg">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-secondary">
                    {language === "ar" ? "عناويني" : "My Addresses"}
                  </h2>
                  <Button variant="soft" size="sm" onClick={() => openAddressModal()}>
                    {language === "ar" ? "+ إضافة عنوان" : "+ Add Address"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-100 rounded-xl p-6 bg-gray-50 relative group hover:border-primary transition-colors"
                    >
                      {address.isDefault && (
                        <Badge
                          variant="success"
                          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-[10px] rounded-md px-2"
                        >
                          {language === "ar" ? "الافتراضي" : "Default"}
                        </Badge>
                      )}
                      <h3 className="font-bold text-secondary mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {address.name}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {address.text}
                      </p>
                      <div className="flex gap-4 border-t border-gray-200 pt-4">
                        <button
                          type="button"
                          className="text-primary font-medium text-sm hover:underline transition-colors"
                          onClick={() => openAddressModal(address)}
                        >
                          {language === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button
                          type="button"
                          className="text-red-500 font-medium text-sm hover:underline transition-colors"
                          onClick={() => setDeleteAddressId(address.id)}
                        >
                          {language === "ar" ? "حذف" : "Remove"}
                        </button>
                        {!address.isDefault && (
                          <button
                            type="button"
                            className="text-gray-500 font-medium text-sm hover:text-primary hover:underline transition-colors ms-auto"
                            onClick={() => {
                              setAddresses((prev) =>
                                prev.map((a) => ({ ...a, isDefault: a.id === address.id }))
                              );
                              toast(
                                language === "ar"
                                  ? "✔ تم تعيين العنوان الافتراضي"
                                  : "✔ Default address updated",
                                "success"
                              );
                            }}
                          >
                            {language === "ar" ? "تعيين كافتراضي" : "Set default"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        loading={loggingOut}
        title={language === "ar" ? "تسجيل الخروج؟" : "Sign out?"}
        description={
          language === "ar" ? "سيتم إنهاء جلستك الحالية." : "Your current session will end."
        }
        confirmLabel={language === "ar" ? "تسجيل الخروج" : "Log Out"}
        onConfirm={async () => {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
            setConfirmLogout(false);
          }
        }}
      />

      <ConfirmDialog
        open={deleteAddressId != null}
        onClose={() => setDeleteAddressId(null)}
        title={language === "ar" ? "حذف العنوان؟" : "Delete address?"}
        description={
          language === "ar"
            ? "لن تتمكن من التراجع عن هذا الإجراء."
            : "This action cannot be undone."
        }
        confirmLabel={language === "ar" ? "حذف" : "Delete"}
        onConfirm={() => {
          setAddresses((prev) => prev.filter((a) => a.id !== deleteAddressId));
          setDeleteAddressId(null);
          toast(language === "ar" ? "✔ تم حذف العنوان" : "✔ Address removed", "success");
        }}
      />

      <Modal
        open={addressModalOpen}
        onClose={() => (!addressSaving ? setAddressModalOpen(false) : undefined)}
        title={
          editingAddress
            ? language === "ar"
              ? "تعديل العنوان"
              : "Edit Address"
            : language === "ar"
              ? "إضافة عنوان"
              : "Add Address"
        }
      >
        <form onSubmit={saveAddress} className="flex flex-col gap-4">
          <FormField
            label={language === "ar" ? "اسم العنوان" : "Label"}
            error={addressErrors.name}
          >
            <Input
              value={addressForm.name}
              onChange={(e) => setAddressForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={language === "ar" ? "المنزل، العمل..." : "Home, Work..."}
            />
          </FormField>
          <FormField
            label={language === "ar" ? "العنوان الكامل" : "Full Address"}
            error={addressErrors.text}
          >
            <Input
              value={addressForm.text}
              onChange={(e) => setAddressForm((f) => ({ ...f, text: e.target.value }))}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={addressSaving}
              onClick={() => setAddressModalOpen(false)}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" variant="secondary" size="sm" loading={addressSaving}>
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={selectedOrder != null}
        onClose={() => setSelectedOrder(null)}
        title={language === "ar" ? "تفاصيل الطلب" : "Order Details"}
      >
        {selectedOrder && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{language === "ar" ? "رقم الطلب" : "Order ID"}</span>
              <span className="font-bold text-secondary">{selectedOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{language === "ar" ? "التاريخ" : "Date"}</span>
              <span className="font-medium">{selectedOrder.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">{language === "ar" ? "الحالة" : "Status"}</span>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">{language === "ar" ? "الإجمالي" : "Total"}</span>
              <span className="font-bold text-secondary">
                {selectedOrder.total} {selectedOrder.currency || "EGP"}
              </span>
            </div>
            <Button
              variant="outline"
              fullWidth
              className="mt-2"
              onClick={() => {
                toast(
                  language === "ar"
                    ? "✔ سيتم إرسال فاتورة الطلب إلى بريدك"
                    : "✔ Invoice will be sent to your email",
                  "success"
                );
                setSelectedOrder(null);
              }}
            >
              {language === "ar" ? "طلب فاتورة" : "Request Invoice"}
            </Button>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
