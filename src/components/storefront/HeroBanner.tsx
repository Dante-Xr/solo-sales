"use client"

import { motion } from "framer-motion"
import { Link } from "@/i18n/navigation"
import { PackageCheck, ShoppingBag, Star, Truck } from "lucide-react"
import { useTranslations } from "next-intl"

interface HeroBannerProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
}

export function HeroBanner({
  title,
  subtitle,
  ctaText,
  ctaHref = "#products",
}: HeroBannerProps) {
  const t = useTranslations("homeEnhance")
  const heroTitle = title ?? t("heroTitle")
  const heroSubtitle = subtitle ?? t("heroSubtitle")
  const heroCtaText = ctaText ?? t("heroCta")

  return (
    <section className="relative isolate overflow-hidden bg-[#0c1022] text-white" aria-label={heroTitle}>
      <div className="absolute inset-0 bg-[linear-gradient(130deg,#080e28_0%,#141038_40%,#7b1025_80%,#9e0f2e_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-[540px] max-w-[1440px] items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">{t("heroEyebrow")}</span>
          <h1 className="mt-7 max-w-2xl text-5xl font-bold leading-[1.04] tracking-normal sm:text-6xl lg:text-7xl">{heroTitle}</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/75 sm:text-lg">{heroSubtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className="inline-flex min-h-0 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#0c1022] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {heroCtaText}
              </Link>
              <Link
                href="#features"
                className="inline-flex min-h-0 items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t("heroSecondaryCta")}
              </Link>
          </div>
          <div className="mt-12 flex gap-8 border-t border-white/15 pt-7 text-white">
            {["50k+", "4.9", "99%"].map((value, index) => (
              <div key={value}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-white/60">{t(`stat${index + 1}`)}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.1 }} className="relative hidden min-h-[380px] lg:block">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute left-8 top-12 rounded-xl border border-white/20 bg-white px-4 py-3 text-[#0c1022] shadow-xl">
            <div className="flex items-center gap-2"><PackageCheck className="size-5 text-brand" /><span className="font-bold">{t("badgeSold")}</span></div>
            <p className="mt-1 text-xs text-slate-500">{t("badgeSoldHint")}</p>
          </motion.div>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 0.8 }} className="absolute right-8 top-4 rounded-xl border border-white/20 bg-white px-4 py-3 text-[#0c1022] shadow-xl">
            <div className="flex items-center gap-2"><Star className="size-5 fill-amber-400 text-amber-400" /><span className="font-bold">4.9</span></div>
            <p className="mt-1 text-xs text-slate-500">{t("badgeReviews")}</p>
          </motion.div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5.5, repeat: Infinity, delay: 0.4 }} className="absolute bottom-6 right-6 rounded-xl border border-white/20 bg-white px-4 py-3 text-[#0c1022] shadow-xl">
            <div className="flex items-center gap-2"><Truck className="size-5 text-sky-600" /><span className="font-bold">{t("badgeShipping")}</span></div>
            <p className="mt-1 text-xs text-slate-500">{t("badgeShippingHint")}</p>
          </motion.div>
          <div className="absolute left-1/2 top-1/2 grid size-56 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] border border-white/20 bg-white/15 shadow-2xl backdrop-blur-sm"><ShoppingBag className="size-24 text-white" aria-hidden="true" /></div>
        </motion.div>
      </div>
    </section>
  )
}
