"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Image as ImageIcon, Type, Layout, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";

export default function AdminCMS() {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <Card
        variant="panel"
        padding="md"
        className="flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-secondary mb-1">
            {language === "ar" ? "إدارة محتوى المتجر" : "Store Content Management"}
          </h2>
          <p className="text-gray-500 text-sm">
            {language === "ar"
              ? "تعديل النصوص والصور في الصفحة الرئيسية"
              : "Edit texts and images on the home page"}
          </p>
        </div>
        <Button variant="secondary" size="md" className="w-full sm:w-auto">
          <Save size={18} />
          {language === "ar" ? "حفظ جميع التغييرات" : "Save All Changes"}
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card variant="panel" padding="none" className="overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
              <Layout size={20} className="text-primary" />
              <h3 className="font-bold text-secondary">
                {language === "ar" ? "واجهة العرض الرئيسية (Hero Section)" : "Hero Section"}
              </h3>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <FormField
                label={language === "ar" ? "العنوان الرئيسي (عربي)" : "Main Heading (Arabic)"}
              >
                <Input defaultValue="اكتشف جوهر الفخامة" className="h-12" />
              </FormField>
              <FormField
                label={
                  language === "ar" ? "العنوان الرئيسي (إنجليزي)" : "Main Heading (English)"
                }
              >
                <Input
                  defaultValue="Discover the Essence of Luxury"
                  className="h-12 text-start dir-ltr"
                />
              </FormField>

              <div className="border-t border-gray-100 pt-6 mt-2">
                <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} />
                  {language === "ar" ? "صورة الخلفية" : "Background Image"}
                </label>
                <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-sm font-medium">
                    {language === "ar" ? "اضغط لرفع صورة جديدة" : "Click to upload new image"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="panel" padding="none" className="overflow-hidden">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  <span className="ms-3 text-sm font-bold text-gray-600">
                    {language === "ar" ? "تفعيل الشريط" : "Enable Bar"}
                  </span>
                </label>
              </div>
              <FormField label={language === "ar" ? "نص الإعلان" : "Announcement Text"}>
                <Input
                  defaultValue="شحن مجاني للطلبات فوق 500 ريال"
                  className="h-12"
                />
              </FormField>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Alert variant="info" className="sticky top-24 rounded-2xl p-6" title={
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                i
              </span>
              {language === "ar" ? "ملاحظات هامة" : "Important Notes"}
            </span>
          }>
            <ul className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {language === "ar"
                  ? "التعديلات هنا ستنعكس فوراً على واجهة المتجر الرئيسية."
                  : "Changes here will reflect immediately on the storefront."}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {language === "ar"
                  ? "تأكد من استخدام صور عالية الجودة بصيغة WebP أو JPEG لضمان سرعة التحميل."
                  : "Ensure you use high-quality WebP or JPEG images for fast loading."}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {language === "ar"
                  ? "يُفضل أن لا يتجاوز النص الإعلاني 50 حرفاً ليكون مقروءاً في الجوال."
                  : "It's recommended to keep announcement text under 50 characters for mobile readability."}
              </li>
            </ul>
          </Alert>
        </div>
      </div>
    </div>
  );
}
