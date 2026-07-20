"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Image as ImageIcon, Megaphone, Save, Layout } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FormField from "@/components/ui/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import {
  ApiRequestError,
  fetchOwnerCms,
  updateOwnerCms,
  type CmsStorefront,
} from "@/lib/api/owner";

const emptyCms = (): CmsStorefront => ({
  hero: {
    heading: { ar: "", en: "" },
    subtitle: { ar: "", en: "" },
    description: { ar: "", en: "" },
    cta: { ar: "", en: "" },
    link: "/shop",
    image: "",
  },
  announcement: {
    enabled: true,
    text: { ar: "", en: "" },
  },
});

export default function AdminCMS() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CmsStorefront>(emptyCms);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setForm(await fetchOwnerCms(token));
    } catch (err) {
      toast(
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "تعذر تحميل المحتوى"
            : "Failed to load CMS",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  }, [token, language, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!token) return;
    const next: Record<string, string> = {};
    if (!form.hero.heading.ar.trim()) {
      next.headingAr = language === "ar" ? "مطلوب" : "Required";
    }
    if (form.announcement.enabled && !form.announcement.text.ar.trim()) {
      next.announcementAr = language === "ar" ? "نص الإعلان مطلوب" : "Announcement required";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      toast(
        language === "ar" ? "يرجى تعبئة الحقول المطلوبة" : "Please fill required fields",
        "warning"
      );
      return;
    }

    setSaving(true);
    try {
      const saved = await updateOwnerCms(token, form);
      setForm(saved);
      toast(language === "ar" ? "✔ تم حفظ محتوى المتجر" : "✔ Store content saved", "success");
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : "Save failed", "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">
        {language === "ar" ? "جاري التحميل..." : "Loading..."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary tracking-tight">
            {language === "ar" ? "محتوى المتجر" : "Store Content"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {language === "ar"
              ? "البطل والشريط الإعلاني يظهران مباشرة في واجهة المتجر"
              : "Hero and announcement bar appear live on the storefront"}
          </p>
        </div>
        <Button variant="secondary" size="md" loading={saving} onClick={() => void save()}>
          <Save size={18} />
          {language === "ar" ? "حفظ التغييرات" : "Save changes"}
        </Button>
      </div>

      <section className="rounded-3xl border border-surface bg-white/70 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface/70 flex items-center gap-3 bg-background/60">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layout size={18} />
          </span>
          <div>
            <h3 className="font-bold text-secondary">
              {language === "ar" ? "قسم البطل (Hero)" : "Hero section"}
            </h3>
            <p className="text-xs text-gray-400">
              {language === "ar" ? "العنوان والصورة والزر الرئيسي" : "Headline, image, and primary CTA"}
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <FormField
              label={language === "ar" ? "العنوان (عربي)" : "Heading (Arabic)"}
              error={errors.headingAr}
            >
              <Input
                value={form.hero.heading.ar}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    hero: { ...f.hero, heading: { ...f.hero.heading, ar: e.target.value } },
                  }))
                }
              />
            </FormField>
            <FormField label={language === "ar" ? "العنوان (إنجليزي)" : "Heading (English)"}>
              <Input
                className="dir-ltr text-start"
                value={form.hero.heading.en}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    hero: { ...f.hero, heading: { ...f.hero.heading, en: e.target.value } },
                  }))
                }
              />
            </FormField>
            <FormField label={language === "ar" ? "العنوان الفرعي (عربي)" : "Subtitle (Arabic)"}>
              <Input
                value={form.hero.subtitle.ar}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    hero: { ...f.hero, subtitle: { ...f.hero.subtitle, ar: e.target.value } },
                  }))
                }
              />
            </FormField>
            <FormField label={language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}>
              <Textarea
                rows={3}
                value={form.hero.description.ar}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    hero: {
                      ...f.hero,
                      description: { ...f.hero.description, ar: e.target.value },
                    },
                  }))
                }
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={language === "ar" ? "نص الزر" : "CTA label"}>
                <Input
                  value={form.hero.cta.ar}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      hero: { ...f.hero, cta: { ...f.hero.cta, ar: e.target.value } },
                    }))
                  }
                />
              </FormField>
              <FormField label={language === "ar" ? "رابط الزر" : "CTA link"}>
                <Input
                  value={form.hero.link}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      hero: { ...f.hero, link: e.target.value },
                    }))
                  }
                />
              </FormField>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
              <ImageIcon size={16} />
              {language === "ar" ? "صورة الخلفية" : "Background image"}
            </label>
            <ImageUploadField
              value={form.hero.image}
              onChange={(url) =>
                setForm((f) => ({ ...f, hero: { ...f.hero, image: url } }))
              }
              folder="cms"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-surface bg-white/70 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface/70 flex items-center justify-between gap-3 bg-background/60">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Megaphone size={18} />
            </span>
            <div>
              <h3 className="font-bold text-secondary">
                {language === "ar" ? "الشريط الإعلاني" : "Announcement bar"}
              </h3>
              <p className="text-xs text-gray-400">
                {language === "ar"
                  ? "يظهر أعلى صفحات المتجر عند التفعيل"
                  : "Shows above storefront pages when enabled"}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.announcement.enabled}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  announcement: { ...f.announcement, enabled: e.target.checked },
                }))
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            <span className="ms-3 text-sm font-bold text-gray-600">
              {form.announcement.enabled
                ? language === "ar"
                  ? "مفعّل"
                  : "On"
                : language === "ar"
                  ? "متوقف"
                  : "Off"}
            </span>
          </label>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === "ar" ? "نص الإعلان (عربي)" : "Announcement (Arabic)"}
            error={errors.announcementAr}
          >
            <Input
              disabled={!form.announcement.enabled}
              value={form.announcement.text.ar}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  announcement: {
                    ...f.announcement,
                    text: { ...f.announcement.text, ar: e.target.value },
                  },
                }))
              }
            />
          </FormField>
          <FormField label={language === "ar" ? "نص الإعلان (إنجليزي)" : "Announcement (English)"}>
            <Input
              className="dir-ltr text-start"
              disabled={!form.announcement.enabled}
              value={form.announcement.text.en}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  announcement: {
                    ...f.announcement,
                    text: { ...f.announcement.text, en: e.target.value },
                  },
                }))
              }
            />
          </FormField>

          {form.announcement.enabled && form.announcement.text.ar ? (
            <div className="md:col-span-2 rounded-xl bg-secondary text-background text-center text-sm py-3 px-4">
              {form.announcement.text[language] || form.announcement.text.ar}
            </div>
          ) : null}
        </div>
      </section>

      <Card variant="panel" padding="md" className="text-sm text-gray-500 leading-relaxed">
        {language === "ar"
          ? "احفظ التغييرات ثم افتح الصفحة الرئيسية للتأكد من ظهور الشريط الإعلاني وقسم البطل."
          : "Save changes, then open the homepage to verify the announcement bar and hero section."}
      </Card>
    </div>
  );
}
