"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Edit, Trash2 } from "lucide-react";
import Table, { TableToolbar, TableRow, TableCell } from "@/components/ui/Table";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AdminInventory() {
  const { language } = useLanguage();

  const mockProducts = [
    { id: "PRD-001", name: "Royal Oud", category: "Perfumes", stock: 45, price: "1,250 SAR", status: "active" },
    { id: "PRD-002", name: "Velvet Rose", category: "Perfumes", stock: 12, price: "890 SAR", status: "low_stock" },
    { id: "PRD-003", name: "Gold Serum", category: "Skincare", stock: 0, price: "450 SAR", status: "out_of_stock" },
  ];

  return (
    <Table
      toolbar={
        <TableToolbar>
          <SearchInput
            placeholder={language === "ar" ? "ابحث عن منتج..." : "Search for a product..."}
          />
          <Button variant="secondary" size="sm" className="w-full sm:w-auto rounded-lg">
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
      {mockProducts.map((product, idx) => (
        <TableRow key={idx}>
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
