import { apiRequest } from "@/lib/api/client";
import type { ApiProduct } from "@/lib/api/owner";
import type { Product } from "@/data/mock";

export type PublicProductDto = {
  id: number;
  code: string;
  category_id: number;
  category?: { id: number; code: string; name: { ar: string; en: string } } | null;
  name: { ar: string; en: string };
  brand: { ar: string; en: string };
  description?: { ar: string; en: string } | null;
  ingredients?: { ar: string[]; en: string[] } | null;
  usage?: { ar: string; en: string } | null;
  price: number;
  old_price?: number | null;
  image: string;
  gallery?: string[];
  stock: number;
  rating: number;
  reviews: number;
  is_new: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_offer?: boolean;
  is_active?: boolean;
};

/** Keep cart/wishlist resolution in sync with the latest catalog fetch. */
let catalogCache: Product[] = [];

export function getCachedCatalog(): Product[] {
  return catalogCache;
}

export function setCachedCatalog(products: Product[]) {
  catalogCache = products;
}

export function mapApiProductToStorefront(p: PublicProductDto | ApiProduct): Product {
  return {
    id: String(p.id),
    name: {
      ar: p.name?.ar || "",
      en: p.name?.en || p.name?.ar || "",
    },
    brand: {
      ar: p.brand?.ar || "",
      en: p.brand?.en || p.brand?.ar || "",
    },
    price: Number(p.price) || 0,
    oldPrice: p.old_price != null ? Number(p.old_price) : undefined,
    image: p.image || "",
    gallery: p.gallery ?? [],
    rating: Number(p.rating) || 0,
    reviews: Number(p.reviews) || 0,
    stock: Number(p.stock) || 0,
    isNew: Boolean(p.is_new),
    isFeatured: Boolean(p.is_featured),
    isBestSeller: Boolean(p.is_best_seller),
    isOffer: Boolean(p.is_offer),
    category: p.category ? String(p.category.id) : String(p.category_id),
    description: p.description
      ? {
          ar: p.description.ar || "",
          en: p.description.en || p.description.ar || "",
        }
      : undefined,
    ingredients: p.ingredients
      ? {
          ar: p.ingredients.ar || [],
          en: p.ingredients.en || p.ingredients.ar || [],
        }
      : undefined,
    usage: p.usage
      ? {
          ar: p.usage.ar || "",
          en: p.usage.en || p.usage.ar || "",
        }
      : undefined,
  };
}

export async function fetchPublicProducts(params: {
  perPage?: number;
  featured?: boolean;
  bestSeller?: boolean;
  search?: string;
} = {}): Promise<Product[]> {
  const qs = new URLSearchParams();
  qs.set("per_page", String(params.perPage ?? 50));
  if (params.featured) qs.set("featured", "1");
  if (params.bestSeller) qs.set("best_seller", "1");
  if (params.search) qs.set("search", params.search);

  const data = await apiRequest<PublicProductDto[]>(`/products?${qs.toString()}`, {
    cache: "no-store",
  });
  const products = (data || []).map(mapApiProductToStorefront);
  setCachedCatalog(products);
  return products;
}

export async function fetchPublicProduct(
  idOrCode: string
): Promise<{ product: Product; related: Product[] } | null> {
  try {
    const data = await apiRequest<{
      product: PublicProductDto;
      related?: PublicProductDto[];
    }>(`/products/${encodeURIComponent(idOrCode)}`, {
      cache: "no-store",
    });

    if (!data?.product?.id) return null;

    const product = mapApiProductToStorefront(data.product);
    const related = (data.related || []).map(mapApiProductToStorefront);
    setCachedCatalog([
      ...catalogCache.filter((p) => p.id !== product.id),
      product,
      ...related,
    ]);
    return { product, related };
  } catch {
    return null;
  }
}
