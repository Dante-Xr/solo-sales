/**
 * ============================================
 * 对话上下文管理服务 (v0.6.0)
 * ============================================
 * 功能说明：
 *   - 管理多轮对话上下文
 *   - 存储对话历史到数据库
 *   - 支持会话超时自动清理
 * ============================================
 */

import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { cacheGet, cacheSet, cacheDel, CACHE_KEYS } from "@/lib/cache"
import {
  ConversationContext,
  ChatMessage,
  Intent,
  ConversationState,
  ExtractedEntities,
  SatisfactionRating
} from "./types"

/**
 * 对话上下文缓存配置
 */
const CONTEXT_CACHE_TTL = 30 * 60 // 30 分钟

/**
 * 最大历史消息数
 */
const MAX_HISTORY_MESSAGES = 20

/**
 * 会话超时时间（毫秒）
 */
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 分钟

/**
 * 对话上下文管理服务
 */
export class ConversationManager {
  /**
   * 获取或创建对话上下文
   */
  async getOrCreateContext(sessionId: string, userId?: string): Promise<ConversationContext> {
    // 尝试从缓存获取
    const cacheKey = CACHE_KEYS.CONVERSATION(sessionId)
    const cached = await cacheGet<ConversationContext>(cacheKey)

    if (cached) {
      // 检查是否超时
      const timeSinceUpdate = Date.now() - new Date(cached.updatedAt).getTime()
      if (timeSinceUpdate < SESSION_TIMEOUT) {
        return cached
      }
    }

    // 从数据库获取
    const conversation = await prisma.conversation.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: MAX_HISTORY_MESSAGES
        }
      }
    })

    if (conversation) {
      const context = this.buildContextFromDb(conversation)
      await cacheSet(cacheKey, context, CONTEXT_CACHE_TTL)
      return context
    }

    // 创建新上下文
    const newContext: ConversationContext = {
      sessionId,
      userId,
      history: [],
      currentState: "initial",
      extractedEntities: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 保存到数据库
    await prisma.conversation.create({
      data: {
        id: sessionId,
        userId: userId || null,
        status: "ACTIVE"
      }
    })

    await cacheSet(cacheKey, newContext, CONTEXT_CACHE_TTL)

    return newContext
  }

  /**
   * 更新对话上下文
   */
  async updateContext(
    sessionId: string,
    updates: Partial<{
      currentIntent: Intent
      currentState: ConversationState
      extractedEntities: ExtractedEntities
      userEmail: string
    }>
  ): Promise<void> {
    const context = await this.getOrCreateContext(sessionId)

    const updatedContext: ConversationContext = {
      ...context,
      ...updates,
      updatedAt: new Date()
    }

    // 更新缓存
    const cacheKey = CACHE_KEYS.CONVERSATION(sessionId)
    await cacheSet(cacheKey, updatedContext, CONTEXT_CACHE_TTL)

    // 异步更新数据库
    prisma.conversation.update({
      where: { id: sessionId },
      data: {
        currentIntent: updates.currentIntent,
        status: this.stateToStatus(updates.currentState)
      }
    }).catch((error) => logger.error("Failed to update conversation", error))
  }

  /**
   * 添加消息到上下文
   */
  async addMessage(
    sessionId: string,
    message: Omit<ChatMessage, "id" | "timestamp">
  ): Promise<ChatMessage> {
    const context = await this.getOrCreateContext(sessionId)

    // 添加到历史
    const newMessage: ChatMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date()
    }

    context.history.push(newMessage)

    // 限制历史长度
    if (context.history.length > MAX_HISTORY_MESSAGES) {
      context.history = context.history.slice(-MAX_HISTORY_MESSAGES)
    }

    context.updatedAt = new Date()

    // 更新缓存
    const cacheKey = CACHE_KEYS.CONVERSATION(sessionId)
    await cacheSet(cacheKey, context, CONTEXT_CACHE_TTL)

    // 保存消息到数据库（异步）
    prisma.chatMessage.create({
      data: {
        conversationId: sessionId,
        role: message.role.toUpperCase() as "USER" | "ASSISTANT" | "SYSTEM",
        content: message.content,
        intent: message.intent,
        confidence: message.confidence
      }
    }).catch((error) => logger.error("Failed to save chat message", error))

    return newMessage
  }

  /**
   * 获取对话历史
   */
  async getHistory(sessionId: string, limit?: number): Promise<ChatMessage[]> {
    const context = await this.getOrCreateContext(sessionId)
    const history = context.history

    return limit ? history.slice(-limit) : history
  }

  /**
   * 清除对话历史
   */
  async clearHistory(sessionId: string): Promise<void> {
    // 清除缓存
    const cacheKey = CACHE_KEYS.CONVERSATION(sessionId)
    await cacheDel(cacheKey)

    // 清除数据库记录
    await prisma.chatMessage.deleteMany({
      where: { conversationId: sessionId }
    })

    // 重置上下文
    await prisma.conversation.update({
      where: { id: sessionId },
      data: {
        status: "ACTIVE",
        currentIntent: null
      }
    })
  }

  /**
   * 结束对话
   */
  async endConversation(sessionId: string): Promise<void> {
    await prisma.conversation.update({
      where: { id: sessionId },
      data: { status: "COMPLETED" }
    })

    // 清除缓存
    const cacheKey = CACHE_KEYS.CONVERSATION(sessionId)
    await cacheDel(cacheKey)
  }

  /**
   * 提交满意度评价
   */
  async submitFeedback(
    sessionId: string,
    rating: SatisfactionRating,
    comment?: string
  ): Promise<void> {
    await prisma.conversation.update({
      where: { id: sessionId },
      data: {
        rating,
        feedbackComment: comment
      }
    })
  }

  /**
   * 获取活跃会话数
   */
  async getActiveConversationsCount(): Promise<number> {
    return prisma.conversation.count({
      where: { status: "ACTIVE" }
    })
  }

  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions(): Promise<number> {
    const threshold = new Date(Date.now() - SESSION_TIMEOUT)

    const result = await prisma.conversation.updateMany({
      where: {
        status: "ACTIVE",
        updatedAt: { lt: threshold }
      },
      data: { status: "EXPIRED" }
    })

    return result.count
  }

  /**
   * 从数据库记录构建上下文
   */
  private buildContextFromDb(conversation: {
    id: string
    userId: string | null
    currentIntent: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    messages: Array<{
      id: string
      role: string
      content: string
      intent: string | null
      confidence: number | null
      createdAt: Date
    }>
  }): ConversationContext {
    return {
      sessionId: conversation.id,
      userId: conversation.userId || undefined,
      currentIntent: (conversation.currentIntent as Intent) || undefined,
      currentState: this.statusToState(conversation.status),
      extractedEntities: {},
      history: conversation.messages.map(m => ({
        id: m.id,
        role: m.role.toLowerCase() as "user" | "assistant" | "system",
        content: m.content,
        intent: m.intent as Intent | undefined,
        confidence: m.confidence || undefined,
        timestamp: m.createdAt
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    }
  }

  /**
   * 状态转状态码
   */
  private stateToStatus(state?: ConversationState): "ACTIVE" | "COMPLETED" | "EXPIRED" {
    switch (state) {
      case "resolved":
        return "COMPLETED"
      case "escalated":
        return "EXPIRED"
      default:
        return "ACTIVE"
    }
  }

  /**
   * 状态码转状态
   */
  private statusToState(status: string): ConversationState {
    switch (status) {
      case "COMPLETED":
        return "resolved"
      case "EXPIRED":
        return "escalated"
      default:
        return "initial"
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 对话管理器单例
 */
let conversationManager: ConversationManager | null = null

export function getConversationManager(): ConversationManager {
  if (!conversationManager) {
    conversationManager = new ConversationManager()
  }
  return conversationManager
}
