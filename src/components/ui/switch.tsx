/**
 * ============================================
 * Switch 开关组件 (v0.4.3 优化版)
 * ============================================
 * 功能说明：
 *   - 用于设置页面的开关选项
 *   - 参考 iPhone 静音按钮交互逻辑与视觉表现
 *   - 关闭状态：圆形图标在左侧（浅色背景）
 *   - 开启状态：圆形图标在右侧（深色背景）
 *   - 平滑过渡动画，自然流畅
 * ============================================
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(props.defaultChecked ?? false)

    const checked = props.checked !== undefined ? props.checked : isChecked

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked)
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label className="relative inline-flex h-7 w-[52px] cursor-pointer items-center group">
        <input
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        {/* 轨道背景 - 参考 iPhone 风格 */}
        <div
          className={cn(
            "h-full w-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
            checked ? "bg-primary" : "bg-muted-foreground/20",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "group-hover:opacity-90",
            "group-active:opacity-80",
            className
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-md",
              "transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
              checked ? "translate-x-[28px]" : "translate-x-0",
              "group-hover:shadow-lg",
              "group-active:scale-95"
            )}
          />
        </div>
      </label>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }