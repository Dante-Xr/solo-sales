/**
 * ============================================
 * 客服会话页面 (Task 3.1)
 * ============================================
 * 功能说明：
 *   - 客服消息列表展示
 *   - 消息搜索和筛选
 *   - 简易聊天界面
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MessageSquare, Search, Send, User, Bot, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/context/LanguageContext"

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

export default function ChatPage() {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 获取会话列表
  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/messages")
      const result = await response.json()

      if (result.success) {
        // 模拟会话数据（按用户分组消息）
        const mockConversations: Conversation[] = [
          {
            oderId: "user_1",
            oderName: "TikTok User 1",
            oderEmail: "user1@tiktok.com",
            lastMessage: "请问这个商品什么时候发货？",
            lastMessageTime: new Date().toISOString(),
            unreadCount: 2,
            messages: [
              {
                id: "msg_1",
                content: "你好，我想问一下这个商品的物流情况",
                isFromAdmin: false,
                isRead: true,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                user: { id: "user_1", name: "TikTok User 1", email: "user1@tiktok.com" },
              },
              {
                id: "msg_2",
                content: "您好，您的订单已发货，预计3-5天到达",
                isFromAdmin: true,
                isRead: true,
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                user: { id: "admin", name: "Admin", email: null },
              },
              {
                id: "msg_3",
                content: "请问这个商品什么时候发货？",
                isFromAdmin: false,
                isRead: false,
                createdAt: new Date().toISOString(),
                user: { id: "user_1", name: "TikTok User 1", email: "user1@tiktok.com" },
              },
            ],
          },
          {
            oderId: "user_2",
            oderName: "TikTok User 2",
            oderEmail: "user2@tiktok.com",
            lastMessage: "谢谢您的帮助",
            lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
            unreadCount: 0,
            messages: [
              {
                id: "msg_4",
                content: "我收到了，但尺码不对",
                isFromAdmin: false,
                isRead: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                user: { id: "user_2", name: "TikTok User 2", email: "user2@tiktok.com" },
              },
              {
                id: "msg_5",
                content: "抱歉给您带来不便，我们可以提供换货服务",
                isFromAdmin: true,
                isRead: true,
                createdAt: new Date(Date.now() - 82800000).toISOString(),
                user: { id: "admin", name: "Admin", email: null },
              },
              {
                id: "msg_6",
                content: "谢谢您的帮助",
                isFromAdmin: false,
                isRead: true,
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                user: { id: "user_2", name: "TikTok User 2", email: "user2@tiktok.com" },
              },
            ],
          },
        ]
        setConversations(mockConversations)
      }
    } catch (error) {
      console.error("获取会话列表失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom()
    }
  }, [selectedConversation])

  // 发送消息
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

      // 更新当前会话
      const updatedConversations = conversations.map((conv) => {
        if (conv.oderId === selectedConversation.oderId) {
          return {
            ...conv,
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString(),
            messages: [...conv.messages, newMsg],
          }
        }
        return conv
      })

      setConversations(updatedConversations)
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
    } finally {
      setSending(false)
    }
  }

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return isZh ? "刚刚" : "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${isZh ? "分钟前" : "m ago"}`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${isZh ? "小时前" : "h ago"}`
    return date.toLocaleDateString(isZh ? "zh-CN" : "en-US")
  }

  // 搜索过滤
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
                {isZh ? "客服消息" : "Messages"}
              </h2>
              <Button variant="ghost" size="icon" onClick={fetchConversations}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={isZh ? "搜索消息..." : "Search messages..."}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                {isZh ? "加载中..." : "Loading..."}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {isZh ? "暂无消息" : "No messages"}
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
                            ? isZh ? "客服"
                            : "Support"
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
                    placeholder={isZh ? "输入回复..." : "Type a message..."}
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
                <p>{isZh ? "选择一个会话开始聊天" : "Select a conversation to start chatting"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}