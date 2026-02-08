import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import HistoryButton from "@/components/HistoryButton";
import AboutButton from "@/components/AboutButton";
import { themeScript } from "./theme-script";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Steelman - Article Analysis",
  description: "Get AI-powered steelman counter-arguments to help you critically evaluate claims",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

/**
 * Root Layout
 * 
 * Wraps all pages with:
 * - Theme script to prevent flash of wrong theme (runs before hydration)
 * - Theme provider for dark/light mode
 * - Header component with theme toggle
 * - Global styles and fonts
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        {/* Inline script to set theme before React hydration - prevents FOUC */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <ThemeProvider>
          <nav className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
            <HistoryButton />
            <div className="flex items-center gap-2">
              <AboutButton />
              <ThemeToggle />
            </div>
          </nav>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
