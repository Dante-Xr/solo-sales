/**
 * 2026-03-24: Next.js 配置文件
 * 2026-04-13: 添加 next-intl 插件支持
 * 功能：
 *   1. 图片优化配置（AVIF/WebP 自动转换）
 *   2. 安全响应头配置（CSP, HSTS, X-Frame-Options 等）
 *   3. 包导入优化
 *   4. Bundle 分析配置
 *   5. 国际化支持（next-intl）
 */
import type { NextConfig } from "next";
import withBundleAnalyzerImport from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

// 2026-03-24: Bundle Analyzer 配置，用于分析打包体积
// 使用方法：ANALYZE=true npm run build 或 npm run analyze
const withBundleAnalyzer = withBundleAnalyzerImport({
  enabled: process.env.ANALYZE === "true",
});

// 2026-04-13: next-intl 插件配置
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // 2026-03-24: 图片优化配置
  images: {
    // 2026-03-24: 启用 AVIF 和 WebP 格式自动转换，优先使用 AVIF
    formats: ["image/avif", "image/webp"],
    // 2026-03-24: 响应式图片尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },

  // 2026-03-24: 包导入优化，减少 bundle 大小
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // 2026-03-24: Turbopack 配置（Next.js 16 使用 Turbopack 作为默认构建工具）
  // 2026-03-24: 空的 turbopack 配置表示不需要特殊配置
  turbopack: {},
};

// 2026-03-24: 安全响应头配置
// 这些头信息将应用于所有响应
const securityHeaders = [
  {
    // 2026-03-24: DNS 预取控制，防止 DNS 劫持
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    // 2026-03-24: 强制使用 HTTPS 访问，提升安全性
    // max-age=63072000 表示两年有效期
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // 2026-03-24: 防止 Clickjacking 攻击，禁止用 iframe 嵌入
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // 2026-03-24: 防止 MIME 类型 sniffing 攻击
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // 2026-03-24: 控制 referrer 信息泄露
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    // 2026-03-24: Content Security Policy，限制资源加载来源
    // 防止 XSS 攻击，限制脚本、样式、图片等资源来源
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 2026-03-24: Next.js 需要这些
      "style-src 'self' 'unsafe-inline'", // 2026-03-24: Tailwind 需要
      "img-src 'self' data: https://images.unsplash.com https://picsum.photos",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com", // 2026-03-24: Stripe API
      "frame-src 'self' https://js.stripe.com", // 2026-03-24: Stripe.js
    ].join("; "),
  },
  {
    // 2026-03-24: X-XSS-Protection 头，虽然现代浏览器已支持 CSP，但保留以兼容旧浏览器
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    // 2026-03-24: 权限策略，限制某些 API 的使用
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

// 2026-03-24: 导出带安全头的配置
// 2026-04-13: 使用 withNextIntl 和 withBundleAnalyzer 包装配置
// 注意：Next.js 16 中安全头配置方式可能不同，需要验证
export default withBundleAnalyzer(withNextIntl(nextConfig));

// 2026-03-24: 导出安全头配置供 middleware 使用
export { securityHeaders };
