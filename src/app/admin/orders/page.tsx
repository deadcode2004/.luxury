"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Filter, Eye, Edit, Trash2 } from "lucide-react";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      
      {/* Header Actions */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder={language === "ar" ? "ابحث برقم الطلب أو اسم العميل..." : "Search by Order ID or Customer..."}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg h-10 px-4 rtl:pl-10 ltr:pr-10 focus:outline-none focus:border-primary transition-colors text-sm"
          />
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-gray-400" />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors w-full sm:w-auto justify-center">
          <Filter size={16} />
          {language === "ar" ? "تصفية" : "Filter"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
            <tr>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "رقم الطلب" : "Order ID"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "العميل" : "Customer"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "التاريخ" : "Date"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "المنتجات" : "Items"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الإجمالي" : "Total"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الحالة" : "Status"}</th>
              <th className="font-bold py-3 px-6 text-center">{language === "ar" ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockOrders.map((order, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-bold text-secondary">{order.id}</td>
                <td className="py-4 px-6 text-gray-600">{order.customer}</td>
                <td className="py-4 px-6 text-gray-500">{order.date}</td>
                <td className="py-4 px-6 text-gray-500">{order.items}</td>
                <td className="py-4 px-6 font-bold text-secondary">{order.total}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 flex items-center justify-center gap-3">
                  <button className="text-gray-400 hover:text-primary transition-colors" title={language === "ar" ? "عرض التفاصيل" : "View Details"}>
                    <Eye size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors" title={language === "ar" ? "تعديل الحالة" : "Edit Status"}>
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex justify-center">
        <p className="text-sm text-gray-400">Showing 5 of 124 orders</p>
      </div>
    </div>
  );
}
