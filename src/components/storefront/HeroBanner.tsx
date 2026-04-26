"use client"

import Link from "next/link"
import { Star, Shield, Truck, Package } from "lucide-react"

interface HeroBannerProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
}

export function HeroBanner({
  title = "Discover Premium Products",
  subtitle = "Curated selection of high-quality items at unbeatable prices. Shop now and elevate your everyday experience.",
  ctaText = "Shop Now",
  ctaHref = "#products",
}: HeroBannerProps) {
  return (
    <section
      className="relative overflow-hidden"
      aria-label="Hero Banner"
    >
      {/* 蓝红交织图案背景 */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* 基础深色底 */}
        <div className="absolute inset-0 bg-slate-900" />
        {/* 蓝色渐变区域 */}
        <div className="absolute -top-1/4 -left-1/4 w-[80%] h-[150%] bg-gradient-to-br from-blue-600/60 via-blue-500/30 to-transparent rounded-full blur-3xl" />
        {/* 红色渐变区域 */}
        <div className="absolute -bottom-1/4 -right-1/4 w-[80%] h-[150%] bg-gradient-to-tl from-red-600/60 via-red-500/30 to-transparent rounded-full blur-3xl" />
        {/* 交织叠加：蓝色偏移 */}
        <div className="absolute top-1/4 right-1/3 w-[60%] h-[100%] bg-gradient-to-bl from-blue-400/25 via-transparent to-transparent rounded-full blur-3xl" />
        {/* 交织叠加：红色偏移 */}
        <div className="absolute bottom-1/4 left-1/3 w-[60%] h-[100%] bg-gradient-to-tr from-red-400/25 via-transparent to-transparent rounded-full blur-3xl" />
        {/* 中央交汇光晕 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[60%] bg-gradient-to-ellipse from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        {/* 网格纹理 */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* 噪点纹理 */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />
      </div>

      {/* 内容区域：左右双栏 */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* 左侧：标题 + 副标题 + CTA */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              {title}
            </h1>
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-white/75 leading-relaxed">
              {subtitle}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white px-6 py-3 text-sm font-semibold transition-all hover:bg-white/25 hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              >
                {ctaText}
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/15 text-white/80 px-6 py-3 text-sm font-semibold transition-all hover:bg-white/10 hover:text-white hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* 右侧：玻璃态浮动卡片 */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg hidden sm:block">
            <div className="relative">
              {/* 浮动卡片：评分 */}
              <div className="absolute -top-2 right-0 lg:right-8 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg border border-white/20 animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-white text-sm font-semibold">4.9</span>
                </div>
                <p className="text-white/60 text-xs mt-0.5">10k+ Reviews</p>
              </div>

              {/* 浮动卡片：销量 */}
              <div className="absolute top-16 -left-2 lg:left-0 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg border border-white/20 animate-[float_6s_ease-in-out_1s_infinite]">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-white/90" />
                  <div>
                    <p className="text-white text-sm font-semibold">50k+ Sold</p>
                    <p className="text-white/60 text-xs">Worldwide</p>
                  </div>
                </div>
              </div>

              {/* 中央玻璃态卡片 */}
              <div className="mx-auto w-56 lg:w-64 bg-white/8 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-2xl">
                <div className="aspect-square rounded-xl bg-white/5 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/10">
                  <Package className="w-16 h-16 text-white/30" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/15 rounded-full w-3/4" />
                  <div className="h-3 bg-white/10 rounded-full w-1/2" />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-white font-bold text-lg">$29.99</span>
                    <span className="text-white/40 text-sm line-through">$59.99</span>
                  </div>
                </div>
              </div>

              {/* 浮动卡片：信任标识 */}
              <div className="absolute -bottom-4 right-4 lg:right-12 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg border border-white/20 animate-[float_6s_ease-in-out_2s_infinite]">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-white text-sm font-semibold">Secure Payment</p>
                    <p className="text-white/60 text-xs">256-bit SSL</p>
                  </div>
                </div>
              </div>

              {/* 浮动卡片：物流 */}
              <div className="absolute bottom-12 -left-4 lg:left-2 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg border border-white/20 animate-[float_6s_ease-in-out_0.5s_infinite]">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-white/90" />
                  <div>
                    <p className="text-white text-sm font-semibold">Free Shipping</p>
                    <p className="text-white/60 text-xs">Orders $50+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
