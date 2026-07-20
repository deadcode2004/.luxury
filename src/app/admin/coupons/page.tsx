"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import Select from "@/components/ui/Select";

type Coupon = {
  code: string;
  discount: string;
  type: string;
  uses: number;
  maxUses: number | null;
  expiry: string;
  status: string;
};

const INITIAL: Coupon[] = [
  { code: "SUMMER20", discount: "20%", type: "Percentage", uses: 45, maxUses: 100, expiry: "2026-12-31", status: "active" },
  { code: "WELCOME", discount: "50 SAR", type: "Fixed", uses: 120, maxUses: null, expiry: "2026-12-31", status: "active" },
  { code: "EID50", discount: "50%", type: "Percentage", uses: 500, maxUses: 500, expiry: "2026-06-30", status: "expired" },
];

export default function AdminCoupons() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState(INITIAL);
  const [query, setQuery] = useState("");
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    code: "",
    discount: "",
    type: "Percentage",
    maxUses: "",
    expiry: "",
    status: "active",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) => c.code.toLowerCase().includes(q));
  }, [coupons, query]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      code: "",
      discount: "",
      type: "Percentage",
      maxUses: "",
      expiry: "2026-12-31",
      status: "active",
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discount: coupon.discount.replace(/\s*%|\s*SAR/g, ""),
      type: coupon.type,
      maxUses: coupon.maxUses != null ? String(coupon.maxUses) : "",
      expiry: coupon.expiry,
      status: coupon.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = language === "ar" ? "الرمز مطلوب" : "Code is required";
    if (!form.discount.trim()) next.discount = language === "ar" ? "الخصم مطلوب" : "Discount is required";
    if (!form.expiry.trim()) next.expiry = language === "ar" ? "تاريخ الانتهاء مطلوب" : "Expiry is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    const discount =
      form.type === "Percentage" ? `${form.discount.trim()}%` : `${form.discount.trim()} SAR`;
    const maxUses = form.maxUses ? Number(form.maxUses) : null;
    const payload: Coupon = {
      code: form.code.trim().toUpperCase(),
      discount,
      type: form.type,
      uses: editing?.uses ?? 0,
      maxUses: Number.isNaN(maxUses as number) ? null : maxUses,
      expiry: form.expiry,
      status: form.status,
    };

    if (editing) {
      setCoupons((prev) => prev.map((c) => (c.code === editing.code ? payload : c)));
      toast(language === "ar" ? "✔ تم تحديث الكوبون" : "✔ Coupon updated", "success");
    } else if (coupons.some((c) => c.code === payload.code)) {
      toast(language === "ar" ? "✖ رمز الكوبون مستخدم مسبقاً" : "✖ Coupon code already exists", "danger");
      setSaving(false);
      return;
    } else {
      setCoupons((prev) => [payload, ...prev]);
      toast(language === "ar" ? "✔ تم إنشاء الكوبون" : "✔ Coupon created", "success");
    }
    setSaving(false);
    setModalOpen(false);
  };

  return (
    <>
      <Table
        toolbar={
          <TableToolbar>
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                language === "ar" ? "ابحث برمز الكوبون..." : "Search by coupon code..."
              }
            />
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto rounded-lg"
              onClick={openCreate}
            >
              <Plus size={16} />
              {language === "ar" ? "إضافة كوبون جديد" : "Add New Coupon"}
            </Button>
          </TableToolbar>
        }
        headers={[
          language === "ar" ? "الرمز" : "Code",
          language === "ar" ? "الخصم" : "Discount",
          language === "ar" ? "النوع" : "Type",
          language === "ar" ? "الاستخدامات" : "Uses",
          language === "ar" ? "تاريخ الانتهاء" : "Expiry",
          language === "ar" ? "الحالة" : "Status",
          language === "ar" ? "إجراءات" : "Actions",
        ]}
      >
        {filtered.map((coupon) => (
          <TableRow key={coupon.code}>
            <TableCell>
              <span className="font-mono font-bold text-primary bg-primary/5 rounded-lg inline-block px-3 py-1">
                {coupon.code}
              </span>
            </TableCell>
            <TableCell className="font-bold text-secondary">{coupon.discount}</TableCell>
            <TableCell className="text-gray-500">{coupon.type}</TableCell>
            <TableCell className="text-gray-600">
              {coupon.uses}
              {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
            </TableCell>
            <TableCell className="text-gray-500">{coupon.expiry}</TableCell>
            <TableCell>
              <StatusBadge status={coupon.status} uppercase />
            </TableCell>
            <TableCell align="center">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="text-gray-400 hover:text-blue-500 active:scale-95 transition-all"
                  title={language === "ar" ? "تعديل" : "Edit"}
                  onClick={() => openEdit(coupon)}
                >
                  <Edit size={18} />
                </button>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 active:scale-95 transition-all"
                  title={language === "ar" ? "حذف" : "Delete"}
                  onClick={() => setDeleteCode(coupon.code)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => (!saving ? setModalOpen(false) : undefined)}
        title={
          editing
            ? language === "ar"
              ? "تعديل الكوبون"
              : "Edit Coupon"
            : language === "ar"
              ? "إضافة كوبون"
              : "Add Coupon"
        }
      >
        <form onSubmit={saveCoupon} className="flex flex-col gap-4">
          <FormField label={language === "ar" ? "الرمز" : "Code"} error={errors.code}>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              disabled={Boolean(editing)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={language === "ar" ? "النوع" : "Type"}>
              <Select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed</option>
              </Select>
            </FormField>
            <FormField label={language === "ar" ? "الخصم" : "Discount"} error={errors.discount}>
              <Input
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={language === "ar" ? "الحد الأقصى للاستخدام" : "Max Uses"}>
              <Input
                type="number"
                min={0}
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder={language === "ar" ? "بدون حد" : "Unlimited"}
              />
            </FormField>
            <FormField label={language === "ar" ? "تاريخ الانتهاء" : "Expiry"} error={errors.expiry}>
              <Input
                type="date"
                value={form.expiry}
                onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
              />
            </FormField>
          </div>
          <FormField label={language === "ar" ? "الحالة" : "Status"}>
            <Select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => setModalOpen(false)}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" variant="secondary" size="sm" loading={saving}>
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteCode != null}
        onClose={() => setDeleteCode(null)}
        loading={deleting}
        title={language === "ar" ? "حذف الكوبون؟" : "Delete coupon?"}
        description={
          language === "ar"
            ? "لن يتمكن العملاء من استخدام هذا الكوبون بعد الحذف."
            : "Customers will no longer be able to use this coupon."
        }
        confirmLabel={language === "ar" ? "حذف" : "Delete"}
        onConfirm={async () => {
          setDeleting(true);
          await new Promise((r) => setTimeout(r, 300));
          setCoupons((prev) => prev.filter((c) => c.code !== deleteCode));
          setDeleting(false);
          setDeleteCode(null);
          toast(language === "ar" ? "✔ تم حذف الكوبون" : "✔ Coupon deleted", "success");
        }}
      />
    </>
  );
}
