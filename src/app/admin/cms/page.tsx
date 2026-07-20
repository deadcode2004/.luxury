"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Megaphone, Save, Layout, Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import FormField from "@/components/ui/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import {
  ApiRequestError,
  fetchOwnerCms,
  updateOwnerCms,
  type CmsStorefront,
} from "@/lib/api/owner";
import {
  emptyHeroSlide,
  HERO_ACTION_OPTIONS,
  type HeroCtaActionType,
  type HeroSlide,
} from "@/lib/cms/hero";

const emptyCms = (): CmsStorefront => ({
  hero: {
    slides: [emptyHeroSlide({ action: { type: "shop_all" } })],
  },
  announcement: {
    enabled: true,
    text: { ar: "", en: "" },
  },
});

function clearSlideEn(slide: HeroSlide): HeroSlide {
  return {
    ...slide,
    heading: { ...slide.heading, en: "" },
    subtitle: { ...slide.subtitle, en: "" },
    description: { ...slide.description, en: "" },
    cta: { ...slide.cta, en: "" },
  };
}

export default function AdminCMS() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CmsStorefront>(emptyCms);
  const [activeSlide, setActiveSlide] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (dir: -1 | 1) => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(220, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const selectSlide = (index: number) => {
    setActiveSlide(index);
    // Keep the active tab visible inside the horizontal scroller.
    requestAnimationFrame(() => {
      const el = tabsRef.current;
      const btn = el?.querySelector<HTMLElement>(`[data-slide-tab="${index}"]`);
      btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  };

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchOwnerCms(token);
      const slides = data.hero?.slides?.length
        ? data.hero.slides
        : emptyCms().hero.slides;
      setForm({ ...data, hero: { slides } });
      setActiveSlide(0);
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
      setHasFetched(true);
    }
  }, [token, language, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateSlide = (index: number, patch: Partial<HeroSlide>, clearEn = false) => {
    setForm((f) => {
      const slides = f.hero.slides.map((s, i) => {
        if (i !== index) return s;
        const next = { ...s, ...patch };
        return clearEn ? clearSlideEn(next) : next;
      });
      return { ...f, hero: { slides } };
    });
  };

  const updateSlideLocale = (
    index: number,
    field: "heading" | "subtitle" | "description" | "cta",
    ar: string
  ) => {
    setForm((f) => {
      const slides = f.hero.slides.map((s, i) => {
        if (i !== index) return s;
        return { ...s, [field]: { ar, en: "" } };
      });
      return { ...f, hero: { slides } };
    });
  };

  const addSlide = () => {
    setForm((f) => {
      if (f.hero.slides.length >= 10) return f;
      return {
        ...f,
        hero: { slides: [...f.hero.slides, emptyHeroSlide({ action: { type: "shop_all" } })] },
      };
    });
    setActiveSlide((i) => {
      const next = form.hero.slides.length;
      return next >= 10 ? i : next;
    });
    requestAnimationFrame(() => {
      const el = tabsRef.current;
      if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    });
  };

  const removeSlide = (index: number) => {
    setForm((f) => {
      if (f.hero.slides.length <= 1) return f;
      const slides = f.hero.slides.filter((_, i) => i !== index);
      return { ...f, hero: { slides } };
    });
    const nextIndex = Math.max(0, Math.min(activeSlide, form.hero.slides.length - 2));
    selectSlide(nextIndex);
  };

  const moveSlide = (index: number, dir: -1 | 1) => {
    setForm((f) => {
      const target = index + dir;
      if (target < 0 || target >= f.hero.slides.length) return f;
      const slides = [...f.hero.slides];
      const tmp = slides[index];
      slides[index] = slides[target];
      slides[target] = tmp;
      return { ...f, hero: { slides } };
    });
    selectSlide(index + dir);
  };

  const save = async () => {
    if (!token) return;
    const next: Record<string, string> = {};
    form.hero.slides.forEach((slide, i) => {
      if (!slide.heading.ar.trim()) {
        next[`slide-${i}-heading`] =
          language === "ar" ? `عنوان الشريحة ${i + 1} مطلوب` : `Slide ${i + 1} heading required`;
      }
      if (!slide.image.trim()) {
        next[`slide-${i}-image`] =
          language === "ar" ? `صورة الشريحة ${i + 1} مطلوبة` : `Slide ${i + 1} image required`;
      }
      if (slide.action.type === "custom" && !slide.action.href?.trim()) {
        next[`slide-${i}-href`] =
          language === "ar" ? `رابط الشريحة ${i + 1} مطلوب` : `Slide ${i + 1} link required`;
      }
    });
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
      const payload: CmsStorefront = {
        ...form,
        hero: {
          slides: form.hero.slides.map((s) => clearSlideEn(s)),
        },
        announcement: {
          ...form.announcement,
          text: { ar: form.announcement.text.ar, en: "" },
        },
      };
      const saved = await updateOwnerCms(token, payload);
      setForm({
        ...saved,
        hero: { slides: saved.hero?.slides?.length ? saved.hero.slides : form.hero.slides },
      });
      toast(language === "ar" ? "✔ تم حفظ محتوى المتجر" : "✔ Store content saved", "success");
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : "Save failed", "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !hasFetched) {
    return (
      <div className="py-20 text-center text-gray-400">
        {language === "ar" ? "جاري التحميل..." : "Loading..."}
      </div>
    );
  }

  const slide = form.hero.slides[activeSlide] ?? form.hero.slides[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary tracking-tight">
            {language === "ar" ? "محتوى المتجر" : "Store Content"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {language === "ar"
              ? "شرائح البطل والشريط الإعلاني — عربي فقط مع ترجمة تلقائية"
              : "Hero slides and announcement — Arabic only with auto-translation"}
          </p>
        </div>
        <Button variant="secondary" size="md" loading={saving} onClick={() => void save()}>
          <Save size={18} />
          {language === "ar" ? "حفظ التغييرات" : "Save changes"}
        </Button>
      </div>

      <section className="w-full rounded-3xl border border-surface bg-white/70 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-surface/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background/60">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layout size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-secondary">
                {language === "ar" ? "قسم البطل (Hero)" : "Hero section"}
              </h3>
              <p className="text-xs text-gray-400">
                {language === "ar"
                  ? "حتى 10 شرائح — لكل صورة عنوان وزر وإجراء مستقل"
                  : "Up to 10 slides — each with its own copy and CTA action"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 self-start sm:self-auto"
            onClick={addSlide}
            disabled={form.hero.slides.length >= 10}
          >
            <Plus size={16} />
            {language === "ar" ? "إضافة شريحة" : "Add slide"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
          {/* Hero editor */}
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col gap-5 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <button
                type="button"
                onClick={() => scrollTabs(-1)}
                className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-surface bg-background text-secondary/70 hover:border-primary/40 hover:text-primary transition-colors"
                aria-label={language === "ar" ? "تمرير الشرائح" : "Scroll slides"}
              >
                <ChevronLeft size={16} />
              </button>

              <div
                ref={tabsRef}
                className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {form.hero.slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    data-slide-tab={i}
                    onClick={() => selectSlide(i)}
                    className={`snap-start shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${
                      i === activeSlide
                        ? "bg-primary text-background border-primary"
                        : "bg-background border-surface text-secondary/70 hover:border-primary/40"
                    }`}
                  >
                    {language === "ar" ? `شريحة ${i + 1}` : `Slide ${i + 1}`}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollTabs(1)}
                className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-surface bg-background text-secondary/70 hover:border-primary/40 hover:text-primary transition-colors"
                aria-label={language === "ar" ? "تمرير الشرائح" : "Scroll slides"}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {slide ? (
              <div key={slide.id} className="grid grid-cols-1 md:grid-cols-12 gap-5 min-w-0">
                <div className="md:col-span-4 flex flex-col gap-3 min-w-0">
                  <FormField
                    label={language === "ar" ? "صورة الشريحة" : "Slide image"}
                    error={errors[`slide-${activeSlide}-image`]}
                  >
                    <ImageUploadField
                      value={slide.image}
                      onChange={(url) => updateSlide(activeSlide, { image: url })}
                      folder="cms"
                      error={errors[`slide-${activeSlide}-image`]}
                    />
                  </FormField>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={activeSlide === 0}
                      onClick={() => moveSlide(activeSlide, -1)}
                    >
                      <ChevronUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={activeSlide >= form.hero.slides.length - 1}
                      onClick={() => moveSlide(activeSlide, 1)}
                    >
                      <ChevronDown size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 ms-auto"
                      disabled={form.hero.slides.length <= 1}
                      onClick={() => removeSlide(activeSlide)}
                    >
                      <Trash2 size={16} />
                      {language === "ar" ? "حذف" : "Delete"}
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-8 flex flex-col gap-4 min-w-0">
                  <p className="text-xs text-secondary/50">
                    {language === "ar"
                      ? "اكتب بالعربية فقط — الترجمة الإنجليزية تُحفظ تلقائياً عند الحفظ."
                      : "Arabic only — English is auto-translated and saved on submit."}
                  </p>
                  <FormField
                    label={language === "ar" ? "العنوان" : "Heading"}
                    error={errors[`slide-${activeSlide}-heading`]}
                  >
                    <Input
                      value={slide.heading.ar}
                      onChange={(e) => updateSlideLocale(activeSlide, "heading", e.target.value)}
                    />
                  </FormField>
                  <FormField label={language === "ar" ? "العنوان الفرعي" : "Subtitle"}>
                    <Input
                      value={slide.subtitle.ar}
                      onChange={(e) => updateSlideLocale(activeSlide, "subtitle", e.target.value)}
                    />
                  </FormField>
                  <FormField label={language === "ar" ? "الوصف" : "Description"}>
                    <Textarea
                      rows={3}
                      value={slide.description.ar}
                      onChange={(e) => updateSlideLocale(activeSlide, "description", e.target.value)}
                    />
                  </FormField>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label={language === "ar" ? "نص الزر" : "Button text"}>
                      <Input
                        value={slide.cta.ar}
                        onChange={(e) => updateSlideLocale(activeSlide, "cta", e.target.value)}
                      />
                    </FormField>
                    <FormField label={language === "ar" ? "إجراء الزر" : "Button action"}>
                      <Select
                        className="h-12"
                        value={slide.action.type}
                        onChange={(e) =>
                          updateSlide(activeSlide, {
                            action: {
                              type: e.target.value as HeroCtaActionType,
                              href: slide.action.href,
                            },
                          })
                        }
                      >
                        {HERO_ACTION_OPTIONS.map((opt) => (
                          <option key={opt.type} value={opt.type}>
                            {opt.label[language]}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                  {slide.action.type === "custom" ? (
                    <FormField
                      label={language === "ar" ? "الرابط المخصص" : "Custom link"}
                      error={errors[`slide-${activeSlide}-href`]}
                    >
                      <Input
                        className="dir-ltr text-start"
                        placeholder="/shop or https://..."
                        value={slide.action.href || ""}
                        onChange={(e) =>
                          updateSlide(activeSlide, {
                            action: { type: "custom", href: e.target.value },
                          })
                        }
                      />
                    </FormField>
                  ) : (
                    <p className="text-xs text-secondary/45">
                      {
                        HERO_ACTION_OPTIONS.find((o) => o.type === slide.action.type)?.description[
                          language
                        ]
                      }
                    </p>
                  )}
                  {slide.heading.en ? (
                    <p className="text-xs text-gray-400 dir-ltr text-start">EN: {slide.heading.en}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {/* Announcement beside Hero — same card, no orphan empty column */}
          <aside className="lg:col-span-4 min-w-0 border-t lg:border-t-0 lg:border-s border-surface bg-background/50 flex flex-col">
            <div className="px-4 sm:px-5 py-4 border-b border-surface/70 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Megaphone size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-secondary text-sm sm:text-base">
                    {language === "ar" ? "الشريط الإعلاني" : "Announcement"}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-snug mt-0.5">
                    {language === "ar"
                      ? "عربي فقط — ترجمة وتحويل العملة تلقائياً"
                      : "Arabic only — auto translate & currency"}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
              </label>
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
              <FormField
                label={language === "ar" ? "نص الإعلان (عربي فقط)" : "Announcement (Arabic only)"}
                error={errors.announcementAr}
              >
                <Textarea
                  rows={4}
                  disabled={!form.announcement.enabled}
                  value={form.announcement.text.ar}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      announcement: {
                        ...f.announcement,
                        text: { ar: e.target.value, en: "" },
                      },
                    }))
                  }
                  placeholder={
                    language === "ar"
                      ? "مثال: شحن مجاني للطلبات فوق 500 ج.م"
                      : "Example: شحن مجاني للطلبات فوق 500 ج.م"
                  }
                />
              </FormField>

              <p className="text-xs text-secondary/50 leading-relaxed">
                {language === "ar"
                  ? "يُترجم تلقائياً عند الحفظ. اكتب المبالغ بالجنيه (مثل 500 ج.م)."
                  : "Auto-translated on save. Write amounts in EGP (e.g. 500 ج.م)."}
              </p>

              {form.announcement.enabled && form.announcement.text.ar ? (
                <div className="mt-auto rounded-xl bg-secondary text-background text-center text-sm py-3 px-3 break-words">
                  {form.announcement.text.ar}
                </div>
              ) : null}

              {form.announcement.text.en ? (
                <p className="text-xs text-gray-400 dir-ltr text-start break-words">
                  EN: {form.announcement.text.en}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <Card variant="panel" padding="md" className="text-sm text-gray-500 leading-relaxed w-full">
        {language === "ar"
          ? "احفظ التغييرات ثم افتح الصفحة الرئيسية للتأكد من ظهور الشرائح والشريط الإعلاني."
          : "Save changes, then open the homepage to verify hero slides and the announcement bar."}
      </Card>
    </div>
  );
}
