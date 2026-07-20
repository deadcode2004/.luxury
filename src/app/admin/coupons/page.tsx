"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import Select from "@/components/ui/Select";
import {
  ApiRequestError,
  createCoupon,
  deleteCoupon,
  fetchOwnerCoupons,
  updateCoupon,
  type ApiCoupon,
} from "@/lib/api/owner";

export default function AdminCoupons() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<ApiCoupon[]>([]);
  // Start false so SSR HTML matches the first client paint.
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCoupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    code: "",
    value: "",
    type: "percentage" as "percentage" | "fixed",
    maxUses: "",
    expiry: "",
    isActive: true,
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setCoupons(await fetchOwnerCoupons(token, query));
    } catch (err) {
      toast(
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "تعذر تحميل الكوبونات"
            : "Failed to load coupons",
        "danger"
      );
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [token, query, language, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      code: "",
      value: "",
      type: "percentage",
      maxUses: "",
      expiry: "",
      isActive: true,
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (coupon: ApiCoupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      value: String(coupon.value),
      type: coupon.type,
      maxUses: coupon.max_uses != null ? String(coupon.max_uses) : "",
      expiry: coupon.expires_at || "",
      isActive: coupon.is_active,
    });
    setErrors({});
    setModalOpen(true);
  };

  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = language === "ar" ? "الرمز مطلوب" : "Code required";
    if (!form.value.trim()) next.value = language === "ar" ? "القيمة مطلوبة" : "Value required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        max_uses: form.maxUses ? Number(form.maxUses) : null,
        expires_at: form.expiry || null,
        is_active: form.isActive,
      };
      if (editing) {
        await updateCoupon(token, editing.id, body);
        toast(language === "ar" ? "✔ تم تحديث الكوبون" : "✔ Coupon updated", "success");
      } else {
        await createCoupon(token, body);
        toast(language === "ar" ? "✔ تم إنشاء الكوبون" : "✔ Coupon created", "success");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : "Save failed", "danger");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!token || deleteId == null) return;
    setDeleting(true);
    try {
      await deleteCoupon(token, deleteId);
      toast(language === "ar" ? "✔ تم حذف الكوبون" : "✔ Coupon deleted", "success");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : "Delete failed", "danger");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-secondary">
            {language === "ar" ? "كوبونات الخصم" : "Discount Coupons"}
          </h2>
          <p className="text-sm text-gray-500">
            {language === "ar" ? "بيانات حقيقية من قاعدة البيانات" : "Live data from the database"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

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
        {loading || !hasFetched ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-400 py-10">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </TableCell>
          </TableRow>
        ) : coupons.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-400 py-10">
              {language === "ar" ? "لا توجد كوبونات" : "No coupons yet"}
            </TableCell>
          </TableRow>
        ) : (
          coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell>
                <span className="font-mono font-bold text-primary bg-primary/5 rounded-lg inline-block px-3 py-1">
                  {coupon.code}
                </span>
              </TableCell>
              <TableCell className="font-bold text-secondary">
                {coupon.type === "percentage" ? `${coupon.value}%` : `${coupon.value} SAR`}
              </TableCell>
              <TableCell className="text-gray-500">
                {coupon.type === "percentage"
                  ? language === "ar"
                    ? "نسبة"
                    : "Percentage"
                  : language === "ar"
                    ? "ثابت"
                    : "Fixed"}
              </TableCell>
              <TableCell className="text-gray-600">
                {coupon.uses}
                {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
              </TableCell>
              <TableCell className="text-gray-500">{coupon.expires_at || "—"}</TableCell>
              <TableCell>
                <StatusBadge status={coupon.status} uppercase />
              </TableCell>
              <TableCell align="center">
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(coupon)}
                    className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(coupon.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing
            ? language === "ar"
              ? "تعديل كوبون"
              : "Edit coupon"
            : language === "ar"
              ? "كوبون جديد"
              : "New coupon"
        }
      >
        <form onSubmit={(e) => void saveCoupon(e)} className="flex flex-col gap-4">
          <FormField label={language === "ar" ? "الرمز" : "Code"} error={errors.code}>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="uppercase"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={language === "ar" ? "النوع" : "Type"}>
              <Select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as "percentage" | "fixed",
                  }))
                }
              >
                <option value="percentage">
                  {language === "ar" ? "نسبة مئوية" : "Percentage"}
                </option>
                <option value="fixed">{language === "ar" ? "مبلغ ثابت" : "Fixed"}</option>
              </Select>
            </FormField>
            <FormField label={language === "ar" ? "القيمة" : "Value"} error={errors.value}>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={language === "ar" ? "أقصى استخدامات" : "Max uses"}>
              <Input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder={language === "ar" ? "بدون حد" : "Unlimited"}
              />
            </FormField>
            <FormField label={language === "ar" ? "تاريخ الانتهاء" : "Expiry"}>
              <Input
                type="date"
                value={form.expiry}
                onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
              />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="accent-primary"
            />
            {language === "ar" ? "نشط" : "Active"}
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" variant="secondary" loading={saving}>
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        loading={deleting}
        title={language === "ar" ? "حذف الكوبون؟" : "Delete coupon?"}
        description={
          language === "ar"
            ? "سيتم حذف الكوبون نهائياً من قاعدة البيانات."
            : "This coupon will be permanently deleted."
        }
        confirmLabel={language === "ar" ? "حذف" : "Delete"}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
