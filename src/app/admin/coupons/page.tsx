"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Edit, Trash2 } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AdminCoupons() {
  const { language } = useLanguage();

  const mockCoupons = [
    { code: "SUMMER20", discount: "20%", type: "Percentage", uses: 45, maxUses: 100, expiry: "2026-12-31", status: "active" },
    { code: "WELCOME", discount: "50 SAR", type: "Fixed", uses: 120, maxUses: null as number | null, expiry: "2026-12-31", status: "active" },
    { code: "EID50", discount: "50%", type: "Percentage", uses: 500, maxUses: 500, expiry: "2026-06-30", status: "expired" },
  ];

  return (
    <Table
      toolbar={
        <TableToolbar>
          <SearchInput
            placeholder={
              language === "ar" ? "ابحث برمز الكوبون..." : "Search by coupon code..."
            }
          />
          <Button variant="secondary" size="sm" className="w-full sm:w-auto rounded-lg">
            <Plus size={16} />
            {language === "ar" ? "إضافة كوبون جديد" : "Add New Coupon"}
          </Button>
        </TableToolbar>
      }
      headers={[
        language === "ar" ? "الرمز" : "Code",
        language === "ar" ? "الخصم" : "Discount",
        language === "ar" ? "النوع" : "Type",
        language === "ar" ? "الاستخدامات" : "Uses",
        language === "ar" ? "تاريخ الانتهاء" : "Expiry",
        language === "ar" ? "الحالة" : "Status",
        language === "ar" ? "إجراءات" : "Actions",
      ]}
    >
      {mockCoupons.map((coupon, idx) => (
        <TableRow key={idx}>
          <TableCell>
            <span className="font-mono font-bold text-primary bg-primary/5 rounded-lg inline-block px-3 py-1">
              {coupon.code}
            </span>
          </TableCell>
          <TableCell className="font-bold text-secondary">{coupon.discount}</TableCell>
          <TableCell className="text-gray-500">{coupon.type}</TableCell>
          <TableCell className="text-gray-600">
            {coupon.uses}
            {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
          </TableCell>
          <TableCell className="text-gray-500">{coupon.expiry}</TableCell>
          <TableCell>
            <StatusBadge status={coupon.status} uppercase />
          </TableCell>
          <TableCell align="center">
            <div className="flex items-center justify-center gap-3">
              <button
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title={language === "ar" ? "تعديل" : "Edit"}
              >
                <Edit size={18} />
              </button>
              <button
                className="text-gray-400 hover:text-red-500 transition-colors"
                title={language === "ar" ? "حذف" : "Delete"}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
