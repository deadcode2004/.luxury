"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Filter, Eye, Edit } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/layout/Pagination";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import Select from "@/components/ui/Select";
import {
  ApiRequestError,
  fetchOwnerOrders,
  updateOwnerOrderStatus,
  type ApiOrder,
} from "@/lib/api/owner";
import { displayPersonName } from "@/lib/i18n/localeText";
import { useAutoFetch } from "@/hooks/useAutoFetch";
import { useRealtime } from "@/contexts/RealtimeContext";

const STATUSES = ["pending", "processing", "delivered", "cancelled"] as const;

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

export default function AdminOrders() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  const { signalLocal } = useRealtime();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<ApiOrder | null>(null);
  const [editOrder, setEditOrder] = useState<ApiOrder | null>(null);
  const [nextStatus, setNextStatus] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) return;
      if (!options?.silent) setLoading(true);
      try {
        const list = await fetchOwnerOrders(token, {
          search: query,
          status: statusFilter,
        });
        setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!options?.silent) {
          toast(
            err instanceof ApiRequestError
              ? err.message
              : language === "ar"
                ? "تعذر تحميل الطلبات"
                : "Failed to load orders",
            "danger"
          );
        }
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [token, query, statusFilter, language, toast]
  );

  useAutoFetch(load, { domains: ["orders", "dashboard"] });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const customer = displayPersonName(o.customer, language, "");
      const matchesQuery =
        !q ||
        o.number.toLowerCase().includes(q) ||
        customer.toLowerCase().includes(q) ||
        (o.customer?.email || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter, language]);

  return (
    <>
      <Table
        toolbar={
          <TableToolbar>
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                language === "ar"
                  ? "ابحث برقم الطلب أو اسم العميل..."
                  : "Search by Order ID or Customer..."
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setFilterOpen(true)}
            >
              <Filter size={16} />
              {language === "ar" ? "تصفية" : "Filter"}
              {statusFilter !== "all" ? ` · ${statusFilter}` : ""}
            </Button>
          </TableToolbar>
        }
        headers={[
          language === "ar" ? "رقم الطلب" : "Order ID",
          language === "ar" ? "العميل" : "Customer",
          language === "ar" ? "التاريخ" : "Date",
          language === "ar" ? "المنتجات" : "Items",
          language === "ar" ? "الإجمالي" : "Total",
          language === "ar" ? "الحالة" : "Status",
          language === "ar" ? "إجراءات" : "Actions",
        ]}
        footer={
          <Pagination
            showing={filtered.length}
            total={orders.length}
            label={
              language === "ar"
                ? `عرض ${filtered.length} من ${orders.length} طلبات`
                : `Showing ${filtered.length} of ${orders.length} orders`
            }
          />
        }
      >
        {loading && orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-400 py-10">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </TableCell>
          </TableRow>
        ) : filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-400 py-10">
              {language === "ar" ? "لا توجد طلبات" : "No orders yet"}
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-bold text-secondary">{order.number}</TableCell>
              <TableCell className="text-gray-600">
                {displayPersonName(order.customer, language, "") ||
                  [order.billing_snapshot?.first_name, order.billing_snapshot?.last_name]
                    .filter(Boolean)
                    .join(" ") ||
                  (order.billing_snapshot?.is_guest
                    ? language === "ar"
                      ? "زائر"
                      : "Guest"
                    : "—")}
              </TableCell>
              <TableCell className="text-gray-500">{formatDate(order.placed_at)}</TableCell>
              <TableCell className="text-gray-500">{order.items_count ?? "—"}</TableCell>
              <TableCell className="font-bold text-secondary">
                {Number(order.total).toLocaleString()} {order.currency || "EGP"}
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} uppercase />
              </TableCell>
              <TableCell align="center">
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-primary active:scale-95 transition-all"
                    title={language === "ar" ? "عرض التفاصيل" : "View Details"}
                    onClick={() => setViewOrder(order)}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-blue-500 active:scale-95 transition-all"
                    title={language === "ar" ? "تعديل الحالة" : "Edit Status"}
                    onClick={() => {
                      setEditOrder(order);
                      setNextStatus(order.status);
                    }}
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>

      <Modal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title={language === "ar" ? "تصفية الطلبات" : "Filter Orders"}
      >
        <FormField label={language === "ar" ? "الحالة" : "Status"}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">{language === "ar" ? "الكل" : "All"}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setFilterOpen(false);
            }}
          >
            {language === "ar" ? "مسح" : "Clear"}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setFilterOpen(false)}>
            {language === "ar" ? "تطبيق" : "Apply"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={viewOrder != null}
        onClose={() => setViewOrder(null)}
        title={language === "ar" ? "تفاصيل الطلب" : "Order Details"}
      >
        {viewOrder && (
          <div className="space-y-4 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">
                  {language === "ar" ? "رقم الطلب" : "Order ID"}
                </span>
                <span className="font-bold text-end">{viewOrder.number}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">
                  {language === "ar" ? "العميل" : "Customer"}
                </span>
                <span className="text-end">
                  {displayPersonName(viewOrder.customer, language, "") ||
                    [viewOrder.billing_snapshot?.first_name, viewOrder.billing_snapshot?.last_name]
                      .filter(Boolean)
                      .join(" ") ||
                    (viewOrder.billing_snapshot?.is_guest
                      ? language === "ar"
                        ? "زائر"
                        : "Guest"
                      : "—")}
                </span>
              </div>
              {viewOrder.billing_snapshot?.phone ? (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 shrink-0">
                    {language === "ar" ? "الهاتف" : "Phone"}
                  </span>
                  <span className="font-medium dir-ltr text-end">
                    {viewOrder.billing_snapshot.phone}
                  </span>
                </div>
              ) : null}
              {viewOrder.billing_snapshot?.email ? (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 shrink-0">
                    {language === "ar" ? "البريد" : "Email"}
                  </span>
                  <span className="text-end break-all">{viewOrder.billing_snapshot.email}</span>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">
                  {language === "ar" ? "المنتجات" : "Items"}
                </span>
                <span>{viewOrder.items_count ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 shrink-0">
                  {language === "ar" ? "الحالة" : "Status"}
                </span>
                <StatusBadge status={viewOrder.status} uppercase />
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3 gap-4">
                <span className="text-gray-500 shrink-0">
                  {language === "ar" ? "الإجمالي" : "Total"}
                </span>
                <span className="font-bold text-secondary">
                  {Number(viewOrder.total).toLocaleString()} {viewOrder.currency || "EGP"}
                </span>
              </div>
            </div>

            {viewOrder.shipping_address ? (
              <div className="rounded-xl border border-surface bg-background/60 p-4 space-y-2">
                <h4 className="font-bold text-secondary">
                  {language === "ar" ? "عنوان الشحن" : "Shipping address"}
                </h4>
                <p className="text-secondary leading-relaxed">
                  {viewOrder.shipping_address.full_address || "—"}
                </p>
                <p className="text-gray-500">
                  {[
                    viewOrder.shipping_address.city,
                    viewOrder.shipping_address.state_name,
                    viewOrder.shipping_address.country_name ||
                      viewOrder.shipping_address.country_code,
                    viewOrder.shipping_address.zip_code,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </Modal>

      <Modal
        open={editOrder != null}
        onClose={() => (!saving ? setEditOrder(null) : undefined)}
        title={language === "ar" ? "تعديل حالة الطلب" : "Update Order Status"}
      >
        {editOrder && (
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!token) return;
              setSaving(true);
              try {
                const updated = await updateOwnerOrderStatus(token, editOrder.id, nextStatus);
                setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
                signalLocal(["orders", "dashboard", "customers"]);
                setEditOrder(null);
                toast(
                  language === "ar" ? "✔ تم تحديث حالة الطلب" : "✔ Order status updated",
                  "success"
                );
              } catch (err) {
                toast(
                  err instanceof ApiRequestError
                    ? err.message
                    : language === "ar"
                      ? "تعذر تحديث الحالة"
                      : "Failed to update status",
                  "danger"
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            <p className="text-sm text-gray-500">
              {editOrder.number} · {displayPersonName(editOrder.customer, language, "")}
            </p>
            <FormField label={language === "ar" ? "الحالة الجديدة" : "New Status"}>
              <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => setEditOrder(null)}
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" variant="secondary" size="sm" loading={saving}>
                {language === "ar" ? "حفظ" : "Save"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
