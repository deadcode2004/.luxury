export type RealtimeDomain =
  | "products"
  | "categories"
  | "coupons"
  | "orders"
  | "customers"
  | "cms"
  | "dashboard";

export type DomainVersions = Record<RealtimeDomain, number>;

export type RealtimeSnapshot = {
  cursor: number;
  versions: DomainVersions;
};

export const REALTIME_DOMAINS: RealtimeDomain[] = [
  "products",
  "categories",
  "coupons",
  "orders",
  "customers",
  "cms",
  "dashboard",
];

export const PUBLIC_REALTIME_DOMAINS: RealtimeDomain[] = [
  "products",
  "categories",
  "cms",
];

export const EMPTY_VERSIONS: DomainVersions = {
  products: 0,
  categories: 0,
  coupons: 0,
  orders: 0,
  customers: 0,
  cms: 0,
  dashboard: 0,
};
