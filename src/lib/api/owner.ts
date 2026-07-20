import { apiRequest, ApiRequestError } from "@/lib/api/client";

export type LocaleText = { ar: string; en: string };
export type LocaleList = { ar: string[]; en: string[] };

export type ApiCategory = {
  id: number;
  code: string;
  name: LocaleText;
  image?: string | null;
  sort_order?: number;
};

export type ApiProduct = {
  id: number;
  code: string;
  category_id: number;
  category?: ApiCategory | null;
  name: LocaleText;
  brand: LocaleText;
  description?: LocaleText | null;
  ingredients?: LocaleList | null;
  usage?: LocaleText | null;
  price: number;
  old_price?: number | null;
  image: string;
  gallery?: string[];
  stock: number;
  inventory_status: string;
  rating: number;
  reviews: number;
  is_new: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
};

export type ApiCoupon = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  uses: number;
  max_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
  status: string;
};

export type ApiOrder = {
  id: number;
  number: string;
  status: string;
  total: number;
  currency?: string;
  customer?: { id: number; name?: string; email?: string } | null;
  items_count?: number;
  placed_at?: string | null;
};

export type DashboardData = {
  stats: {
    total_sales: number;
    active_orders: number;
    total_customers: number;
    conversion_rate: number;
    products_count?: number;
    low_stock_count?: number;
    out_of_stock_count?: number;
  };
  recent_orders: ApiOrder[];
  low_stock_products: ApiProduct[];
};

export type CmsStorefront = {
  hero: {
    heading: LocaleText;
    subtitle: LocaleText;
    description: LocaleText;
    cta: LocaleText;
    link: string;
    image: string;
  };
  announcement: {
    enabled: boolean;
    text: LocaleText;
  };
};

export type Paginated<T> = {
  items: T[];
  total: number;
  currentPage: number;
  lastPage: number;
};

async function ownerGet<T>(path: string, token: string): Promise<T> {
  return apiRequest<T>(path, { token, cache: "no-store" });
}

export async function fetchOwnerDashboard(token: string) {
  return ownerGet<DashboardData>("/owner/dashboard", token);
}

export async function fetchOwnerInventory(token: string, search = "") {
  const q = search ? `&search=${encodeURIComponent(search)}` : "";
  const data = await apiRequest<ApiProduct[]>(`/owner/inventory?per_page=50${q}`, {
    token,
    cache: "no-store",
  });
  return data;
}

export async function createProduct(token: string, body: Record<string, unknown>) {
  return apiRequest<ApiProduct>("/owner/inventory", { method: "POST", token, body, cache: "no-store" });
}

export async function updateProduct(token: string, id: number, body: Record<string, unknown>) {
  return apiRequest<ApiProduct>(`/owner/inventory/${id}`, {
    method: "PUT",
    token,
    body,
    cache: "no-store",
  });
}

export async function deleteProduct(token: string, id: number) {
  return apiRequest<null>(`/owner/inventory/${id}`, { method: "DELETE", token, cache: "no-store" });
}

export async function fetchOwnerCategories(token: string) {
  return ownerGet<ApiCategory[]>("/owner/categories", token);
}

export async function resolveCategory(token: string, arabicName: string) {
  return apiRequest<ApiCategory>("/owner/categories/resolve", {
    method: "POST",
    token,
    body: { name: { ar: arabicName } },
    cache: "no-store",
  });
}

export async function updateCategory(
  token: string,
  id: number,
  body: { name?: { ar: string; en?: string }; image?: string; is_active?: boolean }
) {
  return apiRequest<ApiCategory>(`/owner/categories/${id}`, {
    method: "PUT",
    token,
    body,
    cache: "no-store",
  });
}

export async function deleteCategory(token: string, id: number) {
  return apiRequest<null>(`/owner/categories/${id}`, { method: "DELETE", token, cache: "no-store" });
}

export async function fetchOwnerCoupons(token: string, search = "") {
  const q = search ? `&search=${encodeURIComponent(search)}` : "";
  return apiRequest<ApiCoupon[]>(`/owner/coupons?per_page=50${q}`, { token, cache: "no-store" });
}

export async function createCoupon(token: string, body: Record<string, unknown>) {
  return apiRequest<ApiCoupon>("/owner/coupons", { method: "POST", token, body, cache: "no-store" });
}

export async function updateCoupon(token: string, id: number, body: Record<string, unknown>) {
  return apiRequest<ApiCoupon>(`/owner/coupons/${id}`, {
    method: "PUT",
    token,
    body,
    cache: "no-store",
  });
}

export async function deleteCoupon(token: string, id: number) {
  return apiRequest<null>(`/owner/coupons/${id}`, { method: "DELETE", token, cache: "no-store" });
}

export async function fetchOwnerCms(token: string) {
  return ownerGet<CmsStorefront>("/owner/cms", token);
}

export async function updateOwnerCms(token: string, body: Partial<CmsStorefront>) {
  return apiRequest<CmsStorefront>("/owner/cms", { method: "PUT", token, body, cache: "no-store" });
}

export async function fetchPublicCms() {
  return apiRequest<CmsStorefront>("/cms", { cache: "no-store" });
}

export async function fetchPublicCategories() {
  return apiRequest<ApiCategory[]>("/categories", { cache: "force-cache" });
}

export async function uploadOwnerFile(
  token: string,
  file: File,
  folder: "products" | "cms" | "categories" = "products"
) {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api/v1";
  const res = await fetch(`${API_BASE}/owner/uploads`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new ApiRequestError({
      message: json?.message || "Upload failed",
      code: json?.code,
      errors: json?.errors,
      status: res.status,
    });
  }

  return (json?.data ?? json) as { url: string; path: string };
}

/** Compute selling price + old_price from base price and discount. */
export function applyDiscount(
  basePrice: number,
  discountType: "none" | "fixed" | "percent",
  discountValue: number
): { price: number; old_price: number | null } {
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    return { price: 0, old_price: null };
  }
  if (discountType === "none" || !discountValue || discountValue <= 0) {
    return { price: Number(basePrice.toFixed(2)), old_price: null };
  }
  if (discountType === "percent") {
    const pct = Math.min(Math.max(discountValue, 0), 100);
    const price = Number((basePrice * (1 - pct / 100)).toFixed(2));
    return { price, old_price: Number(basePrice.toFixed(2)) };
  }
  const fixed = Math.min(discountValue, basePrice);
  const price = Number((basePrice - fixed).toFixed(2));
  return { price, old_price: Number(basePrice.toFixed(2)) };
}

/** Reverse-engineer discount fields from stored price/old_price for edit forms. */
export function inferDiscount(
  price: number,
  oldPrice?: number | null
): { basePrice: number; discountType: "none" | "fixed" | "percent"; discountValue: number } {
  if (!oldPrice || oldPrice <= price) {
    return { basePrice: price, discountType: "none", discountValue: 0 };
  }
  const fixed = Number((oldPrice - price).toFixed(2));
  const pct = Number((((oldPrice - price) / oldPrice) * 100).toFixed(2));
  // Prefer percent when it lands on a clean whole number
  if (Math.abs(pct - Math.round(pct)) < 0.05) {
    return { basePrice: oldPrice, discountType: "percent", discountValue: Math.round(pct) };
  }
  return { basePrice: oldPrice, discountType: "fixed", discountValue: fixed };
}

export { ApiRequestError };
