/**
 * Default to same-origin `/api/v1` so Local and Vercel behave identically.
 * Next.js rewrites proxy that path to Laravel (`API_PROXY_ORIGIN`).
 * Override with an absolute URL only when you intentionally bypass the proxy.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api/v1";

export type ApiError = {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  status: number;
};

export class ApiRequestError extends Error {
  code?: string;
  errors?: Record<string, string[]>;
  status: number;

  constructor(payload: ApiError) {
    super(payload.message);
    this.name = "ApiRequestError";
    this.code = payload.code;
    this.errors = payload.errors;
    this.status = payload.status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  /**
   * Always defaults to no-store so Next.js / browser never reuse stale catalog JSON.
   * Opt into caching only for explicitly safe endpoints (e.g. geo).
   */
  cache?: RequestCache;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const method = options.method || "GET";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${normalizedPath}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: options.cache ?? "no-store",
    });
  } catch {
    throw new ApiRequestError({
      message:
        "Cannot reach API. Check that the backend is running and API_PROXY_ORIGIN / NEXT_PUBLIC_API_URL are set.",
      code: "NETWORK_ERROR",
      status: 0,
    });
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json?.success === false) {
    throw new ApiRequestError({
      message: json?.message || "Request failed",
      code: json?.code,
      errors: json?.errors,
      status: response.status,
    });
  }

  return (json?.data ?? json) as T;
}

export { API_BASE };
