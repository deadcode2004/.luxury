"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FormField from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";
import { fetchPublicCms, type CmsStorefront } from "@/lib/api/owner";
import { emptyCmsContact, mapEmbedSrc } from "@/lib/cms/footer";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";

export default function ContactPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [cms, setCms] = useState<CmsStorefront | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCms()
      .then((data) => {
        if (!cancelled) setCms(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useRealtimeDomains(["cms"], () => {
    void fetchPublicCms()
      .then(setCms)
      .catch(() => undefined);
  });

  const contact = useMemo(
    () => ({ ...emptyCmsContact(), ...(cms?.contact ?? {}) }),
    [cms]
  );

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

  const infoBlocks: {
    key: string;
    icon: React.ReactNode;
    title: { ar: string; en: string };
    body: React.ReactNode;
  }[] = [];

  if (contact.address.enabled && (contact.address.text?.[language] || contact.address.text?.ar)) {
    infoBlocks.push({
      key: "address",
      icon: <MapPin className="w-6 h-6" />,
      title: { ar: "العنوان", en: "Address" },
      body: contact.address.text?.[language] || contact.address.text?.ar,
    });
  }

  if (contact.phones.enabled && contact.phones.numbers.some(Boolean)) {
    infoBlocks.push({
      key: "phones",
      icon: <Phone className="w-6 h-6" />,
      title: { ar: "رقم الهاتف", en: "Phone Number" },
      body: (
        <span className="flex flex-col gap-1">
          {contact.phones.numbers.filter(Boolean).map((n) => (
            <a key={n} href={`tel:${n.replace(/\s+/g, "")}`} className="hover:text-primary dir-ltr inline-block">
              {n}
            </a>
          ))}
        </span>
      ),
    });
  }

  if (contact.email.enabled && contact.email.value) {
    infoBlocks.push({
      key: "email",
      icon: <Mail className="w-6 h-6" />,
      title: { ar: "البريد الإلكتروني", en: "Email Address" },
      body: (
        <a href={`mailto:${contact.email.value}`} className="hover:text-primary dir-ltr inline-block break-all">
          {contact.email.value}
        </a>
      ),
    });
  }

  if (contact.hours.enabled && (contact.hours.text?.[language] || contact.hours.text?.ar)) {
    infoBlocks.push({
      key: "hours",
      icon: <Clock className="w-6 h-6" />,
      title: { ar: "ساعات العمل", en: "Working Hours" },
      body: contact.hours.text?.[language] || contact.hours.text?.ar,
    });
  }

  const mapSrc = contact.map.enabled ? mapEmbedSrc(contact.map.embedUrl) : null;

  return (
    <main className="flex-grow pt-32 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-8 mb-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-sans text-secondary mb-4">
          {language === "ar" ? "تواصل معنا" : "Contact Us"}
        </h1>
        <div className="w-20 h-1 bg-primary mx-auto mb-6" />
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          {language === "ar"
            ? "نحن هنا لخدمتك والإجابة على كافة استفساراتك. لا تتردد في التواصل معنا في أي وقت."
            : "We are here to serve you and answer all your inquiries. Don't hesitate to reach out."}
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          <div className="lg:w-5/12 flex flex-col gap-12 w-full">
            {infoBlocks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                {infoBlocks.map((info) => (
                  <div key={info.key} className="flex gap-6 items-start">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary text-background border border-transparent flex items-center justify-center shadow-sm hover:bg-primary-hover transition-colors">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary text-xl mb-2">
                        {info.title[language]}
                      </h3>
                      <div className="text-gray-500 font-medium leading-relaxed">{info.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                {language === "ar"
                  ? "لم يتم تفعيل بيانات التواصل بعد من لوحة الإدارة."
                  : "Contact details have not been enabled in the admin CMS yet."}
              </p>
            )}

            {mapSrc ? (
              <div className="w-full aspect-video md:aspect-[4/3] bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative shadow-sm">
                <iframe
                  title={language === "ar" ? "خريطة الموقع" : "Location map"}
                  src={mapSrc}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : null}
          </div>

          <Card variant="glass" padding="none" className="lg:w-7/12 w-full rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-secondary mb-8">
              {language === "ar" ? "أرسل لنا رسالة" : "Send us a Message"}
            </h2>

            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                void submitContact();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label={language === "ar" ? "الاسم الكامل" : "Full Name"} error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={errors.name ? "border-red-300" : ""}
                    placeholder={language === "ar" ? "أدخل اسمك" : "Enter your name"}
                  />
                </FormField>
                <FormField label={language === "ar" ? "رقم الهاتف" : "Phone Number"} error={errors.phone}>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={`text-start dir-ltr ${errors.phone ? "border-red-300" : ""}`}
                    placeholder="+20 ..."
                  />
                </FormField>
              </div>

              <FormField label={language === "ar" ? "البريد الإلكتروني" : "Email Address"} error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={errors.email ? "border-red-300" : ""}
                  placeholder="example@email.com"
                />
              </FormField>

              <FormField label={language === "ar" ? "الموضوع" : "Subject"} error={errors.subject}>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className={errors.subject ? "border-red-300" : ""}
                  placeholder={language === "ar" ? "عنوان الرسالة" : "Message subject"}
                />
              </FormField>

              <FormField label={language === "ar" ? "الرسالة" : "Message"} error={errors.message}>
                <Textarea
                  className={`min-h-[160px] resize-y ${errors.message ? "border-red-300" : ""}`}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder={language === "ar" ? "اكتب رسالتك هنا..." : "Write your message here..."}
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-4 w-full md:w-auto text-white"
                loading={sending}
              >
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
