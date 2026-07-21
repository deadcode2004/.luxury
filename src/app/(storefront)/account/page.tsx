"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Package, UserCircle, MapPin } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import StatusBadge from "@/components/ui/StatusBadge";
import Badge from "@/components/ui/Badge";
import DashboardShell from "@/components/layout/DashboardShell";
import Table, { TableRow, TableCell } from "@/components/ui/Table";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import AuthModal from "@/components/auth/AuthModal";
import AvatarUploader from "@/components/account/AvatarUploader";
import { displayPersonName } from "@/lib/i18n/localeText";
import { cn } from "@/lib/cn";

type Tab = "orders" | "profile" | "addresses";

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
  const { language } = useLanguage();
  const { user, loading: authLoading, updateProfile, logout, ready } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("orders");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "profile" || tab === "orders" || tab === "addresses") {
      setActiveTab(tab);
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

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;
    const parts = (user.name || "").trim().split(/\s+/);
    setForm({
      first_name: user.first_name || parts[0] || "",
      last_name: user.last_name || parts.slice(1).join(" ") || "",
      email: user.email || "",
      phone: user.phone || "",
    });
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

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (!user) {
      setAuthOpen(true);
      toast(language === "ar" ? "سجّل الدخول أولاً" : "Please sign in first", "warning");
      return;
    }

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

      <div className="max-w-5xl">
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
              <Card variant="panel" padding="lg">
                <h2 className="text-2xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                  {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
                </h2>
                {!user && ready && (
                  <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-secondary">
                    {language === "ar"
                      ? "أنت تتصفح كزائر. سجّل الدخول لحفظ بياناتك."
                      : "You're browsing as a guest. Sign in to save your profile."}
                  </div>
                )}
                {user ? (
                  <div className="mb-8 max-w-2xl rounded-2xl border border-surface/60 bg-surface/20 p-4 sm:p-5">
                    <AvatarUploader fallbackLabel={welcomeName} />
                  </div>
                ) : null}
                <form
                  onSubmit={saveProfile}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl"
                >
                  <FormField
                    label={language === "ar" ? "الاسم الأول" : "First Name"}
                    error={errors.first_name}
                  >
                    <Input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
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
                      onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
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
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="text-start dir-ltr"
                    />
                  </FormField>
                  <div className="md:col-span-2 pt-4 flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      variant="secondary"
                      size="lg"
                      loading={saving || authLoading}
                      disabled={saving}
                    >
                      {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                    </Button>
                    {!user && (
                      <Button type="button" variant="outline" size="lg" onClick={() => setAuthOpen(true)}>
                        {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
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
