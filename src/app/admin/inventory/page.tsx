"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminInventory() {
  const { language } = useLanguage();

  const mockProducts = [
    { id: "PRD-001", name: "Royal Oud", category: "Perfumes", stock: 45, price: "1,250 SAR", status: "active" },
    { id: "PRD-002", name: "Velvet Rose", category: "Perfumes", stock: 12, price: "890 SAR", status: "low_stock" },
    { id: "PRD-003", name: "Gold Serum", category: "Skincare", stock: 0, price: "450 SAR", status: "out_of_stock" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder={language === "ar" ? "ابحث عن منتج..." : "Search for a product..."}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg h-10 px-4 rtl:pl-10 ltr:pr-10 focus:outline-none focus:border-primary transition-colors text-sm"
          />
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-gray-400" />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold hover:bg-primary hover:text-secondary transition-colors w-full sm:w-auto justify-center shadow-md">
          <Plus size={16} />
          {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
            <tr>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "المنتج" : "Product"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "القسم" : "Category"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "السعر" : "Price"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "المخزون" : "Stock"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الحالة" : "Status"}</th>
              <th className="font-bold py-3 px-6 text-center">{language === "ar" ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockProducts.map((product, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-bold text-secondary block">{product.name}</span>
                  <span className="text-xs text-gray-400">{product.id}</span>
                </td>
                <td className="py-4 px-6 text-gray-600">{product.category}</td>
                <td className="py-4 px-6 font-bold text-secondary">{product.price}</td>
                <td className="py-4 px-6 font-medium text-gray-600">{product.stock}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    product.status === 'active' ? 'bg-green-100 text-green-600' :
                    product.status === 'low_stock' ? 'bg-orange-100 text-orange-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {product.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 flex items-center justify-center gap-3">
                  <button className="text-gray-400 hover:text-blue-500 transition-colors" title={language === "ar" ? "تعديل" : "Edit"}>
                    <Edit size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-red-500 transition-colors" title={language === "ar" ? "حذف" : "Delete"}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
