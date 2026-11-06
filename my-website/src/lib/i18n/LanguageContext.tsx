"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { SupportedLocale, TRANSLATIONS } from "./translations";

export type { SupportedLocale };

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
  isAiTranslated: boolean;
  localeName: string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isAiTranslated: false,
  localeName: "English",
});

export const LOCALE_NAMES: Record<SupportedLocale, { label: string; native: string }> = {
  en: { label: "English", native: "English" },
  ta: { label: "Tamil", native: "தமிழ்" },
  hi: { label: "Hindi", native: "हिंदी" },
};

let listeners: Array<() => void> = [];
function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const languageStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "gfg_preferred_language") listener();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }
    return () => {
      listeners = listeners.filter((l) => l !== listener);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  },
  getSnapshot(): SupportedLocale {
    if (typeof window === "undefined") return "en";
    try {
      const saved = localStorage.getItem("gfg_preferred_language") as SupportedLocale;
      if (saved === "en" || saved === "ta" || saved === "hi") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "en";
  },
  getServerSnapshot(): SupportedLocale {
    return "en";
  },
  setLocale(loc: SupportedLocale) {
    try {
      localStorage.setItem("gfg_preferred_language", loc);
    } catch (e) {
      console.warn("Could not save language preference to localStorage", e);
    }
    emitChange();
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    languageStore.getServerSnapshot
  );

  // Synchronize document attributes with active locale
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.classList.remove("font-lang-en", "font-lang-ta", "font-lang-hi");
      document.documentElement.classList.add(`font-lang-${locale}`);
    }
  }, [locale]);

  const setLocale = (loc: SupportedLocale) => {
    languageStore.setLocale(loc);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    const enDict = TRANSLATIONS.en;
    if (enDict[key]) return enDict[key];
    return fallback || key;
  };

  const isAiTranslated = locale !== "en";
  const localeName = LOCALE_NAMES[locale]?.native || "English";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isAiTranslated, localeName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const useTranslation = useLanguage;

export function AiTranslationDisclaimer({ className = "" }: { className?: string }) {
  const { isAiTranslated, t } = useTranslation();
  if (!isAiTranslated) return null;

  return (
    <div
      role="note"
      aria-label="Translation disclaimer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#A56F7C]/15 border border-[#A56F7C]/30 text-[10px] text-[#F1E7DB] font-mono tracking-wide ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#A56F7C] animate-pulse" />
      <span>{t("ai.translation_disclaimer")}</span>
    </div>
  );
}
