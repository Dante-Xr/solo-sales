"use client"

import { useState, useRef, useEffect } from "react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Globe, Check } from "lucide-react"

const LANGUAGES = [
  { code: "zh" as const, label: "中文" },
  { code: "en" as const, label: "English" },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (code: string) => {
    setIsOpen(false)
    if (code !== locale) {
      router.push(pathname, { locale: code })
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9"
        onClick={() => setIsOpen(!isOpen)}
        title={locale === "zh" ? "Switch to English" : "切换到中文"}
      >
        <Globe className="w-4 h-4 text-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-[120px] bg-popover border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-foreground"
            >
              <span>{lang.label}</span>
              {locale === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
