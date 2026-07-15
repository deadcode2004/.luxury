"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, UserCircle, MapPin, LogOut } from "lucide-react";

type Tab = "orders" | "profile" | "addresses";

export default function AccountPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  // Mock Data
  const mockOrders = [
    { id: "#ORD-9021", date: "12 Oct 2026", status: "delivered", total: "1,250.00" },
    { id: "#ORD-9022", date: "05 Nov 2026", status: "processing", total: "840.00" },
  ];

  const mockAddresses = [
    { id: 1, name: "Home", text: "123 Olaya St, Riyadh, Saudi Arabia", isDefault: true },
    { id: 2, name: "Work", text: "King Abdullah Financial District, Riyadh", isDefault: false },
  ];

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary mb-2">
              {language === "ar" ? "حسابي" : "My Account"}
            </h1>
            <p className="text-gray-500">
              {language === "ar" ? "مرحباً بك، أحمد محمد" : "Welcome back, Ahmed Mohammad"}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:w-1/4 shrink-0">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-32 flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-start ${
                    activeTab === "orders" ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-50 hover:text-secondary"
                  }`}
                >
                  <Package size={20} />
                  {language === "ar" ? "طلباتي" : "My Orders"}
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-start ${
                    activeTab === "profile" ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-50 hover:text-secondary"
                  }`}
                >
                  <UserCircle size={20} />
                  {language === "ar" ? "إعدادات الحساب" : "Profile Settings"}
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-start ${
                    activeTab === "addresses" ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-50 hover:text-secondary"
                  }`}
                >
                  <MapPin size={20} />
                  {language === "ar" ? "العناوين المحفوظة" : "Saved Addresses"}
                </button>
                
                <div className="h-px bg-gray-100 my-2"></div>
                
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-500 hover:bg-red-50 text-start">
                  <LogOut size={20} />
                  {language === "ar" ? "تسجيل الخروج" : "Log Out"}
                </button>
              </div>
            </aside>

            {/* Content Area */}
            <div className="lg:w-3/4">
              
              {/* --- Orders Tab --- */}
              {activeTab === "orders" && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm animate-fade-in">
                  <h2 className="text-2xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                    {language === "ar" ? "سجل الطلبات" : "Order History"}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse min-w-[600px]">
                      <thead>
                        <tr className="text-gray-400 text-sm border-b border-gray-100">
                          <th className="font-medium pb-4 px-4 text-start">{language === "ar" ? "رقم الطلب" : "Order ID"}</th>
                          <th className="font-medium pb-4 px-4 text-start">{language === "ar" ? "التاريخ" : "Date"}</th>
                          <th className="font-medium pb-4 px-4 text-start">{language === "ar" ? "الحالة" : "Status"}</th>
                          <th className="font-medium pb-4 px-4 text-start">{language === "ar" ? "الإجمالي" : "Total"}</th>
                          <th className="font-medium pb-4 px-4 text-end"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockOrders.map((order, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-secondary">{order.id}</td>
                            <td className="py-4 px-4 text-gray-500">{order.date}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                order.status === "delivered" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                              }`}>
                                {order.status === "delivered" 
                                  ? (language === "ar" ? "مكتمل" : "Delivered") 
                                  : (language === "ar" ? "قيد المعالجة" : "Processing")}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-secondary">{order.total} SAR</td>
                            <td className="py-4 px-4 text-end">
                              <button className="text-primary font-medium hover:underline">
                                {language === "ar" ? "عرض التفاصيل" : "View Details"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- Profile Settings Tab --- */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm animate-fade-in">
                  <h2 className="text-2xl font-bold text-secondary mb-6 pb-4 border-b border-gray-100">
                    {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
                  </h2>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "الاسم الأول" : "First Name"}</label>
                      <input type="text" defaultValue="أحمد" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "اسم العائلة" : "Last Name"}</label>
                      <input type="text" defaultValue="محمد" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</label>
                      <input type="email" defaultValue="ahmed@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                      <input type="tel" defaultValue="+966 50 123 4567" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors text-start dir-ltr" />
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button type="button" className="bg-secondary text-white font-bold h-14 px-8 rounded-lg hover:bg-primary hover:text-secondary transition-all shadow-md">
                        {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* --- Saved Addresses Tab --- */}
              {activeTab === "addresses" && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm animate-fade-in">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-secondary">
                      {language === "ar" ? "عناويني" : "My Addresses"}
                    </h2>
                    <button className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-secondary transition-colors text-sm">
                      {language === "ar" ? "+ إضافة عنوان" : "+ Add Address"}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockAddresses.map((address) => (
                      <div key={address.id} className="border border-gray-100 rounded-xl p-6 bg-gray-50 relative group hover:border-primary transition-colors">
                        {address.isDefault && (
                          <span className="absolute top-4 right-4 rtl:left-4 rtl:right-auto bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-md">
                            {language === "ar" ? "الافتراضي" : "Default"}
                          </span>
                        )}
                        <h3 className="font-bold text-secondary mb-2 flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          {address.name}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                          {address.text}
                        </p>
                        <div className="flex gap-4 border-t border-gray-200 pt-4">
                          <button className="text-primary font-medium text-sm hover:underline">{language === "ar" ? "تعديل" : "Edit"}</button>
                          <button className="text-red-500 font-medium text-sm hover:underline">{language === "ar" ? "حذف" : "Remove"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
