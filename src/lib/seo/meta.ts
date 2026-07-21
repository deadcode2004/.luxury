export type AppLanguage = "ar" | "en";

export type PageSeo = {
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  keywords: { ar: string; en: string };
  path: string;
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://luxury-khaki-eight.vercel.app";

export const PAGE_SEO: Record<string, PageSeo> = {
  home: {
    path: "/",
    title: {
      ar: "PARADISE | متجر الفخامة والعناية الفاخرة",
      en: "PARADISE | Luxury Beauty & Wellness Store",
    },
    description: {
      ar: "اكتشف مجموعة PARADISE الحصرية من العطور والعناية بالبشرة والمنتجات الفاخرة مع شحن سريع وتجربة تسوق راقية.",
      en: "Discover PARADISE exclusive fragrances, skincare, and luxury wellness products with refined shopping and fast delivery.",
    },
    keywords: {
      ar: "بارادايس, عطور فاخرة, عناية بالبشرة, متجر إلكتروني, السعودية",
      en: "paradise, luxury perfume, skincare, ecommerce, saudi arabia",
    },
  },
  shop: {
    path: "/shop",
    title: { ar: "تسوق منتجات PARADISE", en: "Shop PARADISE Products" },
    description: {
      ar: "تصفح جميع منتجات PARADISE الفاخرة مع فلترة حسب التصنيف والسعر والمنتجات المميزة.",
      en: "Browse all PARADISE luxury products with filters for category, price, and featured picks.",
    },
    keywords: {
      ar: "تسوق, منتجات فاخرة, عطور, كريمات",
      en: "shop, luxury products, perfume, creams",
    },
  },
  collections: {
    path: "/collections",
    title: { ar: "مجموعات PARADISE", en: "PARADISE Collections" },
    description: {
      ar: "استكشف مجموعات PARADISE المختارة بعناية لكل أسلوب ومناسبة.",
      en: "Explore curated PARADISE collections crafted for every style and occasion.",
    },
    keywords: {
      ar: "مجموعات, كولكشن, بارادايس",
      en: "collections, curated sets, paradise",
    },
  },
  about: {
    path: "/about",
    title: { ar: "عن علامة PARADISE", en: "About PARADISE" },
    description: {
      ar: "تعرف على قصة PARADISE ورؤيتنا لتقديم منتجات أصلية وتجربة فخامة حقيقية.",
      en: "Learn the PARADISE story and our vision for authentic products and true luxury experiences.",
    },
    keywords: {
      ar: "عن الشركة, قصة العلامة, فخامة",
      en: "about brand, brand story, luxury",
    },
  },
  contact: {
    path: "/contact",
    title: { ar: "تواصل مع PARADISE", en: "Contact PARADISE" },
    description: {
      ar: "تواصل مع فريق PARADISE للاستفسارات والدعم وخدمة ما بعد البيع.",
      en: "Contact the PARADISE team for inquiries, support, and after-sales assistance.",
    },
    keywords: {
      ar: "تواصل, دعم العملاء, خدمة العملاء",
      en: "contact, customer support, help",
    },
  },
  cart: {
    path: "/cart",
    title: { ar: "سلة المشتريات", en: "Shopping Cart" },
    description: {
      ar: "راجع منتجات سلة PARADISE وعدّل الكميات قبل إتمام الشراء.",
      en: "Review your PARADISE cart and adjust quantities before checkout.",
    },
    keywords: { ar: "سلة, شراء, طلب", en: "cart, checkout, order" },
  },
  favorites: {
    path: "/favorites",
    title: { ar: "المفضلة", en: "Wishlist" },
    description: {
      ar: "احفظ منتجات PARADISE المفضلة لديك للعودة إليها لاحقاً.",
      en: "Save your favorite PARADISE products to revisit later.",
    },
    keywords: { ar: "مفضلة, قائمة الرغبات", en: "wishlist, favorites" },
  },
  checkout: {
    path: "/checkout",
    title: { ar: "إتمام الطلب", en: "Checkout" },
    description: {
      ar: "أكمل طلبك بأمان عبر صفحة الدفع في متجر PARADISE.",
      en: "Complete your order securely through the PARADISE checkout.",
    },
    keywords: { ar: "دفع, طلب, شحن", en: "payment, order, shipping" },
  },
  account: {
    path: "/account",
    title: { ar: "حسابي", en: "My Account" },
    description: {
      ar: "إدارة الملف الشخصي والطلبات والعناوين في حساب PARADISE.",
      en: "Manage your PARADISE profile, orders, and saved addresses.",
    },
    keywords: { ar: "حساب, طلباتي, عناوين", en: "account, orders, addresses" },
  },
  login: {
    path: "/login",
    title: { ar: "تسجيل الدخول", en: "Sign In" },
    description: {
      ar: "سجّل الدخول إلى حساب PARADISE لمتابعة الطلبات والمفضلة.",
      en: "Sign in to your PARADISE account to continue shopping and track orders.",
    },
    keywords: { ar: "تسجيل دخول, حساب", en: "login, sign in, account" },
  },
  register: {
    path: "/register",
    title: { ar: "إنشاء حساب", en: "Create Account" },
    description: {
      ar: "أنشئ حساب PARADISE جديداً واستمتع بتجربة تسوق فاخرة.",
      en: "Create a new PARADISE account and enjoy a refined shopping experience.",
    },
    keywords: { ar: "تسجيل, حساب جديد", en: "register, create account" },
  },
  admin: {
    path: "/admin",
    title: { ar: "لوحة الإدارة", en: "Admin Dashboard" },
    description: {
      ar: "لوحة تحكم مالك متجر PARADISE لإدارة المنتجات والطلبات.",
      en: "PARADISE owner dashboard for managing products and orders.",
    },
    keywords: { ar: "إدارة, لوحة تحكم", en: "admin, dashboard" },
  },
};

export function buildMetadata(page: PageSeo, language: AppLanguage = "ar") {
  const title = page.title[language];
  const description = page.description[language];
  const keywords = page.keywords[language];
  const url = `${SITE_URL}${page.path}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "PARADISE",
      locale: language === "ar" ? "ar_SA" : "en_US",
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}
