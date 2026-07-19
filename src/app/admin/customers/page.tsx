"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Mail, Ban, CheckCircle2 } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Customer = {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spent: string;
  status: string;
};

const INITIAL: Customer[] = [
  { id: "CUST-101", name: "Ahmed Abdullah", email: "ahmed@example.com", joined: "2026-01-15", orders: 12, spent: "4,500 SAR", status: "active" },
  { id: "CUST-102", name: "Sarah Khaled", email: "sarah@example.com", joined: "2026-05-22", orders: 3, spent: "1,200 SAR", status: "active" },
  { id: "CUST-103", name: "Mohammed Z.", email: "mohammed@example.com", joined: "2026-08-10", orders: 0, spent: "0 SAR", status: "inactive" },
];

export default function AdminCustomers() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [customers, setCustomers] = useState(INITIAL);
  const [query, setQuery] = useState("");
  const [banTarget, setBanTarget] = useState<Customer | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [banning, setBanning] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [customers, query]);

  return (
    <>
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
        {filtered.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <span className="font-bold text-secondary block">{customer.name}</span>
              <span className="text-xs text-gray-400">{customer.email}</span>
            </TableCell>
            <TableCell className="text-gray-500">{customer.joined}</TableCell>
            <TableCell className="font-medium text-gray-600">{customer.orders}</TableCell>
            <TableCell className="font-bold text-secondary">{customer.spent}</TableCell>
            <TableCell>
              <StatusBadge status={customer.status} uppercase />
            </TableCell>
            <TableCell align="center">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={busyId === customer.id}
                  className="text-gray-400 hover:text-blue-500 active:scale-95 transition-all disabled:opacity-40"
                  title={language === "ar" ? "إرسال بريد" : "Send Email"}
                  onClick={async () => {
                    setBusyId(customer.id);
                    await new Promise((r) => setTimeout(r, 400));
                    setBusyId(null);
                    toast(
                      language === "ar"
                        ? `✔ تم تجهيز رسالة إلى ${customer.email}`
                        : `✔ Email draft ready for ${customer.email}`,
                      "success"
                    );
                  }}
                >
                  <Mail size={18} />
                </button>
                {customer.status === "banned" ? (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-green-600 active:scale-95 transition-all"
                    title={language === "ar" ? "إلغاء الحظر" : "Unban"}
                    onClick={() => {
                      setCustomers((prev) =>
                        prev.map((c) =>
                          c.id === customer.id ? { ...c, status: "active" } : c
                        )
                      );
                      toast(
                        language === "ar" ? "✔ تم إلغاء حظر العميل" : "✔ Customer unbanned",
                        "success"
                      );
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500 active:scale-95 transition-all"
                    title={language === "ar" ? "حظر العميل" : "Ban Customer"}
                    onClick={() => setBanTarget(customer)}
                  >
                    <Ban size={18} />
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      <ConfirmDialog
        open={banTarget != null}
        onClose={() => setBanTarget(null)}
        loading={banning}
        title={language === "ar" ? "حظر العميل؟" : "Ban customer?"}
        description={
          banTarget
            ? language === "ar"
              ? `سيتم منع ${banTarget.name} من تسجيل الدخول والطلب.`
              : `${banTarget.name} will be blocked from signing in and ordering.`
            : undefined
        }
        confirmLabel={language === "ar" ? "حظر" : "Ban"}
        onConfirm={async () => {
          if (!banTarget) return;
          setBanning(true);
          await new Promise((r) => setTimeout(r, 350));
          setCustomers((prev) =>
            prev.map((c) => (c.id === banTarget.id ? { ...c, status: "banned" } : c))
          );
          setBanning(false);
          setBanTarget(null);
          toast(language === "ar" ? "✔ تم حظر العميل" : "✔ Customer banned", "success");
        }}
      />
    </>
  );
}
