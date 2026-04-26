/**
 * ============================================
 * 应用根布局 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 更新布局文件，添加 next-intl 支持
 * 2026-04-14 00:25: 添加 NextIntlClientProvider
 * 2026-04-14 01:00: 移除 <script> 标签（Next.js 16 不允许）
 *   - 主题检测改用 ThemeProvider 客户端初始化
 * ============================================
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import "../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ClientLayout } from "@/components/providers/ClientLayout"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoloSales Shop",
  description: "High conversion independent store for TikTok",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale = "zh" } = await params;
  const messages = await getMessages();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={locale} suppressHydrationWarning nonce={nonce}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <QueryProvider>
                  {children}
                  <ClientLayout />
                </QueryProvider>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
