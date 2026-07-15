"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save, User, Lock, Bell, Globe } from "lucide-react";

export default function AdminSettings() {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary mb-1">
            {language === "ar" ? "إعدادات الحساب" : "Account Settings"}
          </h2>
          <p className="text-gray-500 text-sm">
            {language === "ar" ? "إدارة تفضيلات حسابك الشخصي والأمان" : "Manage your personal account preferences and security"}
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-primary hover:text-secondary transition-all w-full sm:w-auto justify-center shadow-md">
          <Save size={18} />
          {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Navigation (Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold text-start transition-colors">
              <User size={18} />
              {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-secondary font-medium text-start transition-colors">
              <Lock size={18} />
              {language === "ar" ? "الأمان وكلمة المرور" : "Security & Password"}
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-secondary font-medium text-start transition-colors">
              <Bell size={18} />
              {language === "ar" ? "الإشعارات" : "Notifications"}
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-secondary font-medium text-start transition-colors">
              <Globe size={18} />
              {language === "ar" ? "اللغة والمنطقة" : "Language & Region"}
            </button>
          </div>
        </div>

        {/* Main Settings Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                A
              </div>
              <div>
                <h3 className="font-bold text-secondary text-lg">Admin User</h3>
                <p className="text-sm text-gray-500">Store Manager</p>
              </div>
              <button className="ms-auto px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                {language === "ar" ? "تغيير الصورة" : "Change Avatar"}
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-600">{language === "ar" ? "الاسم الأول" : "First Name"}</label>
                <input type="text" defaultValue="Admin" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-12 px-4 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-600">{language === "ar" ? "اسم العائلة" : "Last Name"}</label>
                <input type="text" defaultValue="User" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-12 px-4 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-600">{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</label>
                <input type="email" defaultValue="admin@paradise-store.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-12 px-4 focus:outline-none focus:border-primary transition-colors text-start dir-ltr" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-600">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                <input type="tel" defaultValue="+966 50 123 4567" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-12 px-4 focus:outline-none focus:border-primary transition-colors text-start dir-ltr" />
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
