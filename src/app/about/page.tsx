"use client";

import React from "react";
import Image from "next/image";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Diamond, Leaf, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  const { language } = useLanguage();

  const values = [
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><Diamond size={28} /></div>,
      title: { ar: "الأصالة والجودة", en: "Authenticity & Quality" },
      desc: { ar: "ننتقي أفضل المكونات من مصادرها الأصلية لنقدم لك فخامة حقيقية.", en: "We source the finest ingredients to deliver true luxury." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><Sparkles size={28} /></div>,
      title: { ar: "الأناقة العصرية", en: "Modern Elegance" },
      desc: { ar: "نواكب أحدث خطوط الموضة لابتكار تصاميم تعكس ذوقك الرفيع.", en: "We stay ahead of trends to create designs reflecting refined taste." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><Leaf size={28} /></div>,
      title: { ar: "الاستدامة", en: "Sustainability" },
      desc: { ar: "نلتزم بممارسات صديقة للبيئة لضمان مستقبل أجمل.", en: "We commit to eco-friendly practices for a more beautiful future." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><HeartHandshake size={28} /></div>,
      title: { ar: "ثقة العملاء", en: "Customer Trust" },
      desc: { ar: "رضاكم هو غايتنا الأولى، ونبني علاقاتنا على الشفافية.", en: "Your satisfaction is our goal; we build relationships on transparency." }
    }
  ];

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
        
        {/* Page Header */}
        <div className="container mx-auto px-4 md:px-8 mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-sans text-secondary mb-4">
            {language === "ar" ? "قصتنا" : "Our Story"}
          </h1>
          <div className="w-20 h-1 bg-surface mx-auto"></div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 md:px-8 mb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded-2xl overflow-hidden shadow-soft">
              <Image 
                src="https://picsum.photos/800/800?random=20" 
                alt="Luxury Lifestyle" 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col">
              <span className="text-primary font-bold tracking-widest uppercase mb-4 text-sm">
                {language === "ar" ? "رؤيتنا" : "Our Vision"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 leading-tight">
                {language === "ar" ? "إعادة تعريف مفهوم الرفاهية بلمسة عصرية." : "Redefining the concept of luxury with a modern touch."}
              </h2>
              <p className="text-gray-600 text-lg leading-loose mb-6">
                {language === "ar" 
                  ? "تأسس متجرنا من شغف حقيقي بالجمال والأناقة. نحن لا نبيع منتجات فحسب، بل نقدم تجربة استثنائية تأخذك في رحلة من الحواس. بدأنا بخطوة صغيرة نحو تقديم العطور النادرة، واليوم نحن وجهتك الأولى لكل ما هو فاخر."
                  : "Our store was founded from a genuine passion for beauty and elegance. We don't just sell products; we offer an exceptional experience that takes your senses on a journey. We started with rare perfumes, and today we are your premier destination for all things luxury."}
              </p>
              <p className="text-gray-600 text-lg leading-loose">
                {language === "ar"
                  ? "كل تفصيلة في منتجاتنا تم اختيارها بعناية فائقة لتلبي توقعات أصحاب الذوق الرفيع. نحن نؤمن بأن الفخامة تكمن في التفاصيل."
                  : "Every detail in our products is carefully selected to meet the expectations of those with refined taste. We believe that luxury lies in the details."}
              </p>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="bg-background py-24 border-y border-surface">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-widest uppercase mb-2 block text-sm">
                {language === "ar" ? "قيمنا" : "Our Core Values"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary">
                {language === "ar" ? "ما يميّزنا" : "What Sets Us Apart"}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {values.map((val, idx) => (
                <div key={idx} className="bg-surface p-8 rounded-2xl border border-transparent text-center shadow-soft hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-center transform group-hover:-translate-y-1.5 transition-transform duration-300">{val.icon}</div>
                  <h3 className="text-xl font-bold text-secondary mb-4">{val.title[language]}</h3>
                  <p className="text-secondary/70 leading-relaxed">{val.desc[language]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
