const fs = require('fs');

const content = "use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShieldCheck, Target, Eye, Sparkles } from "lucide-react";

export default function AboutPage() {
  const { language, dir } = useLanguage();

  const values = [
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><Sparkles size={28} /></div>,
      title: { ar: "نقاء", en: "Purity" },
      desc: { ar: "تبدأ كل تركيبة بماء مقطر فائق النقاء ومعادن نفيسة بنسبة 99.99%. بدون إضافات. بدون مواد حافظة.", en: "Every formula starts with ultra-pure distilled water and 99.99% precious metals. No additives. No preservatives." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><Target size={28} /></div>,
      title: { ar: "دقة", en: "Precision" },
      desc: { ar: "عملية التحليل الكهربائي بالتيار المستمر. تركيز مضبوط بوحدة جزء في المليون. مواصفات غاوس معتمدة لكل منتج مغناطيسي.", en: "DC electrolysis process. Controlled concentration in ppm. Certified Gauss specs for every magnetic product." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><Eye size={28} /></div>,
      title: { ar: "الشفافية", en: "Transparency" },
      desc: { ar: "نُفصح بدقة عن مكونات منتجاتنا، وكيفية تصنيعها، والغرض من تصميمها. دون مبالغة، ودون أي لبس.", en: "We disclose our ingredients accurately, how they are made, and their purpose. No exaggeration, no confusion." }
    },
    {
      icon: <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center mb-4 mx-auto hover:bg-primary-hover transition-colors"><ShieldCheck size={28} /></div>,
      title: { ar: "مسؤولية", en: "Responsibility" },
      desc: { ar: "لا ندلي بتصريحات لا نستطيع إثباتها. نحن نحترم ذكاء عملائنا واللوائح الأوروبية التي تحميهم.", en: "We do not make claims we cannot prove. We respect our customers' intelligence and the European regulations protecting them." }
    }
  ];

  return (
    <>
      <Header />
      <main className="flex-grow pb-24 bg-background min-h-screen">
        
        {/* Full-width Hero Section */}
        <section className="relative h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden mb-24">
          <Image 
            src="/images/about/paradisecare-chisiamo01.jpg" 
            alt="Paradise Care" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center container mx-auto px-4 md:px-8 text-center text-background">
            <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 block text-xs md:text-sm drop-shadow-md">
              {language === "ar" ? "قصتنا" : "Our Story"}
            </span>
            <h1 className="text-4xl md:text-[40px] lg:text-[50px] font-bold mb-6 font-sans drop-shadow-lg max-w-4xl leading-tight">
              {language === "ar" ? "معادن من أجل صحتك الحقيقية" : "Minerals for your true health"}
            </h1>
            <p className="text-base md:text-lg text-gray-200 max-w-3xl mx-auto drop-shadow-md leading-relaxed">
              {language === "ar" 
                ? "بارادايس كير هي علامة تجارية فاخرة للعافية المعدنية مستوحاة من التقاليد المصرية، ودقة التركيبة النانوية، وفلسفة توفير منتجات ممتازة لحياتنا اليومية."
                : "Paradise Care is a luxury mineral wellness brand inspired by Egyptian tradition, precision nano-formulation, and a philosophy of providing excellent products for our daily lives."}
            </p>
          </div>
        </section>

        {/* Section 1: Paradise Care Vision */}
        <div className="container mx-auto px-4 md:px-8 mb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-soft">
              <Image 
                src="/images/about/paradisecare-chisiamo02-980x653_jIRM.jpg" 
                alt="Paradise Care Vision" 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 leading-tight">
                {language === "ar" ? "رؤية بارادايس كير للرفاهية" : "Paradise Care's Vision for Wellness"}
              </h2>
              <div className="space-y-6 text-secondary/80 text-lg leading-relaxed">
                <p>
                  {language === "ar"
                    ? "وُلدت بارادايس كير في مصر، ليس صدفةً، بل عن قصد. لم تفهم أي حضارة في التاريخ المعادن كما فهمها المصريون. فمن ذهب الفراعنة إلى مياه دلتا النيل الغنية بالمعادن، كانت العلاقة بين الأرض والجسم وجودة الحياة اليومية متطورة ومقصودة ومتكاملة بعمق في كل جانب من جوانب الوجود."
                    : "Paradise Care was born in Egypt, not by chance, but with purpose. No civilization in history understood minerals quite like the Egyptians. From the gold of the Pharaohs to the mineral-rich waters of the Nile Delta, the relationship between earth, body, and daily wellness was deeply integrated."}
                </p>
                <p>
                  {language === "ar"
                    ? "انطلاقاً من هذا التراث، وبفضل علم التركيبات النانوية الحديث، وُلدت بارادايس كير. علامة تجارية لا تطلب منك الثقة العمياء، بل الفهم. المكونات، والمواصفات، والفلسفة. ومن ثم اتخاذ قرار مدروس."
                    : "Rooted in this heritage, and powered by modern nano-formulation science, Paradise Care was born. A brand that doesn't ask for blind trust, but understanding. Ingredients, specs, and philosophy. Making an informed choice."}
                </p>
                <p>
                  {language === "ar"
                    ? "تُصنع منتجاتنا الغروية من جزيئات معدنية نانوية نقية بنسبة 99.99% في ماء مقطر، وذلك من خلال عملية التحليل الكهربائي بالتيار المستمر التي لا تتطلب أي إضافات أو مواد مثبتة أو مواد حافظة. أما أجسامنا المغناطيسية، فتُصنع وفقًا لمواصفات جاوس المعتمدة، وتُختبر كل قطعة على حدة قبل شحنها."
                    : "Our colloidal products are made from 99.99% pure nano mineral particles in distilled water via a DC electrolysis process requiring no additives, stabilizers, or preservatives. Our magnetic bodies are crafted to certified Gauss specs, tested individually before shipping."}
                </p>
                <p className="font-bold text-primary text-xl mt-4">
                  {language === "ar"
                    ? "هذا هو الفرق بين منتج العافية ومنتج بارادايس كير"
                    : "This is the difference between a wellness product and a Paradise Care product."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Values Grid */}
        <div className="bg-surface/30 py-24 border-y border-surface mb-32">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6 leading-tight">
                {language === "ar" ? "إن رؤيتنا الملموسة هي تحقيق الرفاهية العميقة." : "Our tangible vision is achieving profound wellness."}
              </h2>
              <p className="text-secondary/80 text-lg leading-relaxed">
                {language === "ar"
                  ? "لسنا شركة مكملات غذائية. لسنا علامة تجارية لمستحضرات التجميل. لسنا شركة مصنعة للأجهزة الطبية. نحن كل هذه الأشياء ولا شيء مما سبق - لأن بارادايس كير موجودة عند ملتقى علم المعادن، والجماليات الفاخرة، وممارسات الطقوس اليومية."
                  : "We are not a supplement company. Not a cosmetics brand. Not a medical device manufacturer. We are all of these and none of the above - because Paradise Care exists at the intersection of mineral science, luxury aesthetics, and daily ritual practices."}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
              {values.map((val, idx) => (
                <div key={idx} className="bg-background p-8 rounded-2xl border border-surface text-center shadow-soft hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-center transform group-hover:-translate-y-1.5 transition-transform duration-300">{val.icon}</div>
                  <h3 className="text-xl font-bold text-secondary mb-4">{val.title[language]}</h3>
                  <p className="text-secondary/70 leading-relaxed text-sm">{val.desc[language]}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/shop" className="inline-block bg-primary text-background font-bold px-8 py-3.5 rounded-full hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                {language === "ar" ? "استكشف المجموعة" : "Explore the Collection"}
              </Link>
            </div>
          </div>
        </div>

        {/* Section 3: Ancient Wisdom */}
        <div className="container mx-auto px-4 md:px-8 mb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="flex flex-col order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 leading-tight">
                {language === "ar" ? "حكمة قديمة ودقة حديثة" : "Ancient Wisdom and Modern Precision"}
              </h2>
              <div className="space-y-6 text-secondary/80 text-lg leading-relaxed">
                <p>
                  {language === "ar"
                    ? "تشير البرديات المصرية التي يعود تاريخها إلى 5000 قبل الميلاد إلى استخدام الذهب لدعم الصحة البدنية والعقلية."
                    : "Egyptian papyri dating back to 5000 BC reference the use of gold to support physical and mental health."}
                </p>
                <p>
                  {language === "ar"
                    ? "لم يستخدم الفراعنة الذهب كرمز للسلطة فحسب، بل كأداة علاجية أيضاً - لعلاج اضطرابات الجهاز الهضمي، وللحيوية، وللصفاء الذهني."
                    : "The Pharaohs used gold not just as a symbol of power, but as a healing tool - for digestive disorders, vitality, and mental clarity."}
                </p>
                <p>
                  {language === "ar"
                    ? "تعيد بارادايس كير تفسير هذه الثقافة القديمة. فهي تأخذ حكمة المعادن في مصر القديمة وتدمجها مع تكنولوجيا النانو المعاصرة، لتخلق منتجات جديدة حقاً."
                    : "Paradise Care reinterprets this ancient culture. It takes the mineral wisdom of ancient Egypt and integrates it with contemporary nanotechnology, creating truly new products."}
                </p>
                <p className="italic font-medium text-primary text-xl mt-6 p-6 bg-surface/50 rounded-2xl border-l-4 border-primary">
                  {language === "ar"
                    ? "الأرض لا تعطي معادنها لمن هم في عجلة من أمرهم."
                    : "The earth does not yield its minerals to those in a hurry."}
                </p>
              </div>
            </div>
            
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-soft order-1 lg:order-2">
              <Image 
                src="/images/about/paradisecare-chisiamo03-980x653_jIRM.jpg" 
                alt="Ancient Wisdom" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
;

fs.writeFileSync('src/app/about/page.tsx', content, 'utf8');
