"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminCoupons() {
  const { language } = useLanguage();

  const mockCoupons = [
    { code: "SUMMER20", discount: "20%", type: "Percentage", uses: 45, maxUses: 100, expiry: "2026-12-31", status: "active" },
    { code: "WELCOME", discount: "50 SAR", type: "Fixed", uses: 120, maxUses: null, expiry: "2026-12-31", status: "active" },
    { code: "EID50", discount: "50%", type: "Percentage", uses: 500, maxUses: 500, expiry: "2026-06-30", status: "expired" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder={language === "ar" ? "ابحث برمز الكوبون..." : "Search by coupon code..."}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg h-10 px-4 rtl:pl-10 ltr:pr-10 focus:outline-none focus:border-primary transition-colors text-sm"
          />
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-gray-400" />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold hover:bg-primary hover:text-secondary transition-colors w-full sm:w-auto justify-center shadow-md">
          <Plus size={16} />
          {language === "ar" ? "إضافة كوبون جديد" : "Add New Coupon"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
            <tr>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الرمز" : "Code"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الخصم" : "Discount"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "النوع" : "Type"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الاستخدامات" : "Uses"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "تاريخ الانتهاء" : "Expiry"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الحالة" : "Status"}</th>
              <th className="font-bold py-3 px-6 text-center">{language === "ar" ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockCoupons.map((coupon, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-primary bg-primary/5 rounded-lg inline-block m-2 px-3">{coupon.code}</td>
                <td className="py-4 px-6 font-bold text-secondary">{coupon.discount}</td>
                <td className="py-4 px-6 text-gray-500">{coupon.type}</td>
                <td className="py-4 px-6 text-gray-600">
                  {coupon.uses} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}
                </td>
                <td className="py-4 px-6 text-gray-500">{coupon.expiry}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    coupon.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {coupon.status.toUpperCase()}
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
