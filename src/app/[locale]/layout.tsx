/**
 * 修改时间：2026-05-02 19:10:31 +08:00
 * 修改内容：移除 next/font/google 网络字体依赖，改用 globals.css 中的系统字体变量以解除离线 build 阻塞。
 * 修改模型：gpt-5.5
 *
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
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import "../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ClientLayout } from "@/components/providers/ClientLayout"

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
      <body className="antialiased">
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
