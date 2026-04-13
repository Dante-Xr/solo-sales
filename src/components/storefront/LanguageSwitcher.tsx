/**
 * ============================================
 * 语言切换组件 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 创建语言切换组件
 * 功能说明：
 *   - 支持中英文切换
 *   - 基于 next-intl 实现
 *   - 切换时更新 URL 语言前缀
 * ============================================
 */

"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()

  // 切换语言
  const switchLanguage = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh'
    
    // 获取当前路径
    const currentPath = window.location.pathname
    
    // 替换语言前缀
    let newPath: string
    if (currentPath.startsWith('/en/') || currentPath.startsWith('/zh/')) {
      newPath = currentPath.replace(/^\/(en|zh)\//, `/${newLocale}/`)
    } else {
      // 如果没有语言前缀，添加新的语言前缀
      newPath = `/${newLocale}${currentPath || '/'}`
    }
    
    // 保持搜索参数
    const searchParams = window.location.search
    if (searchParams) {
      newPath += searchParams
    }
    
    router.push(newPath)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={switchLanguage}
      title={t('language.switchToEnglish')}
      className="relative"
    >
      <Globe className="w-5 h-5 text-foreground" />
      <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-current rounded-full border border-background" />
    </Button>
  )
}
