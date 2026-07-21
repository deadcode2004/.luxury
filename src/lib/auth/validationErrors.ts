import { ApiRequestError } from "@/lib/api/client";

type Lang = "ar" | "en";

const FIELD_MESSAGES: Record<string, { taken: { ar: string; en: string }; fallback: { ar: string; en: string } }> = {
  phone: {
    taken: {
      ar: "رقم الهاتف مستخدم بالفعل",
      en: "This phone number is already registered",
    },
    fallback: {
      ar: "رقم الهاتف غير صالح",
      en: "Invalid phone number",
    },
  },
  email: {
    taken: {
      ar: "البريد الإلكتروني مستخدم بالفعل",
      en: "This email is already registered",
    },
    fallback: {
      ar: "البريد الإلكتروني غير صالح",
      en: "Invalid email",
    },
  },
  password: {
    taken: { ar: "كلمة المرور غير صالحة", en: "Invalid password" },
    fallback: { ar: "كلمة المرور غير صالحة", en: "Invalid password" },
  },
  first_name: {
    taken: { ar: "الاسم غير صالح", en: "Invalid first name" },
    fallback: { ar: "الاسم غير صالح", en: "Invalid first name" },
  },
  last_name: {
    taken: { ar: "اسم العائلة غير صالح", en: "Invalid last name" },
    fallback: { ar: "اسم العائلة غير صالح", en: "Invalid last name" },
  },
};

function localizeFieldMessage(field: string, raw: string, language: Lang): string {
  const known = FIELD_MESSAGES[field];
  const lower = raw.toLowerCase();
  if (known && (lower.includes("taken") || lower.includes("already"))) {
    return known.taken[language];
  }
  if (known) return known.fallback[language];
  return raw;
}

/** Map Laravel/API validation bags into per-field UI messages. */
export function mapApiFieldErrors(
  errors: Record<string, string[]> | undefined,
  language: Lang
): Record<string, string> {
  if (!errors) return {};
  const next: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    const raw = messages?.[0];
    if (!raw) continue;
    next[field] = localizeFieldMessage(field, raw, language);
  }
  return next;
}

export function fieldErrorsFromUnknown(error: unknown, language: Lang): Record<string, string> {
  if (error instanceof ApiRequestError) {
    return mapApiFieldErrors(error.errors, language);
  }
  return {};
}
