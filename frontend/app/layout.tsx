import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { themeScript } from "./theme-script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fact Checker - Steelman Counter-Arguments",
  description: "Get AI-powered steelman counter-arguments to help you critically evaluate claims",
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
      <body className={inter.className}>
        {/* Inline script to set theme before React hydration - prevents FOUC */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <ThemeProvider>
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
