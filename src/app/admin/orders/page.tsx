"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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

type Order = {
  id: string;
  customer: string;
  date: string;
  total: string;
  status: string;
  items: number;
};

const INITIAL: Order[] = [
  { id: "#ORD-9025", customer: "Sarah Ahmed", date: "2026-10-15", total: "1,250 SAR", status: "pending", items: 3 },
  { id: "#ORD-9024", customer: "Mohammed K.", date: "2026-10-14", total: "450 SAR", status: "processing", items: 1 },
  { id: "#ORD-9023", customer: "Lina Mahmoud", date: "2026-10-12", total: "3,200 SAR", status: "delivered", items: 5 },
  { id: "#ORD-9022", customer: "Omar Sami", date: "2026-10-10", total: "890 SAR", status: "delivered", items: 2 },
  { id: "#ORD-9021", customer: "Fatima Ali", date: "2026-10-09", total: "150 SAR", status: "cancelled", items: 1 },
];

const STATUSES = ["pending", "processing", "delivered", "cancelled"] as const;

export default function AdminOrders() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState(INITIAL);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState("pending");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

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
        {filtered.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-bold text-secondary">{order.id}</TableCell>
            <TableCell className="text-gray-600">{order.customer}</TableCell>
            <TableCell className="text-gray-500">{order.date}</TableCell>
            <TableCell className="text-gray-500">{order.items}</TableCell>
            <TableCell className="font-bold text-secondary">{order.total}</TableCell>
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
        ))}
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
              toast(language === "ar" ? "تم إعادة التصفية" : "Filters cleared", "info");
            }}
          >
            {language === "ar" ? "مسح" : "Clear"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFilterOpen(false);
              toast(language === "ar" ? "✔ تم تطبيق التصفية" : "✔ Filters applied", "success");
            }}
          >
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
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{language === "ar" ? "رقم الطلب" : "Order ID"}</span>
              <span className="font-bold">{viewOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{language === "ar" ? "العميل" : "Customer"}</span>
              <span>{viewOrder.customer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{language === "ar" ? "المنتجات" : "Items"}</span>
              <span>{viewOrder.items}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">{language === "ar" ? "الحالة" : "Status"}</span>
              <StatusBadge status={viewOrder.status} uppercase />
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">{language === "ar" ? "الإجمالي" : "Total"}</span>
              <span className="font-bold text-secondary">{viewOrder.total}</span>
            </div>
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
              setSaving(true);
              await new Promise((r) => setTimeout(r, 350));
              setOrders((prev) =>
                prev.map((o) => (o.id === editOrder.id ? { ...o, status: nextStatus } : o))
              );
              setSaving(false);
              setEditOrder(null);
              toast(
                language === "ar" ? "✔ تم تحديث حالة الطلب" : "✔ Order status updated",
                "success"
              );
            }}
          >
            <p className="text-sm text-gray-500">
              {editOrder.id} · {editOrder.customer}
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
