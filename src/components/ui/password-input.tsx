/**
 * ============================================
 * 密码输入组件 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 带眼睛图标的密码输入框
 *   - 可切换显示/隐藏密码
 * ============================================
 */

"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  error?: boolean
}

export function PasswordInput({ className, error, disabled, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn(className, "pr-10")}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff size={16} />
        ) : (
          <Eye size={16} />
        )}
      </button>
    </div>
  )
}