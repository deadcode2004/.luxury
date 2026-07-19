"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Filter, Eye, Edit } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/layout/Pagination";

export default function AdminOrders() {
  const { language } = useLanguage();

  const mockOrders = [
    { id: "#ORD-9025", customer: "Sarah Ahmed", date: "2026-10-15", total: "1,250 SAR", status: "pending", items: 3 },
    { id: "#ORD-9024", customer: "Mohammed K.", date: "2026-10-14", total: "450 SAR", status: "processing", items: 1 },
    { id: "#ORD-9023", customer: "Lina Mahmoud", date: "2026-10-12", total: "3,200 SAR", status: "delivered", items: 5 },
    { id: "#ORD-9022", customer: "Omar Sami", date: "2026-10-10", total: "890 SAR", status: "delivered", items: 2 },
    { id: "#ORD-9021", customer: "Fatima Ali", date: "2026-10-09", total: "150 SAR", status: "cancelled", items: 1 },
  ];

  return (
    <Table
      toolbar={
        <TableToolbar>
          <SearchInput
            placeholder={
              language === "ar"
                ? "ابحث برقم الطلب أو اسم العميل..."
                : "Search by Order ID or Customer..."
            }
          />
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter size={16} />
            {language === "ar" ? "تصفية" : "Filter"}
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
      footer={<Pagination showing={5} total={124} label="Showing 5 of 124 orders" />}
    >
      {mockOrders.map((order, idx) => (
        <TableRow key={idx}>
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
                className="text-gray-400 hover:text-primary transition-colors"
                title={language === "ar" ? "عرض التفاصيل" : "View Details"}
              >
                <Eye size={18} />
              </button>
              <button
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title={language === "ar" ? "تعديل الحالة" : "Edit Status"}
              >
                <Edit size={18} />
              </button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
