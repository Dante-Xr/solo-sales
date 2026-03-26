"use client"

import { useState, useRef, useEffect } from "react"
import { Share2, X, Twitter, Facebook, Instagram, Link2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareMenuProps {
  title: string
  text: string
  url: string
  isZh: boolean
}

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/>
  </svg>
)

const SOCIAL_PLATFORMS = [
  {
    name: "Twitter",
    icon: Twitter,
    getUrl: (_url: string, _title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: "hover:bg-[#1DA1F2]/10",
    iconColor: "text-[#1DA1F2]",
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

export function ShareMenu({ title, text, url, isZh }: ShareMenuProps) {
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
              {isZh ? "分享到" : "Share to"}
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
                {copied ? (isZh ? "已复制!" : "Copied!") : (isZh ? "复制链接" : "Copy Link")}
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-1 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
