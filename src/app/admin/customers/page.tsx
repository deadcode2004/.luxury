"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Ban } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AdminCustomers() {
  const { language } = useLanguage();

  const mockCustomers = [
    { id: "CUST-101", name: "Ahmed Abdullah", email: "ahmed@example.com", joined: "2026-01-15", orders: 12, spent: "4,500 SAR", status: "active" },
    { id: "CUST-102", name: "Sarah Khaled", email: "sarah@example.com", joined: "2026-05-22", orders: 3, spent: "1,200 SAR", status: "active" },
    { id: "CUST-103", name: "Mohammed Z.", email: "mohammed@example.com", joined: "2026-08-10", orders: 0, spent: "0 SAR", status: "inactive" },
  ];

  return (
    <Table
      toolbar={
        <TableToolbar>
          <SearchInput
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
      {mockCustomers.map((customer, idx) => (
        <TableRow key={idx}>
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
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title={language === "ar" ? "إرسال بريد" : "Send Email"}
              >
                <Mail size={18} />
              </button>
              <button
                className="text-gray-400 hover:text-red-500 transition-colors"
                title={language === "ar" ? "حظر العميل" : "Ban Customer"}
              >
                <Ban size={18} />
              </button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
