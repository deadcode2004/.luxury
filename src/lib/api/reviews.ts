import { apiRequest } from "@/lib/api/client";
import type { LocaleText } from "@/lib/api/owner";

export type ApiReview = {
  id: number;
  code?: string | null;
  product_id?: number | null;
  author: LocaleText;
  author_avatar?: string | null;
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
  body: {
    product_id: number;
    rating: number;
    comment: string;
    author_name?: string;
  },
  token?: string | null
) {
  return apiRequest<ApiReview>("/reviews", {
    method: "POST",
    token: token || undefined,
    body,
    cache: "no-store",
  });
}

/** Avatar for logged-in reviewer preview (stored avatar or generated). */
export function reviewerAvatarUrl(name: string, avatar?: string | null) {
  if (avatar?.trim()) return avatar.trim();
  const label = name.trim() || "Guest";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=1a1a1a&color=ffffff&size=128&bold=true`;
}
