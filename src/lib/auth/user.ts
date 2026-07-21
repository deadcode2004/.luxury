export type AuthRole = "owner" | "user";

export type AuthUser = {
  id: number;
  name: string;
  name_i18n?: { ar?: string; en?: string } | null;
  first_name?: string;
  first_name_i18n?: { ar?: string; en?: string } | null;
  last_name?: string;
  last_name_i18n?: { ar?: string; en?: string } | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: AuthRole;
  is_active?: boolean;
  notify_orders?: boolean;
  notify_stock?: boolean;
  notify_marketing?: boolean;
};

/** Strict role parse — anything else is rejected (no defaulting to owner). */
export function normalizeAuthRole(role: unknown): AuthRole | null {
  if (role === "owner" || role === "user") return role;
  return null;
}

/**
 * Accept only a well-formed API/localStorage user.
 * Prevents stale/partial objects from unlocking Owner/User menus.
 */
export function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const id = Number(value.id);
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const role = normalizeAuthRole(value.role);
  if (!Number.isFinite(id) || id <= 0 || !email || !role) return null;

  return {
    id,
    email,
    role,
    name: typeof value.name === "string" ? value.name : email,
    name_i18n: (value.name_i18n as AuthUser["name_i18n"]) ?? null,
    first_name: typeof value.first_name === "string" ? value.first_name : undefined,
    first_name_i18n: (value.first_name_i18n as AuthUser["first_name_i18n"]) ?? null,
    last_name: typeof value.last_name === "string" ? value.last_name : undefined,
    last_name_i18n: (value.last_name_i18n as AuthUser["last_name_i18n"]) ?? null,
    phone: typeof value.phone === "string" || value.phone === null ? (value.phone as string | null) : null,
    avatar: typeof value.avatar === "string" || value.avatar === null ? (value.avatar as string | null) : null,
    is_active: typeof value.is_active === "boolean" ? value.is_active : undefined,
    notify_orders: typeof value.notify_orders === "boolean" ? value.notify_orders : undefined,
    notify_stock: typeof value.notify_stock === "boolean" ? value.notify_stock : undefined,
    notify_marketing: typeof value.notify_marketing === "boolean" ? value.notify_marketing : undefined,
  };
}
