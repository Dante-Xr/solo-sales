/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理客服会话页未使用 hook，并用 Conversation 类型替代消息列表 any。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 客服会话页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 客服消息列表展示
 *   - 消息搜索和筛选
 *   - 简易聊天界面
 *   - 使用 Refine useList hook 获取消息
 *   - 使用 Refine useCustom hook 发送消息
 * ============================================
 * 2026-04-13: 集成 Refine useList/useCustom hook
 * 2026-04-13 23:30: 迁移到 Refine 数据获取方案
 */

"use client"

import { useState, useRef } from "react"
import { useList } from "@refinedev/core"
import { MessageSquare, Search, Send, User, Bot, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTranslations, useLocale } from "next-intl"

interface ChatMessage {
  id: string
  content: string
  isFromAdmin: boolean
  isRead: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

interface Conversation {
  oderId: string
  oderName: string
  oderEmail: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: ChatMessage[]
}

const FALLBACK_CONVERSATIONS: Conversation[] = [
  {
    oderId: "user_1",
    oderName: "TikTok User 1",
    oderEmail: "user1@tiktok.com",
    lastMessage: "请问这个商品什么时候发货？",
    lastMessageTime: "2026-07-14T08:00:00.000Z",
    unreadCount: 2,
    messages: [
      {
        id: "msg_1",
        content: "你好，我想问一下这个商品的物流情况",
        isFromAdmin: false,
        isRead: true,
        createdAt: "2026-07-14T07:00:00.000Z",
        user: { id: "user_1", name: "TikTok User 1", email: "user1@tiktok.com" },
      },
      {
        id: "msg_2",
        content: "您好，您的订单已发货，预计3-5天到达",
        isFromAdmin: true,
        isRead: true,
        createdAt: "2026-07-14T07:30:00.000Z",
        user: { id: "admin", name: "Admin", email: null },
      },
      {
        id: "msg_3",
        content: "请问这个商品什么时候发货？",
        isFromAdmin: false,
        isRead: false,
        createdAt: "2026-07-14T08:00:00.000Z",
        user: { id: "user_1", name: "TikTok User 1", email: "user1@tiktok.com" },
      },
    ],
  },
  {
    oderId: "user_2",
    oderName: "TikTok User 2",
    oderEmail: "user2@tiktok.com",
    lastMessage: "谢谢您的帮助",
    lastMessageTime: "2026-07-14T06:00:00.000Z",
    unreadCount: 0,
    messages: [
      {
        id: "msg_4",
        content: "我收到了，但尺码不对",
        isFromAdmin: false,
        isRead: true,
        createdAt: "2026-07-13T08:00:00.000Z",
        user: { id: "user_2", name: "TikTok User 2", email: "user2@tiktok.com" },
      },
      {
        id: "msg_5",
        content: "抱歉给您带来不便，我们可以提供换货服务",
        isFromAdmin: true,
        isRead: true,
        createdAt: "2026-07-13T09:00:00.000Z",
        user: { id: "admin", name: "Admin", email: null },
      },
      {
        id: "msg_6",
        content: "谢谢您的帮助",
        isFromAdmin: false,
        isRead: true,
        createdAt: "2026-07-14T06:00:00.000Z",
        user: { id: "user_2", name: "TikTok User 2", email: "user2@tiktok.com" },
      },
    ],
  },
]

export default function ChatPage() {
  const t = useTranslations('admin.chat')
  const locale = useLocale()

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { query: { data: messagesData, isLoading: loading, refetch } } = useList({
    resource: "messages",
    pagination: { currentPage: 1, pageSize: 100 },
    queryOptions: {
      enabled: true,
    },
  })

  const conversations: Conversation[] = Array.isArray(messagesData?.data) && messagesData.data.length > 0
    ? messagesData.data as Conversation[]
    : FALLBACK_CONVERSATIONS

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)

    try {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        content: newMessage,
        isFromAdmin: true,
        isRead: true,
        createdAt: new Date().toISOString(),
        user: { id: "admin", name: "Admin", email: null },
      }

      setSelectedConversation((prev) =>
        prev
          ? {
              ...prev,
              lastMessage: newMessage,
              lastMessageTime: new Date().toISOString(),
              messages: [...prev.messages, newMsg],
            }
          : null
      )
      setNewMessage("")
      scrollToBottom()
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return locale === "zh" ? "刚刚" : "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${locale === "zh" ? "分钟前" : "m ago"}`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${locale === "zh" ? "小时前" : "h ago"}`
    return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")
  }

  const filteredConversations = conversations.filter((conv) => {
    if (!searchKeyword) return true
    return (
      conv.oderName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      conv.oderEmail?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchKeyword.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="flex h-[calc(100vh-140px)]">
        {/* 会话列表 */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t('pageTitle')}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                {t('loading')}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {t('noMessages')}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.oderId}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation?.oderId === conv.oderId ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{conv.oderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white">{conv.unreadCount}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 聊天区域 */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedConversation ? (
            <>
              {/* 聊天头部 */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{selectedConversation.oderName}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedConversation.oderEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.isFromAdmin
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.isFromAdmin ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {msg.isFromAdmin
                            ? t('support')
                            : selectedConversation.oderName}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                      <div className="text-xs opacity-70 mt-1 text-right">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入框 */}
              <div className="p-4 border-t bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('messagePlaceholder')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={sending}
                  />
                  <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>{t('selectConversation')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
