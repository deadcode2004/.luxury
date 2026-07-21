import type { Product } from "@/data/mock";

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export type ProductQueryOptions = {
  categoryId?: string | null;
  sortBy?: SortOption;
  /** Only featured products when true. */
  featuredOnly?: boolean;
  /** Only new arrivals when true. */
  newestOnly?: boolean;
  /** Only products marked as offers. */
  offersOnly?: boolean;
  /** Only products with a discount (oldPrice > price). */
  discountsOnly?: boolean;
  priceMin?: number | null;
  priceMax?: number | null;
  /** Free-text search across AR/EN name, brand, description. */
  search?: string | null;
  /** When set, only include products with these ids. */
  ids?: string[] | null;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F]/g, "")
    .trim();
}

export function getProductPriceBounds(products: Product[]): { min: number; max: number } {
  if (!products.length) return { min: 0, max: 0 };
  let min = products[0].price;
  let max = products[0].price;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min, max };
}

export function filterAndSortProducts(
  products: Product[],
  options: ProductQueryOptions = {}
): Product[] {
  const {
    categoryId = null,
    sortBy = "featured",
    featuredOnly = false,
    newestOnly = false,
    offersOnly = false,
    discountsOnly = false,
    priceMin = null,
    priceMax = null,
    search = null,
    ids = null,
  } = options;

  let result = [...products];

  if (ids && ids.length > 0) {
    result = result.filter((p) => ids.includes(p.id));
  }

  if (categoryId) {
    result = result.filter((p) => p.category === categoryId);
  }

  if (featuredOnly) {
    result = result.filter((p) => Boolean(p.isFeatured));
  }

  if (newestOnly) {
    result = result.filter((p) => Boolean(p.isNew));
  }

  if (offersOnly) {
    result = result.filter((p) => Boolean(p.isOffer));
  }

  if (discountsOnly) {
    result = result.filter(
      (p) => p.oldPrice != null && Number(p.oldPrice) > Number(p.price)
    );
  }

  if (priceMin != null) {
    result = result.filter((p) => p.price >= priceMin);
  }

  if (priceMax != null) {
    result = result.filter((p) => p.price <= priceMax);
  }

  const q = search ? normalize(search) : "";
  if (q) {
    result = result.filter((p) => {
      const hay = normalize(
        `${p.name.ar} ${p.name.en} ${p.brand.ar} ${p.brand.en} ${p.description?.ar ?? ""} ${p.description?.en ?? ""}`
      );
      return hay.includes(q);
    });
  }

  switch (sortBy) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    case "featured":
    default:
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      break;
  }

  return result;
}
