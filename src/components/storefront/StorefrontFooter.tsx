"use client"

// 2026-04-13: 更新为使用 next-intl 国际化
// 2026-04-26: 移动端链接区域改为 Accordion 折叠，社交图标增大，添加支付方式图标行

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Facebook, Instagram, Mail, ArrowRight, ChevronDown } from "lucide-react"

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const TikTokLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

/** 支付方式标签列表 */
const paymentMethods = ["Visa", "Mastercard", "PayPal"]

export function StorefrontFooter() {
  const t = useTranslations('footer')
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && email.includes("@")) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const footerLinks = {
    shop: [
      { label: t("newArrivals"), href: "/products?filter=new" },
      { label: t("bestSellers"), href: "/products?filter=best" },
      { label: t("sales"), href: "/products?filter=sale" },
      { label: t("allProducts"), href: "/products" },
    ],
    company: [
      { label: t("aboutUs"), href: "/about" },
      { label: t("contactUs"), href: "/contact" },
      { label: t("faq"), href: "/faq" },
      { label: t("privacyPolicy"), href: "/privacy" },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: XLogo, href: "https://x.com", label: "X" },
    { icon: TikTokLogo, href: "https://tiktok.com", label: "TikTok" },
  ]

  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* 品牌信息区 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center">
                <span className="text-brand-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">SoloSales</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* 移动端：Accordion 折叠链接区域 */}
          <div className="md:hidden">
            <Accordion className="w-full">
              <AccordionItem value="shop" className="border-gray-700">
                <AccordionTrigger className="text-white font-semibold text-sm hover:no-underline py-3">
                  {t("shop")}
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <ul className="space-y-2">
                    {footerLinks.shop.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors text-xs"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="company" className="border-gray-700">
                <AccordionTrigger className="text-white font-semibold text-sm hover:no-underline py-3">
                  {t("company")}
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <ul className="space-y-2">
                    {footerLinks.company.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors text-xs"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* PC端：双列链接布局 */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm md:text-base">{t("shop")}</h3>
                <ul className="space-y-2">
                  {footerLinks.shop.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm md:text-base">{t("company")}</h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 订阅 + 社交图标 */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 text-sm md:text-base">{t("newsletter")}</h3>
            <p className="text-gray-400 text-xs md:text-sm mb-4">
              {t("newsletterDesc")}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="bg-brand hover:bg-brand/90 text-brand-foreground shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
            {subscribed && (
              <p className="text-green-400 text-xs md:text-sm mt-2">
                {t("subscribed")}
              </p>
            )}

            {/* 社交图标 - 增大尺寸和点击区域 */}
            <div className="flex gap-2 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                  aria-label={social.label}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 底部区域：支付方式 + 版权 */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          {/* 支付方式图标行 */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {paymentMethods.map((method, index) => (
              <span key={method} className="flex items-center text-gray-400 text-xs">
                {index > 0 && <span className="mr-3 text-gray-600">|</span>}
                <span className="px-2 py-1 bg-gray-800 rounded text-[11px] font-medium">{method}</span>
              </span>
            ))}
          </div>
          <p className="text-center text-gray-500 text-xs md:text-sm">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}
