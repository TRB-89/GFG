"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type FontSizeScale = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  fontSize: FontSizeScale;
  setFontSize: (val: FontSizeScale) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  toggleReducedMotion: () => void;
  dyslexicFont: boolean;
  setDyslexicFont: (val: boolean) => void;
  toggleDyslexicFont: () => void;
  announcement: string | null;
  announce: (message: string) => void;
  resetAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  highContrast: false,
  setHighContrast: () => {},
  toggleHighContrast: () => {},
  fontSize: "normal",
  setFontSize: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
  toggleReducedMotion: () => {},
  dyslexicFont: false,
  setDyslexicFont: () => {},
  toggleDyslexicFont: () => {},
  announcement: null,
  announce: () => {},
  resetAll: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("gfg_a11y_high_contrast") === "true";
    } catch {
      return false;
    }
  });
  const [fontSize, setFontSizeState] = useState<FontSizeScale>(() => {
    if (typeof window === "undefined") return "normal";
    try {
      return (localStorage.getItem("gfg_a11y_font_size") as FontSizeScale) || "normal";
    } catch {
      return "normal";
    }
  });
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const savedRM = localStorage.getItem("gfg_a11y_reduced_motion");
      if (savedRM !== null) return savedRM === "true";
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });
  const [dyslexicFont, setDyslexicFontState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("gfg_a11y_dyslexic_font") === "true";
    } catch {
      return false;
    }
  });
  const [announcement, setAnnouncement] = useState<string | null>(null);

  // Synchronize document classes with accessibility state
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (highContrast) {
      root.classList.add("a11y-high-contrast");
    } else {
      root.classList.remove("a11y-high-contrast");
    }

    root.classList.remove("a11y-text-large", "a11y-text-xlarge");
    if (fontSize === "large") root.classList.add("a11y-text-large");
    if (fontSize === "xlarge") root.classList.add("a11y-text-xlarge");

    if (reducedMotion) {
      root.classList.add("a11y-reduced-motion");
    } else {
      root.classList.remove("a11y-reduced-motion");
    }

    if (dyslexicFont) {
      root.classList.add("a11y-dyslexic-font");
    } else {
      root.classList.remove("a11y-dyslexic-font");
    }
  }, [highContrast, fontSize, reducedMotion, dyslexicFont]);

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    try {
      localStorage.setItem("gfg_a11y_high_contrast", String(val));
    } catch {
      // ignore
    }
    announce(val ? "High contrast mode enabled" : "High contrast mode disabled");
  };

  const toggleHighContrast = () => setHighContrast(!highContrast);

  const setFontSize = (val: FontSizeScale) => {
    setFontSizeState(val);
    try {
      localStorage.setItem("gfg_a11y_font_size", val);
    } catch {
      // ignore
    }
    announce(`Font size changed to ${val}`);
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    try {
      localStorage.setItem("gfg_a11y_reduced_motion", String(val));
    } catch {
      // ignore
    }
    announce(val ? "Animations reduced" : "Standard animations enabled");
  };

  const toggleReducedMotion = () => setReducedMotion(!reducedMotion);

  const setDyslexicFont = (val: boolean) => {
    setDyslexicFontState(val);
    try {
      localStorage.setItem("gfg_a11y_dyslexic_font", String(val));
    } catch {
      // ignore
    }
    announce(val ? "High legibility font enabled" : "Standard font enabled");
  };

  const toggleDyslexicFont = () => setDyslexicFont(!dyslexicFont);

  const announce = (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(null), 3000);
  };

  const resetAll = () => {
    setHighContrast(false);
    setFontSize("normal");
    setReducedMotion(false);
    setDyslexicFont(false);
    announce("Accessibility settings reset to default");
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        reducedMotion,
        setReducedMotion,
        toggleReducedMotion,
        dyslexicFont,
        setDyslexicFont,
        toggleDyslexicFont,
        announcement,
        announce,
        resetAll,
      }}
    >
      {/* Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="a11y-live-announcer"
      >
        {announcement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
