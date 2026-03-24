/**
 * ============================================
 * Checkbox 复选框组件 (v0.4.1)
 * ============================================
 * 功能说明：
 *   - 用于多选场景的复选框组件
 *   - 优化动画效果：流畅过渡、弹性动画、视觉反馈
 *   - 支持移动端触控优化
 * ============================================
 */

"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked ?? false)
    
    // 同步外部 checked 状态
    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      if (checked === undefined) {
        setIsChecked(newChecked)
      }
      onCheckedChange?.(newChecked)
    }

    return (
      <label className="relative inline-flex cursor-pointer items-center group">
        <input
          type="checkbox"
          ref={ref}
          checked={checked !== undefined ? checked : isChecked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        {/* 复选框容器 */}
        <div
          className={cn(
            // 基础样式
            "h-5 w-5 rounded border-2 border-input bg-background",
            // 动画效果
            "transition-all duration-200 ease-out",
            // 选中状态
            "peer-checked:bg-primary peer-checked:border-primary",
            // 聚焦状态
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            // 禁用状态
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            // 悬停效果
            "group-hover:border-primary/50 group-hover:bg-muted/50",
            // 按下效果
            "group-active:scale-95",
            className
          )}
        >
          {/* 勾选图标 */}
          <div
            className={cn(
              // 基础样式
              "flex items-center justify-center h-full w-full",
              // 动画效果 - 使用 cubic-bezier 实现弹性效果
              "transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              // 未选中状态
              "scale-0 opacity-0",
              // 选中状态
              "peer-checked:scale-100 peer-checked:opacity-100"
            )}
          >
            <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3]" />
          </div>
        </div>
      </label>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
