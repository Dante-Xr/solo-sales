/**
 * ============================================
 * 视口模式容器组件 (Phase 5 页面模式切换)
 * ============================================
 * 创建日期: 2026-04-14
 * 功能说明：
 *   - 根据视口模式包裹页面内容
 *   - 网页端：正常全宽显示
 *   - 手机端：居中显示，模拟手机屏幕
 *   - 支持不同手机屏幕尺寸自适应
 * ============================================
 */

"use client"

import { ReactNode } from "react"
import { useViewportModeStore } from "@/stores/useViewportModeStore"

export function ViewportWrapper({ children }: { children: ReactNode }) {
  const { mode } = useViewportModeStore()

  if (mode === "mobile") {
    return (
      <div className="flex justify-center min-h-screen bg-gray-400">
        <div className="w-full max-w-[375px] min-h-screen bg-background shadow-2xl overflow-x-hidden">
          {children}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
