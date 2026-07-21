"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";
import {
  LANGUAGE_COOKIE,
  LANGUAGE_STORAGE_KEY,
  isAppLanguage,
  languageDir,
  writeLanguageCookie,
  type AppLanguage,
} from "@/lib/i18n/language";

type Language = AppLanguage;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function readCookieLanguage(): Language | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANGUAGE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return isAppLanguage(value) ? value : null;
}

export const LanguageProvider = ({
  children,
  initialLanguage = "ar",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Cookie is the SSR source of truth. Migrate legacy localStorage-only preference once.
  useEffect(() => {
    const fromCookie = readCookieLanguage();
    if (fromCookie) {
      writeStorage(LANGUAGE_STORAGE_KEY, fromCookie);
      return;
    }

    const fromStorage = readStorage<Language | null>(LANGUAGE_STORAGE_KEY, null);
    if (isAppLanguage(fromStorage) && fromStorage !== initialLanguage) {
      setLanguageState(fromStorage);
      writeLanguageCookie(fromStorage);
      return;
    }

    writeLanguageCookie(initialLanguage);
    writeStorage(LANGUAGE_STORAGE_KEY, initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languageDir(language);
    writeStorage(LANGUAGE_STORAGE_KEY, language);
    writeLanguageCookie(language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => setLanguageState(lang), []);
  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "ar" ? "en" : "ar"));
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      dir: languageDir(language),
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
