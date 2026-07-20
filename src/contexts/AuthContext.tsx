"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiRequestError } from "@/lib/api/client";
import { readStorage, removeStorage, writeStorage } from "@/lib/storage";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/contexts/LanguageContext";

export type AuthUser = {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string | null;
  role: "owner" | "user";
  is_active?: boolean;
  notify_orders?: boolean;
  notify_stock?: boolean;
  notify_marketing?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
  }) => Promise<boolean>;
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

  useEffect(() => {
    const savedToken = readStorage<string | null>(TOKEN_KEY, null);
    const savedUser = readStorage<AuthUser | null>(USER_KEY, null);
    setToken(savedToken);
    setUser(savedUser);
    if (savedToken && savedUser) {
      setAuthCookies(savedUser.role);
    } else {
      clearAuthCookies();
    }
    setReady(true);
  }, []);

  const persist = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    writeStorage(TOKEN_KEY, nextToken);
    writeStorage(USER_KEY, nextUser);
    setAuthCookies(nextUser.role);
  }, []);

  const clear = useCallback(() => {
    setToken(null);
    setUser(null);
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
    clearAuthCookies();
  }, []);

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
    }) => {
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
        return true;
      } catch (error) {
        const message =
          error instanceof ApiRequestError
            ? error.message
            : language === "ar"
              ? "فشل إنشاء الحساب"
              : "Registration failed";
        toast(message, "danger");
        return false;
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
      const data = await apiRequest<AuthUser>("/auth/me", { token });
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
        const data = await apiRequest<AuthUser>("/account/profile", {
          method: "PUT",
          token,
          body: payload,
        });
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
    [language, toast, token]
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
        const data = await apiRequest<AuthUser>("/account/notifications", {
          method: "PUT",
          token,
          body: payload,
        });
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
    [language, toast, token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      loading,
      isAuthenticated: Boolean(token && user),
      isOwner: user?.role === "owner",
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      updateNotifications,
    }),
    [
      user,
      token,
      ready,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      updateNotifications,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
