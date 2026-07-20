import type { Product } from "@/data/mock";

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export type ProductQueryOptions = {
  categoryId?: string | null;
  sortBy?: SortOption;
  /** When set, only include products with these ids (shop demo filter). */
  ids?: string[] | null;
};

export function filterAndSortProducts(
  products: Product[],
  options: ProductQueryOptions = {}
): Product[] {
  const { categoryId = null, sortBy = "featured", ids = null } = options;
  let result = [...products];

  if (ids && ids.length > 0) {
    result = result.filter((p) => ids.includes(p.id));
  }

  if (categoryId) {
    result = result.filter((p) => p.category === categoryId);
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
