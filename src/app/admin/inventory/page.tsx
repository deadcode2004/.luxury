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

type ProductRow = {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: string;
  status: string;
};

const INITIAL: ProductRow[] = [
  { id: "PRD-001", name: "Royal Oud", category: "Perfumes", stock: 45, price: "1,250 SAR", status: "active" },
  { id: "PRD-002", name: "Velvet Rose", category: "Perfumes", stock: 12, price: "890 SAR", status: "low_stock" },
  { id: "PRD-003", name: "Gold Serum", category: "Skincare", stock: 0, price: "450 SAR", status: "out_of_stock" },
];

function statusFromStock(stock: number): string {
  if (stock <= 0) return "out_of_stock";
  if (stock <= 15) return "low_stock";
  return "active";
}

export default function AdminInventory() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState(INITIAL);
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    category: "Perfumes",
    stock: "0",
    price: "",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", category: "Perfumes", stock: "10", price: "" });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (product: ProductRow) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      stock: String(product.stock),
      price: product.price.replace(/\s*SAR$/, ""),
    });
    setErrors({});
    setModalOpen(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = language === "ar" ? "اسم المنتج مطلوب" : "Name is required";
    if (!form.price.trim()) next.price = language === "ar" ? "السعر مطلوب" : "Price is required";
    const stock = Number(form.stock);
    if (Number.isNaN(stock) || stock < 0) {
      next.stock = language === "ar" ? "مخزون غير صالح" : "Invalid stock";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const price = `${form.price.trim()} SAR`;
    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name: form.name.trim(),
                category: form.category,
                stock,
                price,
                status: statusFromStock(stock),
              }
            : p
        )
      );
      toast(language === "ar" ? "✔ تم حفظ التعديلات" : "✔ Product updated", "success");
    } else {
      const id = `PRD-${String(products.length + 1).padStart(3, "0")}`;
      setProducts((prev) => [
        {
          id,
          name: form.name.trim(),
          category: form.category,
          stock,
          price,
          status: statusFromStock(stock),
        },
        ...prev,
      ]);
      toast(language === "ar" ? "✔ تم إنشاء المنتج" : "✔ Product created", "success");
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
              placeholder={language === "ar" ? "ابحث عن منتج..." : "Search for a product..."}
            />
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto rounded-lg"
              onClick={openCreate}
            >
              <Plus size={16} />
              {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
            </Button>
          </TableToolbar>
        }
        headers={[
          language === "ar" ? "المنتج" : "Product",
          language === "ar" ? "القسم" : "Category",
          language === "ar" ? "السعر" : "Price",
          language === "ar" ? "المخزون" : "Stock",
          language === "ar" ? "الحالة" : "Status",
          language === "ar" ? "إجراءات" : "Actions",
        ]}
      >
        {filtered.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <span className="font-bold text-secondary block">{product.name}</span>
              <span className="text-xs text-gray-400">{product.id}</span>
            </TableCell>
            <TableCell className="text-gray-600">{product.category}</TableCell>
            <TableCell className="font-bold text-secondary">{product.price}</TableCell>
            <TableCell className="font-medium text-gray-600">{product.stock}</TableCell>
            <TableCell>
              <StatusBadge
                status={product.status}
                label={product.status.replace("_", " ").toUpperCase()}
              />
            </TableCell>
            <TableCell align="center">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="text-gray-400 hover:text-blue-500 active:scale-95 transition-all"
                  title={language === "ar" ? "تعديل" : "Edit"}
                  onClick={() => openEdit(product)}
                >
                  <Edit size={18} />
                </button>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 active:scale-95 transition-all"
                  title={language === "ar" ? "حذف" : "Delete"}
                  onClick={() => setDeleteId(product.id)}
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
              ? "تعديل المنتج"
              : "Edit Product"
            : language === "ar"
              ? "إضافة منتج"
              : "Add Product"
        }
      >
        <form onSubmit={saveProduct} className="flex flex-col gap-4">
          <FormField label={language === "ar" ? "اسم المنتج" : "Product Name"} error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <FormField label={language === "ar" ? "القسم" : "Category"}>
            <Select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="Perfumes">Perfumes</option>
              <option value="Skincare">Skincare</option>
              <option value="Accessories">Accessories</option>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={language === "ar" ? "السعر" : "Price"} error={errors.price}>
              <Input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="1250"
              />
            </FormField>
            <FormField label={language === "ar" ? "المخزون" : "Stock"} error={errors.stock}>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </FormField>
          </div>
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
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        loading={deleting}
        title={language === "ar" ? "حذف المنتج؟" : "Delete product?"}
        description={
          language === "ar"
            ? "سيتم إزالة المنتج من المخزون فوراً."
            : "This product will be removed from inventory immediately."
        }
        confirmLabel={language === "ar" ? "حذف" : "Delete"}
        onConfirm={async () => {
          setDeleting(true);
          await new Promise((r) => setTimeout(r, 300));
          setProducts((prev) => prev.filter((p) => p.id !== deleteId));
          setDeleting(false);
          setDeleteId(null);
          toast(language === "ar" ? "✔ تم حذف المنتج" : "✔ Product deleted", "success");
        }}
      />
    </>
  );
}
