"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Image as ImageIcon, Type, Layout, Save } from "lucide-react";

export default function AdminCMS() {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary mb-1">
            {language === "ar" ? "إدارة محتوى المتجر" : "Store Content Management"}
          </h2>
          <p className="text-gray-500 text-sm">
            {language === "ar" ? "تعديل النصوص والصور في الصفحة الرئيسية" : "Edit texts and images on the home page"}
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-primary hover:text-secondary transition-all w-full sm:w-auto justify-center shadow-md">
          <Save size={18} />
          {language === "ar" ? "حفظ جميع التغييرات" : "Save All Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Sections */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Hero Section Edit */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
              <Layout size={20} className="text-primary" />
              <h3 className="font-bold text-secondary">
                {language === "ar" ? "واجهة العرض الرئيسية (Hero Section)" : "Hero Section"}
              </h3>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "العنوان الرئيسي (عربي)" : "Main Heading (Arabic)"}</label>
                <input type="text" defaultValue="اكتشف جوهر الفخامة" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-12 px-4 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "العنوان الرئيسي (إنجليزي)" : "Main Heading (English)"}</label>
                <input type="text" defaultValue="Discover the Essence of Luxury" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-12 px-4 focus:outline-none focus:border-primary transition-colors text-start dir-ltr" />
              </div>
              
              <div className="border-t border-gray-100 pt-6 mt-2">
                <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} />
                  {language === "ar" ? "صورة الخلفية" : "Background Image"}
                </label>
                <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-sm font-medium">{language === "ar" ? "اضغط لرفع صورة جديدة" : "Click to upload new image"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Bar Edit */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
              <Type size={20} className="text-primary" />
              <h3 className="font-bold text-secondary">
                {language === "ar" ? "الشريط الإعلاني" : "Announcement Bar"}
              </h3>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4 mb-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-3 text-sm font-bold text-gray-600">{language === "ar" ? "تفعيل الشريط" : "Enable Bar"}</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "نص الإعلان" : "Announcement Text"}</label>
                <input type="text" defaultValue="شحن مجاني للطلبات فوق 500 ريال" className="w-full bg-gray-50 border border-gray-200 rounded-lg h-12 px-4 focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Information/Guide */}
        <div className="lg:col-span-1">
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 sticky top-24">
            <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">i</span>
              {language === "ar" ? "ملاحظات هامة" : "Important Notes"}
            </h4>
            <ul className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {language === "ar" ? "التعديلات هنا ستنعكس فوراً على واجهة المتجر الرئيسية." : "Changes here will reflect immediately on the storefront."}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {language === "ar" ? "تأكد من استخدام صور عالية الجودة بصيغة WebP أو JPEG لضمان سرعة التحميل." : "Ensure you use high-quality WebP or JPEG images for fast loading."}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {language === "ar" ? "يُفضل أن لا يتجاوز النص الإعلاني 50 حرفاً ليكون مقروءاً في الجوال." : "It's recommended to keep announcement text under 50 characters for mobile readability."}
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
