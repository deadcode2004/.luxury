"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FormField from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });

  const submitContact = async () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = language === "ar" ? "مطلوب" : "Required";
    if (!form.email.includes("@")) next.email = language === "ar" ? "بريد غير صالح" : "Invalid email";
    if (!form.subject.trim()) next.subject = language === "ar" ? "مطلوب" : "Required";
    if (!form.message.trim()) next.message = language === "ar" ? "مطلوب" : "Required";
    setErrors(next);
    if (Object.keys(next).length) {
      toast(language === "ar" ? "يرجى تعبئة الحقول المطلوبة" : "Please fill required fields", "warning");
      return;
    }
    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
      toast(language === "ar" ? "تم إرسال رسالتك بنجاح" : "Message sent successfully", "success");
    } finally {
      setSending(false);
    }
  };


  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: { ar: "العنوان", en: "Address" },
      desc: { ar: "شارع العليا، الرياض، المملكة العربية السعودية", en: "Olaya Street, Riyadh, Saudi Arabia" }
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: { ar: "رقم الهاتف", en: "Phone Number" },
      desc: { ar: "+966 50 123 4567", en: "+966 50 123 4567" }
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: { ar: "البريد الإلكتروني", en: "Email Address" },
      desc: { ar: "support@paradise.com", en: "support@paradise.com" }
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: { ar: "ساعات العمل", en: "Working Hours" },
      desc: { ar: "الأحد - الخميس: 9 ص - 10 م", en: "Sun - Thu: 9 AM - 10 PM" }
    }
  ];

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        
        {/* Page Header */}
        <div className="container mx-auto px-4 md:px-8 mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-sans text-secondary mb-4">
            {language === "ar" ? "تواصل معنا" : "Contact Us"}
          </h1>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            {language === "ar" 
              ? "نحن هنا لخدمتك والإجابة على كافة استفساراتك. لا تتردد في التواصل معنا في أي وقت." 
              : "We are here to serve you and answer all your inquiries. Don't hesitate to reach out."}
          </p>
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
            
            {/* Left Column: Contact Info & Map */}
            <div className="lg:w-5/12 flex flex-col gap-12 w-full">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary text-background border border-transparent flex items-center justify-center shadow-sm hover:bg-primary-hover transition-colors">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary text-xl mb-2">{info.title[language]}</h3>
                      <p className="text-gray-500 font-medium leading-relaxed" dir={idx === 1 || idx === 2 ? "ltr" : undefined}>
                        {info.desc[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="w-full aspect-video md:aspect-[4/3] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative shadow-sm">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <MapPin size={48} className="mb-4 opacity-50" />
                  <span className="font-bold">{language === "ar" ? "خريطة الموقع (Demo)" : "Map Placeholder"}</span>
                </div>
              </div>

            </div>

            
            <Card variant="glass" padding="none" className="lg:w-7/12 w-full rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-secondary mb-8">
                {language === "ar" ? "أرسل لنا رسالة" : "Send us a Message"}
              </h2>

              <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); void submitContact(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label={language === "ar" ? "الاسم الكامل" : "Full Name"} error={errors.name}>
                    <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={errors.name ? "border-red-300" : ""} placeholder={language === "ar" ? "أدخل اسمك" : "Enter your name"} />
                  </FormField>
                  <FormField label={language === "ar" ? "رقم الهاتف" : "Phone Number"} error={errors.phone}>
                    <Input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={`text-start dir-ltr ${errors.phone ? "border-red-300" : ""}`} placeholder="+966 5X XXX XXXX" />
                  </FormField>
                </div>

                <FormField label={language === "ar" ? "البريد الإلكتروني" : "Email Address"} error={errors.email}>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={errors.email ? "border-red-300" : ""} placeholder="example@email.com" />
                </FormField>

                <FormField label={language === "ar" ? "الموضوع" : "Subject"} error={errors.subject}>
                  <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className={errors.subject ? "border-red-300" : ""} placeholder={language === "ar" ? "عنوان الرسالة" : "Message subject"} />
                </FormField>

                <FormField label={language === "ar" ? "الرسالة" : "Message"} error={errors.message}>
                  <Textarea className={`min-h-[160px] resize-y ${errors.message ? "border-red-300" : ""}`} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder={language === "ar" ? "اكتب رسالتك هنا..." : "Write your message here..."} />
                </FormField>

                <Button type="submit" variant="primary" size="lg" className="mt-4 w-full md:w-auto text-white" loading={sending}>
                  {language === "ar" ? "إرسال الرسالة" : "Send Message"}
                  <Send size={20} className={language === "ar" ? "rotate-180" : ""} />
                </Button>
              </form>
            </Card>


          </div>
        </div>

      </main>
  );
}
