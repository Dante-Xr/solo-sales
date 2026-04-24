"use client"

// 2026-04-13: 更新为使用 next-intl 国际化

import { useState, useRef, useEffect } from "react"
import { Share2, X as XIcon, Facebook, Instagram, Link2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface ShareMenuProps {
  title: string
  text: string
  url: string
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const SOCIAL_PLATFORMS = [
  {
    name: "X",
    icon: XLogo,
    getUrl: (url: string, title: string) =>
      `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: "hover:bg-black/10",
    iconColor: "text-black dark:text-white",
  },
  {
    name: "Facebook",
    icon: Facebook,
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: "hover:bg-[#4267B2]/10",
    iconColor: "text-[#4267B2]",
  },
  {
    name: "Instagram",
    icon: Instagram,
    getUrl: () => "#",
    color: "hover:bg-[#E4405F]/10",
    iconColor: "text-[#E4405F]",
  },
  {
    name: "TikTok",
    icon: TikTokIcon,
    getUrl: () =>
      `https://www.tiktok.com/@user/video/${Date.now()}`,
    color: "hover:bg-black/10",
    iconColor: "text-black dark:text-white",
  },
]

export function ShareMenu({ title, text, url }: ShareMenuProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        setIsOpen(false)
      } catch {
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 1500)
    } catch {
      console.error("Failed to copy link")
    }
  }

  const handleSocialShare = (getUrl: (url: string, title: string) => string) => {
    const shareUrl = getUrl(url, title)
    if (shareUrl !== "#") {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border-gray-300"
        onClick={handleShare}
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-card rounded-lg shadow-lg border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              {t('common.shareTo')}
            </p>
          </div>

          <div className="py-1">
            {SOCIAL_PLATFORMS.map((platform) => {
              const IconComponent = platform.icon
              return (
                <button
                  key={platform.name}
                  onClick={() => handleSocialShare(platform.getUrl)}
                  className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors ${platform.color}`}
                >
                  <span className={platform.iconColor}>
                    <IconComponent className="w-4 h-4" />
                  </span>
                  <span className="text-sm text-foreground">{platform.name}</span>
                </button>
              )
            })}
          </div>

          <div className="border-t border-border py-1">
            <button
              onClick={handleCopyLink}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Link2 className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground">
                {copied ? t('common.copied') : t('common.copyLink')}
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-1 p-1 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
