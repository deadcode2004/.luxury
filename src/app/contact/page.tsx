"use client";

import React from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const { language } = useLanguage();

  const contactInfo = [
    {
      icon: <MapPin className="text-primary w-6 h-6" />,
      title: { ar: "العنوان", en: "Address" },
      desc: { ar: "شارع العليا، الرياض، المملكة العربية السعودية", en: "Olaya Street, Riyadh, Saudi Arabia" }
    },
    {
      icon: <Phone className="text-primary w-6 h-6" />,
      title: { ar: "رقم الهاتف", en: "Phone Number" },
      desc: { ar: "+966 50 123 4567", en: "+966 50 123 4567" }
    },
    {
      icon: <Mail className="text-primary w-6 h-6" />,
      title: { ar: "البريد الإلكتروني", en: "Email Address" },
      desc: { ar: "support@paradise.com", en: "support@paradise.com" }
    },
    {
      icon: <Clock className="text-primary w-6 h-6" />,
      title: { ar: "ساعات العمل", en: "Working Hours" },
      desc: { ar: "الأحد - الخميس: 9 ص - 10 م", en: "Sun - Thu: 9 AM - 10 PM" }
    }
  ];

  return (
    <>
      <Header />
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
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-surface border border-gray-100 flex items-center justify-center shadow-sm">
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

            {/* Right Column: Contact Form */}
            <div className="lg:w-7/12 w-full bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-soft">
              <h2 className="text-3xl font-bold text-secondary mb-8">
                {language === "ar" ? "أرسل لنا رسالة" : "Send us a Message"}
              </h2>

              <form className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "الاسم الكامل" : "Full Name"}</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" 
                      placeholder={language === "ar" ? "أدخل اسمك" : "Enter your name"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                    <input 
                      type="tel" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors text-start dir-ltr" 
                      placeholder="+966 5X XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</label>
                  <input 
                    type="email" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" 
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "الموضوع" : "Subject"}</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg h-14 px-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" 
                    placeholder={language === "ar" ? "عنوان الرسالة" : "Message subject"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">{language === "ar" ? "الرسالة" : "Message"}</label>
                  <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[160px] focus:outline-none focus:border-primary focus:bg-white transition-colors resize-y" 
                    placeholder={language === "ar" ? "اكتب رسالتك هنا..." : "Write your message here..."}
                  ></textarea>
                </div>

                <button 
                  type="button" 
                  className="mt-4 bg-primary text-secondary font-bold h-14 px-8 rounded-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-glow w-full md:w-auto"
                >
                  {language === "ar" ? "إرسال الرسالة" : "Send Message"}
                  <Send size={20} className={language === "ar" ? "rotate-180" : ""} />
                </button>
              </form>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
