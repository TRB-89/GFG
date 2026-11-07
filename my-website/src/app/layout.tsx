import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { AccessibilityProvider } from "@/lib/accessibility/AccessibilityContext";
import { BandwidthProvider } from "@/lib/bandwidth/BandwidthContext";

const sansFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const displayFont = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GAP FOR GOOD (GFG 3.0) — Noir Bloom | Not a restart. A return to possibility.",
  description:
    "Gothic Editorial × Midnight & Sage digital platform empowering women to rebuild skills, regain career confidence, explore entrepreneurship, and bridge to verified opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${serifFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0F0D] text-[#F5F0E5] font-sans selection:bg-[#536B58] selection:text-[#F5F0E5]">
        <LanguageProvider>
          <AccessibilityProvider>
            <BandwidthProvider>
              {children}
            </BandwidthProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
