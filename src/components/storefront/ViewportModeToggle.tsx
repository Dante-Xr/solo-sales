/**
 * ============================================
 * 视口模式切换组件 (Phase 5 页面模式切换)
 * ============================================
 * 创建日期: 2026-04-14
 * 创建时间: 09:35
 * 功能说明：
 *   - 在网页端和手机端模式之间切换
 *   - 网页端：正常宽度显示
 *   - 手机端：模拟手机屏幕宽度（375px）
 *   - 按钮位于夜间模式按钮左边
 * ============================================
 */

"use client"

import { Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useViewportModeStore } from "@/stores/useViewportModeStore"
import { useTranslations } from "next-intl"

export function ViewportModeToggle() {
  const t = useTranslations("viewport")
  const { mode, toggleMode } = useViewportModeStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      title={mode === "desktop" ? t("switchToMobile") : t("switchToDesktop")}
    >
      {mode === "mobile" ? (
        <Monitor className="w-5 h-5 text-foreground" />
      ) : (
        <Smartphone className="w-5 h-5 text-foreground" />
      )}
    </Button>
  )
}
