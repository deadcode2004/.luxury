import { apiRequest, ApiRequestError, API_BASE } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/user";

export async function uploadAccountAvatar(token: string, file: File): Promise<AuthUser> {
  const form = new FormData();
  form.append("avatar", file);

  const res = await fetch(`${API_BASE}/account/avatar`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: form,
    cache: "no-store",
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

  return (json?.data ?? json) as AuthUser;
}

export async function deleteAccountAvatar(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/account/avatar", {
    method: "DELETE",
    token,
  });
}

export { ApiRequestError };
