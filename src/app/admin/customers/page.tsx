"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Mail, Ban } from "lucide-react";

export default function AdminCustomers() {
  const { language } = useLanguage();

  const mockCustomers = [
    { id: "CUST-101", name: "Ahmed Abdullah", email: "ahmed@example.com", joined: "2026-01-15", orders: 12, spent: "4,500 SAR", status: "active" },
    { id: "CUST-102", name: "Sarah Khaled", email: "sarah@example.com", joined: "2026-05-22", orders: 3, spent: "1,200 SAR", status: "active" },
    { id: "CUST-103", name: "Mohammed Z.", email: "mohammed@example.com", joined: "2026-08-10", orders: 0, spent: "0 SAR", status: "inactive" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder={language === "ar" ? "ابحث عن عميل..." : "Search for a customer..."}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg h-10 px-4 rtl:pl-10 ltr:pr-10 focus:outline-none focus:border-primary transition-colors text-sm"
          />
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
            <tr>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "العميل" : "Customer"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "تاريخ الانضمام" : "Joined"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الطلبات" : "Orders"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "إجمالي المصروفات" : "Total Spent"}</th>
              <th className="font-bold py-3 px-6 text-start">{language === "ar" ? "الحالة" : "Status"}</th>
              <th className="font-bold py-3 px-6 text-center">{language === "ar" ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockCustomers.map((customer, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-bold text-secondary block">{customer.name}</span>
                  <span className="text-xs text-gray-400">{customer.email}</span>
                </td>
                <td className="py-4 px-6 text-gray-500">{customer.joined}</td>
                <td className="py-4 px-6 font-medium text-gray-600">{customer.orders}</td>
                <td className="py-4 px-6 font-bold text-secondary">{customer.spent}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    customer.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {customer.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 flex items-center justify-center gap-3">
                  <button className="text-gray-400 hover:text-blue-500 transition-colors" title={language === "ar" ? "إرسال بريد" : "Send Email"}>
                    <Mail size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-red-500 transition-colors" title={language === "ar" ? "حظر العميل" : "Ban Customer"}>
                    <Ban size={18} />
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
