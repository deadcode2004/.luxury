"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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
import CategoryCombobox from "@/components/admin/CategoryCombobox";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { LocaleInput, LocaleTextarea } from "@/components/admin/LocaleField";
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
import { pickLocale } from "@/lib/i18n/localeText";
import { useAutoFetch } from "@/hooks/useAutoFetch";
import { useRealtime } from "@/contexts/RealtimeContext";

type FormState = {
  nameAr: string;
  nameEn: string;
  brandAr: string;
  brandEn: string;
  categoryText: string;
  categoryEn: string;
  categoryId: number | null;
  basePrice: string;
  discountType: "none" | "fixed" | "percent";
  discountValue: string;
  stock: string;
  descriptionAr: string;
  descriptionEn: string;
  ingredientsAr: string;
  ingredientsEn: string;
  usageAr: string;
  usageEn: string;
  image: string;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isOffer: boolean;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  nameAr: "",
  nameEn: "",
  brandAr: "",
  brandEn: "",
  categoryText: "",
  categoryEn: "",
  categoryId: null,
  basePrice: "",
  discountType: "none",
  discountValue: "",
  stock: "10",
  descriptionAr: "",
  descriptionEn: "",
  ingredientsAr: "",
  ingredientsEn: "",
  usageAr: "",
  usageEn: "",
  image: "",
  isNew: true,
  isFeatured: false,
  isBestSeller: false,
  isOffer: false,
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
  const { signalLocal } = useRealtime();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  // Start false so SSR HTML matches the first client paint (avoids disabled hydration mismatch).
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
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

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!token) return;
    if (!options?.silent) setLoading(true);
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
      if (!options?.silent) setLoading(false);
      setHasFetched(true);
    }
  }, [token, query, language, toast]);

  useAutoFetch(load, { domains: ["products", "categories", "dashboard"] });

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
      nameEn: product.name?.en || "",
      brandAr: product.brand?.ar || "",
      brandEn: product.brand?.en || "",
      categoryText: product.category?.name?.ar || "",
      categoryEn: product.category?.name?.en || "",
      categoryId: product.category_id,
      basePrice: String(disc.basePrice),
      discountType: disc.discountType,
      discountValue: disc.discountValue ? String(disc.discountValue) : "",
      stock: String(product.stock),
      descriptionAr: product.description?.ar || "",
      descriptionEn: product.description?.en || "",
      ingredientsAr: (product.ingredients?.ar || []).join("\n"),
      ingredientsEn: (product.ingredients?.en || []).join("\n"),
      usageAr: product.usage?.ar || "",
      usageEn: product.usage?.en || "",
      image: product.image || "",
      isNew: product.is_new,
      isFeatured: product.is_featured,
      isBestSeller: product.is_best_seller,
      isOffer: Boolean(product.is_offer),
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
        is_offer: form.isOffer,
        is_active: form.isActive,
      };

      if (editing) {
        const saved = await updateProduct(token, editing.id, body);
        setEditing(saved);
        toast(language === "ar" ? "✔ تم حفظ التعديلات" : "✔ Product updated", "success");
      } else {
        const created = await createProduct(token, {
          ...body,
          code: slugCode(form.nameAr),
        });
        setEditing(created);
        toast(language === "ar" ? "✔ تمت إضافة المنتج" : "✔ Product created", "success");
      }

      signalLocal(["products", "dashboard", "categories"]);
      setModalOpen(false);
      await load({ silent: true });
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
      signalLocal(["products", "dashboard"]);
      setDeleteId(null);
      await load({ silent: true });
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
        setForm((f) => ({
          ...f,
          categoryText: updated.name.ar,
          categoryEn: updated.name.en || "",
        }));
      }
      setEditCat(null);
      signalLocal(["categories", "products", "dashboard"]);
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
      signalLocal(["categories", "products", "dashboard"]);
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
        {loading || !hasFetched ? (
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
                {pickLocale(product.name, language)}
              </TableCell>
              <TableCell>
                {pickLocale(product.category?.name, language, "—")}
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {product.price.toLocaleString()} EGP
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
        size="2xl"
        title={
          editing
            ? language === "ar"
              ? "تعديل منتج"
              : "Edit Product"
            : language === "ar"
              ? "إضافة منتج"
              : "Add Product"
        }
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => setModalOpen(false)}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              form="product-form"
              variant="secondary"
              className="w-full sm:w-auto"
              loading={saving}
            >
              {language === "ar" ? "حفظ المنتج" : "Save product"}
            </Button>
          </div>
        }
      >
        <form
          id="product-form"
          onSubmit={(e) => void saveProduct(e)}
          className="flex flex-col gap-5 sm:gap-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            <div className="lg:col-span-4">
              <FormField
                label={language === "ar" ? "صورة المنتج" : "Product image"}
                error={errors.image}
              >
                <ImageUploadField
                  value={form.image}
                  onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                  folder="products"
                  error={errors.image}
                />
              </FormField>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
              <p className="text-xs text-secondary/50 leading-relaxed">
                {language === "ar"
                  ? "أدخل النصوص بالعربية — عند الحفظ تُترجم للإنجليزية تلقائياً. بدّل لغة اللوحة لعرض الترجمة داخل نفس الحقول."
                  : "Edit content in Arabic. English is auto-translated on save — switch the dashboard language to see it in the same fields."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  label={language === "ar" ? "اسم المنتج" : "Product name"}
                  error={errors.nameAr}
                >
                  <LocaleInput
                    ar={form.nameAr}
                    en={form.nameEn}
                    onArChange={(nameAr) => setForm((f) => ({ ...f, nameAr, nameEn: "" }))}
                  />
                </FormField>
                <FormField
                  label={language === "ar" ? "العلامة التجارية" : "Brand"}
                  error={errors.brandAr}
                >
                  <LocaleInput
                    ar={form.brandAr}
                    en={form.brandEn}
                    onArChange={(brandAr) => setForm((f) => ({ ...f, brandAr, brandEn: "" }))}
                  />
                </FormField>
              </div>

              <FormField label={language === "ar" ? "القسم" : "Category"} error={errors.category}>
                <CategoryCombobox
                  categories={categories}
                  valueText={form.categoryText}
                  valueEn={form.categoryEn}
                  selectedId={form.categoryId}
                  onChangeText={(text) =>
                    setForm((f) => ({ ...f, categoryText: text, categoryEn: "" }))
                  }
                  onSelect={(cat) =>
                    setForm((f) => ({
                      ...f,
                      categoryId: cat?.id ?? null,
                      categoryText: cat?.name?.ar ?? f.categoryText,
                      categoryEn: cat?.name?.en ?? "",
                    }))
                  }
                  onEdit={(cat) => {
                    setEditCat(cat);
                    setEditCatName(cat.name?.ar || "");
                  }}
                  onDelete={(cat) => setDeleteCat(cat)}
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
                  {language === "ar"
                    ? "أدخل الاسم بالعربية — يُترجم للإنجليزية تلقائياً عند الحفظ"
                    : "Enter the Arabic name while the dashboard is in Arabic — English fills in after save"}
                </p>
              </FormField>

              <FormField label={language === "ar" ? "وصف المنتج" : "Description"}>
                <LocaleTextarea
                  rows={3}
                  ar={form.descriptionAr}
                  en={form.descriptionEn}
                  onArChange={(descriptionAr) =>
                    setForm((f) => ({ ...f, descriptionAr, descriptionEn: "" }))
                  }
                  placeholder={
                    language === "ar" ? "اكتب الوصف بالعربية..." : "Switch to Arabic to edit…"
                  }
                />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              label={language === "ar" ? "المكونات (سطر لكل مكوّن)" : "Ingredients (one per line)"}
            >
              <LocaleTextarea
                rows={4}
                ar={form.ingredientsAr}
                en={form.ingredientsEn}
                onArChange={(ingredientsAr) =>
                  setForm((f) => ({ ...f, ingredientsAr, ingredientsEn: "" }))
                }
              />
            </FormField>
            <FormField label={language === "ar" ? "طريقة الاستخدام" : "How to use"}>
              <LocaleTextarea
                rows={4}
                ar={form.usageAr}
                en={form.usageEn}
                onArChange={(usageAr) => setForm((f) => ({ ...f, usageAr, usageEn: "" }))}
              />
            </FormField>
          </div>

          <div className="rounded-2xl border border-surface/80 bg-background/70 p-3 sm:p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary/45 mb-1">
              {language === "ar" ? "التسعير والمخزون" : "Pricing & stock"}
            </p>
            <p className="text-xs text-secondary/50 mb-3">
              {language === "ar"
                ? "يُحفظ السعر بالجنيه المصري (EGP) فقط. التحويل لـ SAR/USD يتم تلقائياً عند العرض للزائر."
                : "Prices are stored in EGP only. Conversion to SAR/USD happens at display time for visitors."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <FormField
                label={language === "ar" ? "السعر (ج.م)" : "Price (EGP)"}
                error={errors.basePrice}
              >
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                  placeholder="100"
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
                  className="h-12"
                >
                  <option value="none">{language === "ar" ? "بدون خصم" : "No discount"}</option>
                  <option value="fixed">{language === "ar" ? "مبلغ ثابت" : "Fixed amount"}</option>
                  <option value="percent">
                    {language === "ar" ? "نسبة مئوية %" : "Percentage %"}
                  </option>
                </Select>
              </FormField>
              <FormField
                label={
                  form.discountType === "percent"
                    ? language === "ar"
                      ? "قيمة الخصم %"
                      : "Discount %"
                    : language === "ar"
                      ? "قيمة الخصم (ج.م)"
                      : "Discount value (EGP)"
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
              <FormField label={language === "ar" ? "المخزون" : "Stock"} error={errors.stock}>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </FormField>
            </div>

            <div className="mt-3 rounded-xl bg-white/80 border border-gray-100 px-3 py-2.5 text-sm text-secondary/70 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                {language === "ar" ? "سعر البيع:" : "Selling price:"}{" "}
                <strong className="text-secondary">
                  {previewPrice.price.toLocaleString()} EGP
                </strong>
              </span>
              {previewPrice.old_price ? (
                <span>
                  {language === "ar" ? "قبل الخصم:" : "Before:"}{" "}
                  <span className="line-through">
                    {previewPrice.old_price.toLocaleString()} EGP
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {(
              [
                ["isNew", language === "ar" ? "جديد" : "New"],
                ["isFeatured", language === "ar" ? "مميز" : "Featured"],
                ["isBestSeller", language === "ar" ? "الأكثر مبيعاً" : "Best seller"],
                ["isOffer", language === "ar" ? "عرض" : "Offer"],
                ["isActive", language === "ar" ? "نشط" : "Active"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium cursor-pointer hover:border-primary/40 min-h-11"
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="accent-primary shrink-0"
                />
                <span className="leading-tight">{label}</span>
              </label>
            ))}
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editCat)}
        onClose={() => setEditCat(null)}
        title={language === "ar" ? "تعديل القسم" : "Edit category"}
      >
        <div className="flex flex-col gap-4">
          <FormField label={language === "ar" ? "اسم القسم" : "Category name"}>
            <LocaleInput
              ar={editCatName}
              en={editCat?.name?.en}
              onArChange={(v) => {
                setEditCatName(v);
                setEditCat((c) => (c ? { ...c, name: { ...c.name, ar: v, en: "" } } : c));
              }}
            />
          </FormField>
          <p className="text-xs text-gray-400">
            {language === "ar"
              ? "عدّل بالعربية — الترجمة الإنجليزية تتحدث تلقائياً بعد الحفظ. بدّل لغة اللوحة لعرض الإنجليزية في نفس الحقل."
              : "Edit in Arabic — English updates on save. Switch the dashboard language to see English in this field."}
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
