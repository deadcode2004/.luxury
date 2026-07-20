"use client";

import React from "react";
import { Plus, Trash2, Share2, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import {
  SOCIAL_PLATFORMS,
  whatsappChatUrl,
  type CmsContact,
  type CmsSocial,
  type SocialPlatform,
} from "@/lib/cms/footer";
import { LocaleTextarea } from "@/components/admin/LocaleField";

type Props = {
  social: CmsSocial;
  contact: CmsContact;
  onSocialChange: (next: CmsSocial) => void;
  onContactChange: (next: CmsContact) => void;
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0 gap-2">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
      {label ? <span className="text-xs font-bold text-gray-600">{label}</span> : null}
    </label>
  );
}

export default function AdminCmsSocialContactCard({
  social,
  contact,
  onSocialChange,
  onContactChange,
}: Props) {
  const { language } = useLanguage();

  const setSocial = (key: SocialPlatform, patch: Partial<(typeof social)[SocialPlatform]>) => {
    onSocialChange({
      ...social,
      [key]: { ...social[key], ...patch },
    });
  };

  const setPhone = (index: number, value: string) => {
    const numbers = [...contact.phones.numbers];
    numbers[index] = value;
    onContactChange({
      ...contact,
      phones: { ...contact.phones, numbers },
    });
  };

  const addPhone = () => {
    if (contact.phones.numbers.length >= 10) return;
    onContactChange({
      ...contact,
      phones: { ...contact.phones, numbers: [...contact.phones.numbers, ""] },
    });
  };

  const removePhone = (index: number) => {
    const numbers = contact.phones.numbers.filter((_, i) => i !== index);
    onContactChange({
      ...contact,
      phones: { ...contact.phones, numbers: numbers.length ? numbers : [""] },
    });
  };

  const waPreview = social.whatsapp.enabled ? whatsappChatUrl(social.whatsapp.value) : null;

  return (
    <section className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-surface bg-white/70 overflow-hidden">
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-surface/70 bg-background/60">
        <h3 className="font-bold text-secondary text-sm sm:text-base">
          {language === "ar" ? "السوشيال ميديا والتواصل" : "Social media & contact"}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {language === "ar"
            ? "فعّل ما تريد إظهاره في التذييل وصفحة التواصل"
            : "Enable what you want shown in the footer and contact page"}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 xl:items-stretch w-full min-w-0">
        {/* Social */}
        <div className="xl:col-span-6 p-3 sm:p-5 lg:p-6 flex flex-col gap-4 min-w-0 w-full border-b xl:border-b-0 xl:border-e border-surface">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Share2 size={18} />
            </span>
            <div className="min-w-0">
              <h4 className="font-bold text-secondary text-sm sm:text-base">
                {language === "ar" ? "روابط السوشيال ميديا" : "Social media links"}
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === "ar"
                  ? "الأيقونات تظهر في الـ Footer عند التفعيل فقط"
                  : "Icons appear in the Footer only when enabled"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {SOCIAL_PLATFORMS.map((platform) => {
              const row = social[platform.key];
              return (
                <div
                  key={platform.key}
                  className="rounded-2xl border border-surface bg-background/60 p-3 sm:p-4 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-secondary">
                      {platform.label[language]}
                    </span>
                    <Toggle
                      checked={row.enabled}
                      onChange={(enabled) => setSocial(platform.key, { enabled })}
                      label={
                        row.enabled
                          ? language === "ar"
                            ? "مفعّل"
                            : "On"
                          : language === "ar"
                            ? "متوقف"
                            : "Off"
                      }
                    />
                  </div>
                  <FormField
                    label={
                      platform.kind === "phone"
                        ? language === "ar"
                          ? "رقم الواتساب (مع كود الدولة)"
                          : "WhatsApp number (with country code)"
                        : language === "ar"
                          ? "الرابط"
                          : "URL"
                    }
                  >
                    <Input
                      className="dir-ltr text-start"
                      disabled={!row.enabled}
                      value={row.value}
                      placeholder={platform.placeholder}
                      onChange={(e) => setSocial(platform.key, { value: e.target.value })}
                    />
                  </FormField>
                  {platform.key === "whatsapp" && row.enabled && waPreview ? (
                    <p className="text-[11px] text-secondary/50 dir-ltr text-start break-all">
                      → {waPreview}
                    </p>
                  ) : null}
                  {platform.key === "whatsapp" && row.enabled ? (
                    <p className="text-[11px] text-secondary/45 leading-snug">
                      {language === "ar"
                        ? "يُنشأ رابط wa.me تلقائياً لفتح المحادثة من أي دولة."
                        : "A wa.me link is generated automatically so chats open from any country."}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="xl:col-span-6 p-3 sm:p-5 lg:p-6 flex flex-col gap-4 min-w-0 w-full bg-background/40">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <MapPin size={18} />
            </span>
            <div className="min-w-0">
              <h4 className="font-bold text-secondary text-sm sm:text-base">
                {language === "ar" ? "التواصل (Contact)" : "Contact"}
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === "ar"
                  ? "العنوان وساعات العمل بالعربية فقط — ترجمة تلقائية"
                  : "Address & hours in Arabic only — auto-translated"}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-surface bg-white/70 p-3 sm:p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-secondary">
                {language === "ar" ? "العنوان" : "Address"}
              </span>
              <Toggle
                checked={contact.address.enabled}
                onChange={(enabled) =>
                  onContactChange({
                    ...contact,
                    address: { ...contact.address, enabled },
                  })
                }
              />
            </div>
            <FormField label={language === "ar" ? "العنوان" : "Address"}>
              <LocaleTextarea
                rows={2}
                disabled={!contact.address.enabled}
                ar={contact.address.text.ar}
                en={contact.address.text.en}
                onArChange={(ar) =>
                  onContactChange({
                    ...contact,
                    address: {
                      ...contact.address,
                      text: { ar, en: "" },
                    },
                  })
                }
              />
            </FormField>
          </div>

          {/* Phones */}
          <div className="rounded-2xl border border-surface bg-white/70 p-3 sm:p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-secondary">
                {language === "ar" ? "أرقام الهاتف" : "Phone numbers"}
              </span>
              <Toggle
                checked={contact.phones.enabled}
                onChange={(enabled) =>
                  onContactChange({
                    ...contact,
                    phones: { ...contact.phones, enabled },
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {contact.phones.numbers.map((num, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="dir-ltr text-start flex-1"
                    disabled={!contact.phones.enabled}
                    value={num}
                    placeholder="+20 ..."
                    onChange={(e) => setPhone(i, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 shrink-0"
                    disabled={!contact.phones.enabled || contact.phones.numbers.length <= 1}
                    onClick={() => removePhone(i)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              disabled={!contact.phones.enabled || contact.phones.numbers.length >= 10}
              onClick={addPhone}
            >
              <Plus size={16} />
              {language === "ar" ? "إضافة رقم" : "Add number"}
            </Button>
          </div>

          {/* Email */}
          <div className="rounded-2xl border border-surface bg-white/70 p-3 sm:p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-secondary">
                {language === "ar" ? "البريد الإلكتروني" : "Email"}
              </span>
              <Toggle
                checked={contact.email.enabled}
                onChange={(enabled) =>
                  onContactChange({
                    ...contact,
                    email: { ...contact.email, enabled },
                  })
                }
              />
            </div>
            <Input
              className="dir-ltr text-start"
              type="email"
              disabled={!contact.email.enabled}
              value={contact.email.value}
              placeholder="support@example.com"
              onChange={(e) =>
                onContactChange({
                  ...contact,
                  email: { ...contact.email, value: e.target.value },
                })
              }
            />
          </div>

          {/* Hours */}
          <div className="rounded-2xl border border-surface bg-white/70 p-3 sm:p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-secondary">
                {language === "ar" ? "ساعات العمل" : "Working hours"}
              </span>
              <Toggle
                checked={contact.hours.enabled}
                onChange={(enabled) =>
                  onContactChange({
                    ...contact,
                    hours: { ...contact.hours, enabled },
                  })
                }
              />
            </div>
            <FormField label={language === "ar" ? "ساعات العمل" : "Working hours"}>
              <LocaleTextarea
                rows={2}
                disabled={!contact.hours.enabled}
                ar={contact.hours.text.ar}
                en={contact.hours.text.en}
                onArChange={(ar) =>
                  onContactChange({
                    ...contact,
                    hours: {
                      ...contact.hours,
                      text: { ar, en: "" },
                    },
                  })
                }
                placeholder={
                  language === "ar"
                    ? "الأحد - الخميس: 9 ص - 10 م"
                    : "Switch to Arabic to edit…"
                }
              />
            </FormField>
          </div>

          {/* Map */}
          <div className="rounded-2xl border border-surface bg-white/70 p-3 sm:p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-secondary">
                {language === "ar" ? "خريطة الموقع" : "Location map"}
              </span>
              <Toggle
                checked={contact.map.enabled}
                onChange={(enabled) =>
                  onContactChange({
                    ...contact,
                    map: { ...contact.map, enabled },
                  })
                }
              />
            </div>
            <FormField
              label={
                language === "ar"
                  ? "رابط التضمين / خرائط جوجل"
                  : "Embed / Google Maps URL"
              }
            >
              <Textarea
                rows={2}
                className="dir-ltr text-start"
                disabled={!contact.map.enabled}
                value={contact.map.embedUrl}
                placeholder="https://www.google.com/maps/embed?..."
                onChange={(e) =>
                  onContactChange({
                    ...contact,
                    map: { ...contact.map, embedUrl: e.target.value },
                  })
                }
              />
            </FormField>
          </div>
        </div>
      </div>
    </section>
  );
}
