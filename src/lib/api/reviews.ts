import { apiRequest } from "@/lib/api/client";
import type { LocaleText } from "@/lib/api/owner";

export type ApiReview = {
  id: number;
  code?: string | null;
  product_id?: number | null;
  author: LocaleText;
  rating: number;
  comment: LocaleText;
  created_at?: string | null;
};

export async function fetchProductReviews(productId: string | number) {
  return apiRequest<ApiReview[]>(`/products/${encodeURIComponent(String(productId))}/reviews`, {
    cache: "no-store",
  });
}

export async function fetchPublicReviews() {
  return apiRequest<ApiReview[]>("/reviews", { cache: "no-store" });
}

export async function submitProductReview(
  token: string,
  body: { product_id: number; rating: number; comment: string }
) {
  return apiRequest<ApiReview>("/reviews", {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}
