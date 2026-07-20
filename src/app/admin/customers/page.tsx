"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Mail } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  ApiRequestError,
  fetchOwnerCustomers,
  type ApiCustomer,
} from "@/lib/api/owner";
import { useAutoFetch } from "@/hooks/useAutoFetch";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

export default function AdminCustomers() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) return;
      if (!options?.silent) setLoading(true);
      try {
        const list = await fetchOwnerCustomers(token, query);
        setCustomers(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!options?.silent) {
          toast(
            err instanceof ApiRequestError
              ? err.message
              : language === "ar"
                ? "تعذر تحميل العملاء"
                : "Failed to load customers",
            "danger"
          );
        }
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [token, query, language, toast]
  );

  useAutoFetch(load, { domains: ["customers", "orders", "dashboard"] });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        String(c.id).includes(q)
    );
  }, [customers, query]);

  return (
    <Table
      toolbar={
        <TableToolbar>
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === "ar" ? "ابحث عن عميل..." : "Search for a customer..."}
          />
        </TableToolbar>
      }
      headers={[
        language === "ar" ? "العميل" : "Customer",
        language === "ar" ? "تاريخ الانضمام" : "Joined",
        language === "ar" ? "الطلبات" : "Orders",
        language === "ar" ? "إجمالي المصروفات" : "Total Spent",
        language === "ar" ? "الحالة" : "Status",
        language === "ar" ? "إجراءات" : "Actions",
      ]}
    >
      {loading && customers.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-gray-400 py-10">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </TableCell>
        </TableRow>
      ) : filtered.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-gray-400 py-10">
            {language === "ar" ? "لا يوجد عملاء" : "No customers yet"}
          </TableCell>
        </TableRow>
      ) : (
        filtered.map((customer) => {
          const status = customer.is_active === false ? "inactive" : "active";
          return (
            <TableRow key={customer.id}>
              <TableCell>
                <span className="font-bold text-secondary block">{customer.name}</span>
                <span className="text-xs text-gray-400">{customer.email}</span>
              </TableCell>
              <TableCell className="text-gray-500">{formatDate(customer.created_at)}</TableCell>
              <TableCell className="font-medium text-gray-600">
                {customer.orders_count ?? 0}
              </TableCell>
              <TableCell className="font-bold text-secondary">
                {Number(customer.spent ?? 0).toLocaleString()} EGP
              </TableCell>
              <TableCell>
                <StatusBadge status={status} uppercase />
              </TableCell>
              <TableCell align="center">
                <a
                  href={`mailto:${customer.email}`}
                  className="inline-flex text-gray-400 hover:text-blue-500 active:scale-95 transition-all"
                  title={language === "ar" ? "إرسال بريد" : "Send Email"}
                >
                  <Mail size={18} />
                </a>
              </TableCell>
            </TableRow>
          );
        })
      )}
    </Table>
  );
}
