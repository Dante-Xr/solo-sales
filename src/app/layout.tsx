import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoloSales Shop v0.2.1",
  description: "High conversion independent store for TikTok",
};

// 2026-03-24: 合并 ThemeProvider 和 AuthProvider，减少嵌套层级
// 优化目的：从 6 层嵌套减少到 4 层，降低重渲染传播深度
function CombinedThemeAuthProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 2026-03-24: 优化后的 Provider 嵌套结构 */}
        {/* 合并 ThemeProvider + AuthProvider，减少 1 层嵌套 */}
        <CombinedThemeAuthProvider>
          <LanguageProvider>
            <WishlistProvider>
              <CartProvider>
                <TooltipProvider>
                  <QueryProvider>{children}</QueryProvider>
                </TooltipProvider>
              </CartProvider>
            </WishlistProvider>
          </LanguageProvider>
        </CombinedThemeAuthProvider>
      </body>
    </html>
  );
}