"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import Textarea from "@/components/ui/Textarea";
import FormField from "@/components/ui/FormField";
import Select from "@/components/ui/Select";
import CategoryCombobox from "@/components/admin/CategoryCombobox";
import ImageUploadField from "@/components/admin/ImageUploadField";
import {
  ApiRequestError,
  applyDiscount,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchOwnerCategories,
  fetchOwnerInventory,
  inferDiscount,
  resolveCategory,
  updateCategory,
  updateProduct,
  type ApiCategory,
  type ApiProduct,
} from "@/lib/api/owner";

type FormState = {
  nameAr: string;
  brandAr: string;
  categoryText: string;
  categoryId: number | null;
  basePrice: string;
  discountType: "none" | "fixed" | "percent";
  discountValue: string;
  stock: string;
  descriptionAr: string;
  ingredientsAr: string;
  usageAr: string;
  image: string;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  nameAr: "",
  brandAr: "",
  categoryText: "",
  categoryId: null,
  basePrice: "",
  discountType: "none",
  discountValue: "",
  stock: "10",
  descriptionAr: "",
  ingredientsAr: "",
  usageAr: "",
  image: "",
  isNew: true,
  isFeatured: false,
  isBestSeller: false,
  isActive: true,
});

function slugCode(name: string) {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "product";
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}

export default function AdminInventory() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(emptyForm);

  const [editCat, setEditCat] = useState<ApiCategory | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [deleteCat, setDeleteCat] = useState<ApiCategory | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [inv, cats] = await Promise.all([
        fetchOwnerInventory(token, query),
        fetchOwnerCategories(token),
      ]);
      setProducts(inv);
      setCategories(cats);
    } catch (err) {
      toast(
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "تعذر تحميل المخزون"
            : "Failed to load inventory",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  }, [token, query, language, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const previewPrice = useMemo(() => {
    const base = Number(form.basePrice);
    const value = Number(form.discountValue || 0);
    return applyDiscount(base, form.discountType, value);
  }, [form.basePrice, form.discountType, form.discountValue]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (product: ApiProduct) => {
    const disc = inferDiscount(product.price, product.old_price);
    setEditing(product);
    setForm({
      nameAr: product.name?.ar || "",
      brandAr: product.brand?.ar || "",
      categoryText: product.category?.name?.ar || "",
      categoryId: product.category_id,
      basePrice: String(disc.basePrice),
      discountType: disc.discountType,
      discountValue: disc.discountValue ? String(disc.discountValue) : "",
      stock: String(product.stock),
      descriptionAr: product.description?.ar || "",
      ingredientsAr: (product.ingredients?.ar || []).join("\n"),
      usageAr: product.usage?.ar || "",
      image: product.image || "",
      isNew: product.is_new,
      isFeatured: product.is_featured,
      isBestSeller: product.is_best_seller,
      isActive: product.is_active,
    });
    setErrors({});
    setModalOpen(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const next: Record<string, string> = {};
    if (!form.nameAr.trim()) next.nameAr = language === "ar" ? "اسم المنتج مطلوب" : "Name required";
    if (!form.brandAr.trim()) next.brandAr = language === "ar" ? "العلامة مطلوبة" : "Brand required";
    if (!form.categoryText.trim()) {
      next.category = language === "ar" ? "القسم مطلوب" : "Category required";
    }
    if (!form.image.trim()) next.image = language === "ar" ? "الصورة مطلوبة" : "Image required";
    const base = Number(form.basePrice);
    if (!Number.isFinite(base) || base < 0) {
      next.basePrice = language === "ar" ? "سعر غير صالح" : "Invalid price";
    }
    const stock = Number(form.stock);
    if (Number.isNaN(stock) || stock < 0) {
      next.stock = language === "ar" ? "مخزون غير صالح" : "Invalid stock";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      let categoryId = form.categoryId;
      if (!categoryId) {
        const resolved = await resolveCategory(token, form.categoryText.trim());
        categoryId = resolved.id;
        setCategories((prev) =>
          prev.some((c) => c.id === resolved.id) ? prev : [...prev, resolved]
        );
      }

      const { price, old_price } = applyDiscount(
        base,
        form.discountType,
        Number(form.discountValue || 0)
      );

      const ingredients = form.ingredientsAr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const body = {
        category_id: categoryId,
        name: { ar: form.nameAr.trim() },
        brand: { ar: form.brandAr.trim() },
        description: form.descriptionAr.trim()
          ? { ar: form.descriptionAr.trim() }
          : null,
        ingredients: ingredients.length ? { ar: ingredients } : null,
        usage: form.usageAr.trim() ? { ar: form.usageAr.trim() } : null,
        price,
        old_price,
        image: form.image,
        stock,
        is_new: form.isNew,
        is_featured: form.isFeatured,
        is_best_seller: form.isBestSeller,
        is_active: form.isActive,
      };

      if (editing) {
        await updateProduct(token, editing.id, body);
        toast(language === "ar" ? "✔ تم حفظ التعديلات" : "✔ Product updated", "success");
      } else {
        await createProduct(token, {
          ...body,
          code: slugCode(form.nameAr),
        });
        toast(language === "ar" ? "✔ تمت إضافة المنتج" : "✔ Product created", "success");
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      toast(
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "تعذر حفظ المنتج"
            : "Failed to save product",
        "danger"
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!token || deleteId == null) return;
    setDeleting(true);
    try {
      await deleteProduct(token, deleteId);
      toast(language === "ar" ? "✔ تم حذف المنتج" : "✔ Product deleted", "success");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : "Delete failed", "danger");
    } finally {
      setDeleting(false);
    }
  };

  const saveCategoryEdit = async () => {
    if (!token || !editCat || !editCatName.trim()) return;
    setCatSaving(true);
    try {
      const updated = await updateCategory(token, editCat.id, {
        name: { ar: editCatName.trim() },
      });
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (form.categoryId === updated.id) {
        setForm((f) => ({ ...f, categoryText: updated.name.ar }));
      }
      setEditCat(null);
      toast(language === "ar" ? "✔ تم تحديث القسم" : "✔ Category updated", "success");
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : "Update failed", "danger");
    } finally {
      setCatSaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!token || !deleteCat) return;
    setCatSaving(true);
    try {
      await deleteCategory(token, deleteCat.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteCat.id));
      if (form.categoryId === deleteCat.id) {
        setForm((f) => ({ ...f, categoryId: null }));
      }
      setDeleteCat(null);
      toast(language === "ar" ? "✔ تم حذف القسم" : "✔ Category deleted", "success");
    } catch (err) {
      toast(
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "تعذر حذف القسم"
            : "Failed to delete category",
        "danger"
      );
    } finally {
      setCatSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">
            {language === "ar" ? "إدارة المخزون" : "Inventory"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {language === "ar"
              ? "منتجات حقيقية من قاعدة البيانات"
              : "Live products from the database"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button variant="secondary" size="md" onClick={openCreate}>
            <Plus size={18} />
            {language === "ar" ? "إضافة منتج" : "Add Product"}
          </Button>
        </div>
      </div>

      <Table
        toolbar={
          <TableToolbar>
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === "ar" ? "بحث في المنتجات..." : "Search products..."}
            />
          </TableToolbar>
        }
        headers={
          language === "ar"
            ? ["الكود", "المنتج", "القسم", "المخزون", "السعر", "الحالة", ""]
            : ["Code", "Product", "Category", "Stock", "Price", "Status", ""]
        }
      >
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-400 py-10">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </TableCell>
          </TableRow>
        ) : products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-400 py-10">
              {language === "ar" ? "لا توجد منتجات" : "No products yet"}
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-xs">{product.code}</TableCell>
              <TableCell className="font-bold text-secondary">
                {product.name?.[language] || product.name?.ar}
              </TableCell>
              <TableCell>
                {product.category?.name?.[language] || product.category?.name?.ar || "—"}
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {product.price.toLocaleString()} SAR
                {product.old_price ? (
                  <span className="ms-2 text-xs text-gray-400 line-through">
                    {product.old_price.toLocaleString()}
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
                <StatusBadge status={product.inventory_status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(product.id)}
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
              ? "تعديل منتج"
              : "Edit Product"
            : language === "ar"
              ? "إضافة منتج"
              : "Add Product"
        }
        className="max-w-3xl"
      >
        <form onSubmit={(e) => void saveProduct(e)} className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pe-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={language === "ar" ? "اسم المنتج (عربي)" : "Product name (Arabic)"} error={errors.nameAr}>
              <Input
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              />
            </FormField>
            <FormField label={language === "ar" ? "العلامة التجارية (عربي)" : "Brand (Arabic)"} error={errors.brandAr}>
              <Input
                value={form.brandAr}
                onChange={(e) => setForm((f) => ({ ...f, brandAr: e.target.value }))}
              />
            </FormField>
          </div>

          <FormField label={language === "ar" ? "القسم" : "Category"} error={errors.category}>
            <CategoryCombobox
              categories={categories}
              valueText={form.categoryText}
              selectedId={form.categoryId}
              onChangeText={(text) => setForm((f) => ({ ...f, categoryText: text }))}
              onSelect={(cat) =>
                setForm((f) => ({
                  ...f,
                  categoryId: cat?.id ?? null,
                  categoryText: cat?.name?.ar ?? f.categoryText,
                }))
              }
              onEdit={(cat) => {
                setEditCat(cat);
                setEditCatName(cat.name?.ar || "");
              }}
              onDelete={(cat) => setDeleteCat(cat)}
            />
            <p className="mt-1 text-[11px] text-gray-400">
              {language === "ar"
                ? "أدخل الاسم بالعربية — يُترجم للإنجليزية مرة واحدة ويُحفظ في قاعدة البيانات"
                : "Enter Arabic name — translated to English once and stored in the database"}
            </p>
          </FormField>

          <FormField label={language === "ar" ? "صورة المنتج" : "Product image"} error={errors.image}>
            <ImageUploadField
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              folder="products"
              error={errors.image}
            />
          </FormField>

          <FormField label={language === "ar" ? "وصف المنتج" : "Description"}>
            <Textarea
              rows={3}
              value={form.descriptionAr}
              onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
              placeholder={language === "ar" ? "اكتب الوصف بالعربية..." : "Write description in Arabic..."}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label={language === "ar" ? "المكونات (سطر لكل مكوّن)" : "Ingredients (one per line)"}
            >
              <Textarea
                rows={4}
                value={form.ingredientsAr}
                onChange={(e) => setForm((f) => ({ ...f, ingredientsAr: e.target.value }))}
              />
            </FormField>
            <FormField label={language === "ar" ? "طريقة الاستخدام" : "How to use"}>
              <Textarea
                rows={4}
                value={form.usageAr}
                onChange={(e) => setForm((f) => ({ ...f, usageAr: e.target.value }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label={language === "ar" ? "السعر الأساسي" : "Base price"} error={errors.basePrice}>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
              />
            </FormField>
            <FormField label={language === "ar" ? "نوع الخصم" : "Discount type"}>
              <Select
                value={form.discountType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discountType: e.target.value as FormState["discountType"],
                  }))
                }
              >
                <option value="none">{language === "ar" ? "بدون خصم" : "No discount"}</option>
                <option value="fixed">{language === "ar" ? "مبلغ ثابت" : "Fixed amount"}</option>
                <option value="percent">{language === "ar" ? "نسبة مئوية %" : "Percentage %"}</option>
              </Select>
            </FormField>
            <FormField
              label={
                form.discountType === "percent"
                  ? language === "ar"
                    ? "قيمة الخصم %"
                    : "Discount %"
                  : language === "ar"
                    ? "قيمة الخصم"
                    : "Discount value"
              }
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                disabled={form.discountType === "none"}
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
              />
            </FormField>
          </div>

          <div className="rounded-xl bg-surface/40 border border-surface px-4 py-3 text-sm text-secondary/70 flex flex-wrap gap-4">
            <span>
              {language === "ar" ? "سعر البيع:" : "Selling price:"}{" "}
              <strong className="text-secondary">{previewPrice.price.toLocaleString()} SAR</strong>
            </span>
            {previewPrice.old_price ? (
              <span>
                {language === "ar" ? "قبل الخصم:" : "Before:"}{" "}
                <span className="line-through">{previewPrice.old_price.toLocaleString()} SAR</span>
              </span>
            ) : null}
          </div>

          <FormField label={language === "ar" ? "المخزون" : "Stock"} error={errors.stock}>
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            />
          </FormField>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                ["isNew", language === "ar" ? "جديد" : "New"],
                ["isFeatured", language === "ar" ? "مميز" : "Featured"],
                ["isBestSeller", language === "ar" ? "الأكثر مبيعاً" : "Best seller"],
                ["isActive", language === "ar" ? "نشط" : "Active"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium cursor-pointer hover:border-primary/40"
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" variant="secondary" loading={saving}>
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editCat)}
        onClose={() => setEditCat(null)}
        title={language === "ar" ? "تعديل القسم" : "Edit category"}
      >
        <div className="flex flex-col gap-4">
          <FormField label={language === "ar" ? "اسم القسم (عربي)" : "Category name (Arabic)"}>
            <Input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} />
          </FormField>
          <p className="text-xs text-gray-400">
            {language === "ar"
              ? "عند تغيير الاسم العربي تُحدَّث الترجمة الإنجليزية تلقائياً مرة واحدة."
              : "Changing the Arabic name re-translates English once automatically."}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditCat(null)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="secondary" loading={catSaving} onClick={() => void saveCategoryEdit()}>
              {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        loading={deleting}
        title={language === "ar" ? "حذف المنتج؟" : "Delete product?"}
        description={
          language === "ar"
            ? "سيتم حذف المنتج نهائياً من قاعدة البيانات."
            : "This product will be permanently deleted from the database."
        }
        confirmLabel={language === "ar" ? "حذف" : "Delete"}
        onConfirm={() => void confirmDelete()}
      />

      <ConfirmDialog
        open={Boolean(deleteCat)}
        onClose={() => setDeleteCat(null)}
        loading={catSaving}
        title={language === "ar" ? "حذف القسم؟" : "Delete category?"}
        description={
          language === "ar"
            ? "لا يمكن حذف قسم مرتبط بمنتجات."
            : "Categories with products cannot be deleted."
        }
        confirmLabel={language === "ar" ? "حذف" : "Delete"}
        onConfirm={() => void confirmDeleteCategory()}
      />
    </div>
  );
}
