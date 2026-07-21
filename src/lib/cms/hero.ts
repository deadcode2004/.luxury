import type { LocaleText } from "@/lib/api/owner";

/** Flexible CTA actions for hero slides (mapped to shop filters / custom URLs). */
export type HeroCtaActionType =
  | "shop_all"
  | "shop_new"
  | "shop_offers"
  | "shop_discounts"
  | "shop_featured"
  | "custom";

export type HeroCtaAction = {
  type: HeroCtaActionType;
  /** Used when type === "custom". */
  href?: string;
};

export type HeroSlide = {
  id: string;
  image: string;
  heading: LocaleText;
  subtitle: LocaleText;
  description: LocaleText;
  cta: LocaleText;
  action: HeroCtaAction;
};

export const HERO_ACTION_OPTIONS: {
  type: HeroCtaActionType;
  label: LocaleText;
  description: LocaleText;
}[] = [
  {
    type: "shop_all",
    label: { ar: "تسوق الآن (كل المنتجات)", en: "Shop all products" },
    description: { ar: "يفتح صفحة المتجر بالكامل", en: "Opens the full shop" },
  },
  {
    type: "shop_new",
    label: { ar: "اكتشف الجديد", en: "Discover new" },
    description: { ar: "المنتجات المعلّمة كجديد فقط", en: "Only products marked as new" },
  },
  {
    type: "shop_offers",
    label: { ar: "العروض", en: "Offers" },
    description: { ar: "المنتجات ضمن قسم العروض", en: "Products marked as offers" },
  },
  {
    type: "shop_discounts",
    label: { ar: "الخصومات", en: "Discounts" },
    description: { ar: "المنتجات التي عليها خصم فقط", en: "Only discounted products" },
  },
  {
    type: "shop_featured",
    label: { ar: "المميزة", en: "Featured" },
    description: { ar: "المنتجات المميزة فقط", en: "Featured products only" },
  },
  {
    type: "custom",
    label: { ar: "رابط مخصص", en: "Custom link" },
    description: { ar: "أي مسار أو رابط تحدده", en: "Any path or URL you set" },
  },
];

export function heroActionHref(action?: HeroCtaAction | null): string {
  if (!action) return "/shop";
  switch (action.type) {
    case "shop_new":
      return "/shop?filter=new";
    case "shop_offers":
      return "/shop?filter=offers";
    case "shop_discounts":
      return "/shop?filter=discounts";
    case "shop_featured":
      return "/shop?filter=featured";
    case "custom":
      return action.href?.trim() || "/shop";
    case "shop_all":
    default:
      return "/shop";
  }
}

export function emptyHeroSlide(partial?: Partial<HeroSlide>): HeroSlide {
  return {
    id: partial?.id || `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    image: partial?.image || "",
    heading: partial?.heading || { ar: "", en: "" },
    subtitle: partial?.subtitle || { ar: "", en: "" },
    description: partial?.description || { ar: "", en: "" },
    cta: partial?.cta || { ar: "", en: "" },
    action: partial?.action || { type: "shop_all" },
  };
}
