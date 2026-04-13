"use client"

// 2026-04-13: 更新为使用 next-intl 国际化

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Twitter, Mail, ArrowRight, Video } from "lucide-react"

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
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Video, href: "https://tiktok.com", label: "TikTok" },
  ]

  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">SoloSales</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold mb-4">{t("shop")}</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold mb-4">{t("company")}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold mb-4">{t("newsletter")}</h3>
            <p className="text-gray-400 text-sm mb-4">
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
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
            {subscribed && (
              <p className="text-green-400 text-sm mt-2">
                {t("subscribed")}
              </p>
            )}

            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6">
          <p className="text-center text-gray-500 text-sm">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}
