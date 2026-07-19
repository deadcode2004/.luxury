const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api/v1";

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
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    cache: "no-store",
  });

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
