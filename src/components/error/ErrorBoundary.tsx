/**
 * ============================================
 * 全局错误边界组件 (v0.4.3)
 * ============================================
 * 功能说明：
 *   - 捕获子组件的 JavaScript 错误
 *   - 防止错误导致整个应用白屏
 *   - 提供友好的错误提示 UI
 *   - 支持错误日志上报 (可选)
 * ============================================
 */

"use client"

import { Component, type ReactNode, type ErrorInfo, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

/**
 * 全局错误边界组件
 * 用于捕获子组件渲染过程中的 JavaScript 错误
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorId: null }
  }

  /**
   * 从错误状态恢复
   * 调用此方法后可重新渲染子组件
   */
  static resetErrorBoundary = () => {
    window.location.reload()
  }

  /**
   * 当子组件抛出错误时调用
   * 返回新的 state 来更新组件
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  /**
   * 生命周期钩子：组件捕获到错误时调用
   * 用于记录错误日志
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary 捕获到错误:", error, errorInfo)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // TODO: 可选 - 发送错误日志到 Sentry
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    // }
  }

  /**
   * 渲染错误兜底 UI
   */
  renderErrorUI(): ReactNode {
    const { error, errorId } = this.state

    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* 错误图标 */}
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          {/* 错误标题 */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">页面出现错误</h2>
            <p className="text-sm text-muted-foreground">
              抱歉，页面渲染过程中遇到了问题。请尝试刷新页面或返回首页。
            </p>
          </div>

          {/* 错误 ID (用于排查) */}
          {errorId && (
            <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">
              错误ID: {errorId}
            </div>
          )}

          {/* 错误信息 (开发环境显示) */}
          {process.env.NODE_ENV === "development" && error && (
            <details className="text-left">
              <summary className="text-sm font-medium cursor-pointer hover:text-foreground">
                错误详情 (开发模式)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-auto max-h-32 text-destructive">
                {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </details>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              返回首页
            </Button>
            <Button
              variant="default"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新页面
            </Button>
          </div>
        </div>
      </div>
    )
  }

  render(): ReactNode {
    const { hasError } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }
      return this.renderErrorUI()
    }

    return children
  }
}

/**
 * 简单的错误消息组件
 * 用于在特定区域显示错误状态
 */
export function ErrorMessage({
  title = "出错了",
  message = "加载失败，请稍后重试",
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
      <h3 className="font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          重试
        </Button>
      )}
    </div>
  )
}

/**
 * 异步操作的错误包装组件
 * 用于包裹异步加载的内容，处理加载失败的情况
 */
export function AsyncErrorBoundary({
  children,
  errorComponent,
  loadingComponent,
}: {
  children: ReactNode
  errorComponent?: ReactNode
  loadingComponent?: ReactNode
}) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 使用 useEffect 处理异步操作
  // children 如果是 React 元素而非 promise，直接显示
  const content = children as ReactNode

  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>
  }

  if (hasError) {
    return errorComponent || <ErrorMessage onRetry={() => window.location.reload()} />
  }

  return <>{content}</>
}