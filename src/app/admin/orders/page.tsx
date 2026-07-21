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
  fetchOwnerOrder,
  fetchOwnerOrders,
  updateOwnerOrderStatus,
  type ApiOrder,
} from "@/lib/api/owner";
import { displayPersonName } from "@/lib/i18n/localeText";
import { formatMoney } from "@/lib/format/currency";
import type { CurrencyCode } from "@/lib/format/currency";
import { useAutoFetch } from "@/hooks/useAutoFetch";
import { useRealtime } from "@/contexts/RealtimeContext";
import OrderDetailsView from "@/components/admin/OrderDetailsView";

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
  const [viewLoading, setViewLoading] = useState(false);
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

  const openOrderDetails = useCallback(
    async (order: ApiOrder) => {
      setViewOrder(order);
      if (!token) return;
      setViewLoading(true);
      try {
        const detailed = await fetchOwnerOrder(token, order.id);
        setViewOrder(detailed);
      } catch {
        // Keep list payload as a fallback if the detail request fails.
      } finally {
        setViewLoading(false);
      }
    },
    [token]
  );

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
                {formatMoney(Number(order.total), language, {
                  decimals: 2,
                  currency: (order.currency || "EGP") as CurrencyCode,
                  converted: true,
                })}
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
                    onClick={() => void openOrderDetails(order)}
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
        onClose={() => {
          setViewOrder(null);
          setViewLoading(false);
        }}
        title={language === "ar" ? "تفاصيل الطلب" : "Order Details"}
        size="xl"
      >
        {viewOrder && (
          <div className="relative">
            {viewLoading ? (
              <p className="text-xs text-gray-400 mb-3">
                {language === "ar" ? "جاري تحديث التفاصيل..." : "Refreshing details..."}
              </p>
            ) : null}
            <OrderDetailsView order={viewOrder} language={language} />
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
