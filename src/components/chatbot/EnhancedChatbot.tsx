"use client"

/**
 * ============================================
 * RAG 智能客服组件 (v0.6.0)
 * ============================================
 * 功能：
 *   - 多轮对话支持
 *   - 意图识别显示
 *   - 快捷回复建议
 *   - 满意度评价
 *   - 消息持久化
 * ============================================
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { Intent, RAGResult } from "@/lib/rag/types"

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  intent?: Intent
  confidence?: number
  sources?: RAGResult[]
  timestamp: Date
}

interface EnhancedChatbotProps {
  sessionId: string
  userId?: string
  userEmail?: string
  locale?: "zh" | "en"
  position?: "bottom-right" | "bottom-left"
  primaryColor?: string
  onEscalate?: (sessionId: string) => void
  onSessionEnd?: (sessionId: string, rating?: string) => void
}

const DEFAULT_MESSAGES = {
  welcome: {
    zh: "👋 您好！我是智能客服小助手。请问有什么可以帮您？",
    en: "👋 Hello! I'm your smart customer service assistant. How can I help you today?"
  },
  thinking: {
    zh: "🤔 正在思考回复...",
    en: "🤔 Thinking..."
  },
  error: {
    zh: "抱歉，服务出现问题。请稍后重试。",
    en: "Sorry, something went wrong. Please try again later."
  },
  satisfaction: {
    zh: "您对这次服务满意吗？",
    en: "Are you satisfied with this service?"
  }
}

export default function EnhancedChatbot({
  sessionId,
  userId,
  userEmail,
  locale = "zh",
  position = "bottom-right",
  primaryColor = "#4F46E5",
  onEscalate,
  onSessionEnd
}: EnhancedChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSatisfaction, setShowSatisfaction] = useState(false)
  const [lastIntent, setLastIntent] = useState<Intent | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = DEFAULT_MESSAGES

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      inputRef.current?.focus()
    }
  }, [isOpen, messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: t.welcome[locale],
        timestamp: new Date()
      }])
    }
  }, [isOpen, locale, t.welcome])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: createMessageId("user"),
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: content.trim(),
          userId,
          userEmail
        })
      })

      const data = await response.json()

      if (data.success) {
        const { response: ragResponse } = data.data

        const assistantMessage: ChatMessage = {
          id: createMessageId("assistant"),
          role: "assistant",
          content: ragResponse.answer,
          intent: ragResponse.intent,
          confidence: ragResponse.confidence,
          sources: ragResponse.sources,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        setLastIntent(ragResponse.intent)

        if (ragResponse.requiresHuman) {
          onEscalate?.(sessionId)
        }

        if (ragResponse.confidence < 0.5 && ragResponse.sources.length === 0) {
          setShowSatisfaction(true)
        }
      } else {
        throw new Error(data.error)
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: createMessageId("error"),
        role: "assistant",
        content: t.error[locale],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const submitFeedback = async (rating: "satisfied" | "neutral" | "dissatisfied") => {
    try {
      await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          rating,
          comment: ""
        })
      })

      setShowSatisfaction(false)
      onSessionEnd?.(sessionId, rating)
    } catch (error: unknown) {
      console.error("Failed to submit feedback:", error)
    }
  }

  const clearHistory = async () => {
    try {
      await fetch(`/api/chat/feedback?sessionId=${sessionId}`, {
        method: "DELETE"
      })
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: t.welcome[locale],
        timestamp: new Date()
      }])
    } catch (error: unknown) {
      console.error("Failed to clear history:", error)
    }
  }

  const getSuggestedResponses = (): string[] => {
    if (!lastIntent) return []

    const suggestions: Record<Intent, string[]> = {
      product_inquiry: ["查看商品列表", "商品价格", "新品推荐"],
      order_status: ["我的订单", "发货时间", "物流查询"],
      return_refund: ["退货政策", "退款进度", "换货流程"],
      shipping_info: ["配送范围", "运费说明", "发货时间"],
      payment_issue: ["支付方式", "优惠券使用", "价格优惠"],
      complaint: ["联系客服", "投诉建议", "意见反馈"],
      general: ["常见问题", "使用帮助", "联系客服"],
      unknown: ["常见问题", "使用帮助", "联系客服"]
    }

    return suggestions[lastIntent] || suggestions.unknown
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <>
      {/* 聊天按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: primaryColor,
          bottom: position === "bottom-right" ? "1.5rem" : "1.5rem",
          right: position === "bottom-right" ? "1.5rem" : "auto",
          left: position === "bottom-left" ? "1.5rem" : "auto"
        }}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div
          className="fixed z-40 w-96 max-w-[calc(100vw-2rem)] h-[32rem] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            bottom: "5.5rem",
            right: position === "bottom-right" ? "1.5rem" : "auto",
            left: position === "bottom-left" ? "1.5rem" : "auto"
          }}
        >
          {/* 头部 */}
          <div
            className="px-4 py-3 flex items-center justify-between text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">智能客服</div>
                <div className="text-xs opacity-80">v0.6.0 · RAG powered</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearHistory}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                title={locale === "zh" ? "清除历史" : "Clear history"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-card text-card-foreground rounded-bl-sm shadow-sm"
                  }`}
                  style={message.role === "user" ? { backgroundColor: primaryColor } : {}}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === "user" ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {showSatisfaction && (
              <div className="flex justify-start">
                <div className="bg-card rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                  <div className="text-sm text-card-foreground mb-2">{t.satisfaction[locale]}</div>
                  <div className="flex gap-2">
                    {(["satisfied", "neutral", "dissatisfied"] as const).map((rating) => (
                      <button
                        key={rating}
                        onClick={() => submitFeedback(rating)}
                        className="px-3 py-1.5 rounded-full text-sm transition-colors"
                        style={{
                          backgroundColor: rating === "satisfied" ? "#10B981" : rating === "neutral" ? "#F59E0B" : "#EF4444",
                          color: "white"
                        }}
                      >
                        {rating === "satisfied" ? "👍" : rating === "neutral" ? "😐" : "👎"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 快捷回复 */}
          {messages.length > 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-border bg-card">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {getSuggestedResponses().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="px-3 py-1 text-xs rounded-full border border-border text-foreground hover:border-foreground/30 hover:bg-muted transition-colors whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入框 */}
          <div className="p-4 border-t border-border bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(inputValue)
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={locale === "zh" ? "输入您的问题..." : "Type your message..."}
                className="flex-1 px-4 py-2 rounded-full border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
function createMessageId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}
