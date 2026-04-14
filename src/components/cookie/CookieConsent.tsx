/**
 * ============================================
 * Cookie Consent Banner 组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 欧盟 GDPR 合规
 *   - 记录用户 Cookie 同意状态
 *   - 提供 Cookie 政策链接
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/navigation"
import { X, Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const COOKIE_CONSENT_KEY = "cookie_consent"
const COOKIE_CONSENT_VERSION = "1.0"

interface CookieConsent {
  version: string
  accepted: boolean
  timestamp: string
  acceptedCategories: string[]
}

/**
 * Cookie 分类
 */
const cookieCategories = [
  {
    id: "necessary",
    name: "必要 Cookie",
    description: "网站运行所必需的 Cookie，无法关闭",
    required: true,
  },
  {
    id: "analytics",
    name: "分析 Cookie",
    description: "帮助我们了解用户如何使用网站",
    required: false,
  },
  {
    id: "marketing",
    name: "营销 Cookie",
    description: "用于个性化和广告",
    required: false,
  },
]

/**
 * Cookie Consent Banner 组件
 */
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // 检查是否已同意
  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // 延迟显示，等页面加载完成
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  // 处理接受所有
  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      version: COOKIE_CONSENT_VERSION,
      accepted: true,
      timestamp: new Date().toISOString(),
      acceptedCategories: cookieCategories.map((c) => c.id),
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
    setIsVisible(false)
  }

  // 处理仅接受必要
  const handleAcceptNecessary = () => {
    const consent: CookieConsent = {
      version: COOKIE_CONSENT_VERSION,
      accepted: true,
      timestamp: new Date().toISOString(),
      acceptedCategories: ["necessary"],
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
    setIsVisible(false)
  }

  // 处理自定义设置
  const handleSavePreferences = () => {
    const consent: CookieConsent = {
      version: COOKIE_CONSENT_VERSION,
      accepted: true,
      timestamp: new Date().toISOString(),
      acceptedCategories: ["necessary"], // 默认只接受必要的
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
    setIsVisible(false)
  }

  // 不显示
  if (!isVisible) {
    return null
  }

  return (
    <>
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* Banner */}
      <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-b-none border-b-0">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            {/* 图标 */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Cookie size={24} className="text-primary" />
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Cookie 使用说明</h3>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                我们使用 Cookie 来改善您的浏览体验。查看我们的{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  隐私政策
                </Link>{" "}
                了解更多。
              </p>

              {/* 按钮组 */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAcceptAll} size="sm">
                  接受全部
                </Button>
                <Button variant="outline" onClick={handleAcceptNecessary} size="sm">
                  仅必要
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDetails(!showDetails)}
                  size="sm"
                >
                  {showDetails ? "收起" : "自定义设置"}
                </Button>
              </div>

              {/* 详细设置 */}
              {showDetails && (
                <div className="mt-4 space-y-3">
                  {cookieCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {category.name}
                          </span>
                          {category.required && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              必需
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {category.description}
                        </p>
                      </div>
                      {category.required ? (
                        <span className="text-xs text-muted-foreground">
                          已启用
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          defaultChecked={false}
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences} size="sm">
                      保存设置
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

/**
 * 检查 Cookie 同意状态
 */
export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (consent) {
      try {
        const parsed = JSON.parse(consent) as CookieConsent
        setHasConsent(parsed.accepted)
      } catch {
        setHasConsent(false)
      }
    } else {
      setHasConsent(false)
    }
  }, [])

  return hasConsent
}

/**
 * 检查特定 Cookie 类别是否被接受
 */
export function useCookieCategory(categoryId: string): boolean {
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (consent) {
      try {
        const parsed = JSON.parse(consent) as CookieConsent
        setAccepted(parsed.acceptedCategories.includes(categoryId))
      } catch {
        setAccepted(false)
      }
    }
  }, [categoryId])

  return accepted
}