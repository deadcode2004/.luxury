import type { LocaleText } from "@/lib/api/owner";

export type SocialPlatform =
  | "twitter"
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "tiktok"
  | "linkedin";

export type SocialLink = {
  enabled: boolean;
  /** Profile/page URL for most platforms; phone (with country code) for WhatsApp. */
  value: string;
};

export type CmsSocial = Record<SocialPlatform, SocialLink>;

export type CmsContact = {
  address: {
    enabled: boolean;
    text: LocaleText;
  };
  phones: {
    enabled: boolean;
    numbers: string[];
  };
  email: {
    enabled: boolean;
    value: string;
  };
  hours: {
    enabled: boolean;
    text: LocaleText;
  };
  map: {
    enabled: boolean;
    /** Google Maps embed URL or share link. */
    embedUrl: string;
  };
};

export const SOCIAL_PLATFORMS: {
  key: SocialPlatform;
  label: LocaleText;
  placeholder: string;
  /** WhatsApp uses phone input; others use URL. */
  kind: "url" | "phone";
}[] = [
  {
    key: "twitter",
    label: { ar: "تويتر / X", en: "Twitter / X" },
    placeholder: "https://x.com/...",
    kind: "url",
  },
  {
    key: "instagram",
    label: { ar: "إنستغرام", en: "Instagram" },
    placeholder: "https://instagram.com/...",
    kind: "url",
  },
  {
    key: "facebook",
    label: { ar: "فيسبوك", en: "Facebook" },
    placeholder: "https://facebook.com/...",
    kind: "url",
  },
  {
    key: "whatsapp",
    label: { ar: "واتساب", en: "WhatsApp" },
    placeholder: "2010xxxxxxx",
    kind: "phone",
  },
  {
    key: "tiktok",
    label: { ar: "تيك توك", en: "TikTok" },
    placeholder: "https://tiktok.com/@...",
    kind: "url",
  },
  {
    key: "linkedin",
    label: { ar: "لينكدإن", en: "LinkedIn" },
    placeholder: "https://linkedin.com/company/...",
    kind: "url",
  },
];

export function emptySocialLink(): SocialLink {
  return { enabled: false, value: "" };
}

export function emptyCmsSocial(): CmsSocial {
  return {
    twitter: emptySocialLink(),
    instagram: emptySocialLink(),
    facebook: emptySocialLink(),
    whatsapp: emptySocialLink(),
    tiktok: emptySocialLink(),
    linkedin: emptySocialLink(),
  };
}

export function emptyCmsContact(): CmsContact {
  return {
    address: { enabled: false, text: { ar: "", en: "" } },
    phones: { enabled: false, numbers: [""] },
    email: { enabled: false, value: "" },
    hours: { enabled: false, text: { ar: "", en: "" } },
    map: { enabled: false, embedUrl: "" },
  };
}

/** Digits only (keeps country code). Used for wa.me links. */
export function whatsappDigits(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

/**
 * Build a universal WhatsApp chat URL from a phone number with country code.
 * Works from any visitor country via wa.me.
 */
export function whatsappChatUrl(phone: string): string | null {
  const digits = whatsappDigits(phone);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

export function socialHref(platform: SocialPlatform, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (platform === "whatsapp") return whatsappChatUrl(trimmed);
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Prefer iframe-ready embed URL; fall back to original. */
export function mapEmbedSrc(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  if (url.includes("google.com/maps/embed")) return url;
  // Convert common share links to embed when possible.
  const coords = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coords) {
    return `https://maps.google.com/maps?q=${coords[1]},${coords[2]}&z=15&output=embed`;
  }
  if (url.includes("maps.google.") || url.includes("google.com/maps")) {
    try {
      const u = new URL(url);
      const q = u.searchParams.get("q") || u.searchParams.get("query");
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
      }
    } catch {
      /* ignore */
    }
  }
  return url;
}
