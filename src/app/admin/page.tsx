"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Users, ShoppingBag, DollarSign, ChevronDown } from "lucide-react";

export default function AdminOverview() {
  const { language } = useLanguage();

  const stats = [
    {
      title: { ar: "إجمالي المبيعات", en: "Total Sales" },
      value: "124,500 SAR",
      trend: "+12.5%",
      isPositive: true,
      icon: <DollarSign size={24} className="text-green-600" />,
      bg: "bg-green-100",
    },
    {
      title: { ar: "الطلبات النشطة", en: "Active Orders" },
      value: "45",
      trend: "+5.2%",
      isPositive: true,
      icon: <ShoppingBag size={24} className="text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: { ar: "إجمالي العملاء", en: "Total Customers" },
      value: "1,204",
      trend: "+18.1%",
      isPositive: true,
      icon: <Users size={24} className="text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      title: { ar: "معدل التحويل", en: "Conversion Rate" },
      value: "3.2%",
      trend: "-1.1%",
      isPositive: false,
      icon: <TrendingUp size={24} className="text-orange-600" />,
      bg: "bg-orange-100",
    },
  ];

  const recentOrders = [
    { id: "#ORD-9025", customer: "Sarah A.", date: "Today, 10:23 AM", total: "1,250 SAR", status: "pending" },
    { id: "#ORD-9024", customer: "Mohammed K.", date: "Today, 09:15 AM", total: "450 SAR", status: "processing" },
    { id: "#ORD-9023", customer: "Lina M.", date: "Yesterday", total: "3,200 SAR", status: "delivered" },
    { id: "#ORD-9022", customer: "Omar S.", date: "Yesterday", total: "890 SAR", status: "delivered" },
  ];

  return (
    <div className="flex flex-col gap-8">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-md ${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.title[language]}</p>
              <h3 className="text-2xl font-bold text-secondary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Placeholder Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6 relative">
            <h3 className="text-lg font-bold text-secondary">
              {language === "ar" ? "نظرة عامة على الإيرادات" : "Revenue Overview"}
            </h3>
            
            <div className="relative group z-20">
              <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-2 font-medium text-gray-700 hover:border-primary transition-colors">
                {language === "ar" ? "هذا الأسبوع" : "This Week"}
                <ChevronDown size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
              </button>
              
              <div className="absolute top-full mt-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 ltr:right-0 rtl:left-0 before:absolute before:-top-2 before:left-0 before:w-full before:h-2">
                <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col p-1">
                  <button className="text-start px-4 py-2.5 text-sm font-bold text-primary bg-primary/5 rounded-lg transition-colors">
                    {language === "ar" ? "هذا الأسبوع" : "This Week"}
                  </button>
                  <button className="text-start px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                    {language === "ar" ? "هذا الشهر" : "This Month"}
                  </button>
                  <button className="text-start px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                    {language === "ar" ? "هذا العام" : "This Year"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
            <p className="text-gray-400 font-medium">
              {language === "ar" ? "[مساحة لعرض الرسم البياني للمبيعات]" : "[Sales Chart Placeholder]"}
            </p>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-secondary">
              {language === "ar" ? "أحدث الطلبات" : "Recent Orders"}
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">
              {language === "ar" ? "عرض الكل" : "View All"}
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentOrders.map((order, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex flex-col">
                  <span className="font-bold text-secondary">{order.id}</span>
                  <span className="text-xs text-gray-500">{order.customer} • {order.date}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-sm">{order.total}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
