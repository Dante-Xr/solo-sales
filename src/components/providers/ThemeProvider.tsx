/**
 * ============================================
 * next-themes 主题提供者 (Phase 1 零成本修复)
 * ============================================
 * 功能说明：
 *   - 替代自建的 ThemeProvider
 *   - 使用 next-themes 提供主题管理
 *   - 支持暗色模式切换
 *   - 解决 hydration 不匹配问题
 *
 * 配置说明：
 *   - attribute="class": 使用 CSS class 切换主题
 *   - defaultTheme="system": 默认跟随系统主题
 *   - enableSystem: 允许系统主题选项
 *   - disableTransitionOnChange: 切换主题时禁用过渡动画（避免闪烁）
 * ============================================
 */

"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ReactNode } from "react"

/**
 * 主题提供者组件
 * 包装整个应用，为子组件提供主题上下文
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"          // 使用 class 属性切换主题（支持暗色模式）
      defaultTheme="system"       // 默认跟随系统主题
      enableSystem               // 启用系统主题选项
      disableTransitionOnChange   // 切换主题时禁用过渡动画
    >
      {children}
    </NextThemesProvider>
  )
}

/**
 * 导出 useTheme hook
 * 组件内使用：const { theme, setTheme } = useTheme()
 */
export { useTheme } from "next-themes"
