"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiRequestError } from "@/lib/api/client";
import { readStorage, removeStorage, writeStorage } from "@/lib/storage";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/session";
import { normalizeAuthUser, type AuthUser } from "@/lib/auth/user";
import { fieldErrorsFromUnknown } from "@/lib/auth/validationErrors";
import { deleteAccountAvatar, uploadAccountAvatar } from "@/lib/api/avatar";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";

export type { AuthUser };

export type AuthActionResult =
  | { ok: true; token?: string }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  isUser: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
  }) => Promise<AuthActionResult>;
  logout: (redirectTo?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  }) => Promise<boolean>;
  changePassword: (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => Promise<boolean>;
  updateNotifications: (payload: {
    notify_orders?: boolean;
    notify_stock?: boolean;
    notify_marketing?: boolean;
  }) => Promise<boolean>;
  uploadAvatar: (file: File, tokenOverride?: string) => Promise<boolean>;
  removeAvatar: () => Promise<boolean>;
};

const TOKEN_KEY = "paradise_token";
const USER_KEY = "paradise_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const clear = useCallback(() => {
    setToken(null);
    setUser(null);
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
    clearAuthCookies();
  }, []);

  const persist = useCallback((nextToken: string, nextUser: AuthUser) => {
    const normalized = normalizeAuthUser(nextUser);
    if (!normalized) {
      clear();
      return;
    }
    setToken(nextToken);
    setUser(normalized);
    writeStorage(TOKEN_KEY, nextToken);
    writeStorage(USER_KEY, normalized);
    setAuthCookies(normalized.role);
  }, [clear]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const savedToken = readStorage<string | null>(TOKEN_KEY, null);
      const savedUser = normalizeAuthUser(readStorage<unknown>(USER_KEY, null));

      // Never treat a role/user blob without a token as signed-in.
      if (!savedToken || !savedUser) {
        clear();
        if (!cancelled) setReady(true);
        return;
      }

      setToken(savedToken);
      setUser(savedUser);
      setAuthCookies(savedUser.role);
      if (!cancelled) setReady(true);

      // Re-validate against the API so expired/stale sessions cannot unlock menus.
      try {
        const me = normalizeAuthUser(await apiRequest<AuthUser>("/auth/me", { token: savedToken }));
        if (cancelled) return;
        if (!me) {
          clear();
          return;
        }
        setUser(me);
        writeStorage(USER_KEY, me);
        setAuthCookies(me.role);
      } catch {
        if (!cancelled) clear();
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [clear]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const data = await apiRequest<{ user: AuthUser; token: string }>("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        persist(data.token, data.user);
        toast(
          language === "ar" ? "✔ تم تسجيل الدخول بنجاح" : "✔ Signed in successfully",
          "success"
        );
        return true;
      } catch (error) {
        const message =
          error instanceof ApiRequestError
            ? error.message
            : language === "ar"
              ? "فشل تسجيل الدخول"
              : "Login failed";
        toast(message, "danger");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [language, persist, toast]
  );

  const register = useCallback(
    async (payload: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      password: string;
      password_confirmation: string;
    }): Promise<AuthActionResult> => {
      setLoading(true);
      try {
        const data = await apiRequest<{ user: AuthUser; token: string }>("/auth/register", {
          method: "POST",
          body: payload,
        });
        persist(data.token, data.user);
        toast(
          language === "ar" ? "✔ تم إنشاء الحساب بنجاح" : "✔ Account created successfully",
          "success"
        );
        return { ok: true, token: data.token };
      } catch (error) {
        const fieldErrors = fieldErrorsFromUnknown(error, language);
        const message =
          Object.values(fieldErrors)[0] ||
          (error instanceof ApiRequestError
            ? error.message
            : language === "ar"
              ? "فشل إنشاء الحساب"
              : "Registration failed");
        toast(message, "danger");
        return { ok: false, fieldErrors, message };
      } finally {
        setLoading(false);
      }
    },
    [language, persist, toast]
  );

  const logout = useCallback(
    async (redirectTo = "/login") => {
      setLoading(true);
      try {
        if (token) {
          await apiRequest("/auth/logout", { method: "POST", token }).catch(() => undefined);
        }
      } finally {
        clear();
        toast(language === "ar" ? "✔ تم تسجيل الخروج" : "✔ Signed out", "success");
        setLoading(false);
        router.replace(redirectTo);
        router.refresh();
      }
    },
    [clear, language, router, toast, token]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = normalizeAuthUser(await apiRequest<AuthUser>("/auth/me", { token }));
      if (!data) {
        clear();
        return;
      }
      setUser(data);
      writeStorage(USER_KEY, data);
      setAuthCookies(data.role);
    } catch {
      clear();
    }
  }, [clear, token]);

  const updateProfile = useCallback(
    async (payload: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    }) => {
      if (!token) return false;
      setLoading(true);
      try {
        const data = normalizeAuthUser(
          await apiRequest<AuthUser>("/account/profile", {
            method: "PUT",
            token,
            body: payload,
          })
        );
        if (!data) {
          clear();
          return false;
        }
        setUser(data);
        writeStorage(USER_KEY, data);
        setAuthCookies(data.role);
        toast(
          language === "ar" ? "✔ تم حفظ التعديلات" : "✔ Changes saved",
          "success"
        );
        return true;
      } catch (error) {
        toast(
          error instanceof ApiRequestError
            ? error.message
            : language === "ar"
              ? "✖ حدث خطأ أثناء الحفظ"
              : "✖ Failed to save changes",
          "danger"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [clear, language, toast, token]
  );

  const changePassword = useCallback(
    async (payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => {
      if (!token) return false;
      setLoading(true);
      try {
        await apiRequest<null>("/account/password", {
          method: "PUT",
          token,
          body: payload,
        });
        toast(
          language === "ar" ? "✔ تم تغيير كلمة المرور" : "✔ Password updated",
          "success"
        );
        return true;
      } catch (error) {
        toast(
          error instanceof ApiRequestError
            ? error.message
            : language === "ar"
              ? "✖ تعذر تغيير كلمة المرور"
              : "✖ Failed to change password",
          "danger"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [language, toast, token]
  );

  const updateNotifications = useCallback(
    async (payload: {
      notify_orders?: boolean;
      notify_stock?: boolean;
      notify_marketing?: boolean;
    }) => {
      if (!token) return false;
      try {
        const data = normalizeAuthUser(
          await apiRequest<AuthUser>("/account/notifications", {
            method: "PUT",
            token,
            body: payload,
          })
        );
        if (!data) {
          clear();
          return false;
        }
        setUser(data);
        writeStorage(USER_KEY, data);
        setAuthCookies(data.role);
        return true;
      } catch (error) {
        toast(
          error instanceof ApiRequestError
            ? error.message
            : language === "ar"
              ? "✖ تعذر حفظ الإشعارات"
              : "✖ Failed to save notifications",
          "danger"
        );
        return false;
      }
    },
    [clear, language, toast, token]
  );

  const uploadAvatar = useCallback(
    async (file: File, tokenOverride?: string) => {
      const authToken = tokenOverride || token;
      if (!authToken) return false;
      setLoading(true);
      try {
        const data = normalizeAuthUser(await uploadAccountAvatar(authToken, file));
        if (!data) {
          clear();
          return false;
        }
        persist(authToken, data);
        toast(
          language === "ar" ? "✔ تم تحديث الصورة الشخصية" : "✔ Profile photo updated",
          "success"
        );
        return true;
      } catch (error) {
        toast(
          error instanceof ApiRequestError
            ? error.message
            : language === "ar"
              ? "✖ فشل رفع الصورة"
              : "✖ Failed to upload photo",
          "danger"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [clear, language, persist, toast, token]
  );

  const removeAvatar = useCallback(async () => {
    if (!token) return false;
    setLoading(true);
    try {
      const data = normalizeAuthUser(await deleteAccountAvatar(token));
      if (!data) {
        clear();
        return false;
      }
      persist(token, data);
      toast(
        language === "ar" ? "✔ تم حذف الصورة الشخصية" : "✔ Profile photo removed",
        "success"
      );
      return true;
    } catch (error) {
      toast(
        error instanceof ApiRequestError
          ? error.message
          : language === "ar"
            ? "✖ تعذر حذف الصورة"
            : "✖ Failed to remove photo",
        "danger"
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [clear, language, persist, toast, token]);

  const isAuthenticated = Boolean(token && user && (user.role === "owner" || user.role === "user"));
  const isOwner = isAuthenticated && user?.role === "owner";
  const isUser = isAuthenticated && user?.role === "user";

  const value = useMemo(
    () => ({
      user: isAuthenticated ? user : null,
      token: isAuthenticated ? token : null,
      ready,
      loading,
      isAuthenticated,
      isOwner,
      isUser,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      updateNotifications,
      uploadAvatar,
      removeAvatar,
    }),
    [
      user,
      token,
      ready,
      loading,
      isAuthenticated,
      isOwner,
      isUser,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      updateNotifications,
      uploadAvatar,
      removeAvatar,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
