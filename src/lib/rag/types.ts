/**
 * ============================================
 * RAG 客服类型定义 (v0.6.0)
 * ============================================
 */

/**
 * 意图类型枚举
 */
export type Intent =
  | "product_inquiry"      // 产品咨询
  | "order_status"          // 订单状态
  | "return_refund"        // 退换货
  | "shipping_info"         // 物流信息
  | "payment_issue"         // 支付问题
  | "complaint"             // 投诉
  | "general"               // 一般咨询
  | "unknown"               // 未知意图

/**
 * 意图模式 - 用于意图识别
 */
export const INTENT_PATTERNS: Record<Intent, string[]> = {
  product_inquiry: [
    "产品", "商品", "规格", "参数", "材质", "尺寸",
    "怎么用", "如何使用", "功能", "特点", "优点"
  ],
  order_status: [
    "订单", "发货", "物流", "到了吗", "什么时候到",
    "查看订单", "订单状态", "发货了吗"
  ],
  return_refund: [
    "退货", "退款", "换货", "售后", "投诉",
    "不满意", "坏了", "质量问题"
  ],
  shipping_info: [
    "快递", "运费", "包邮", "配送", "送货",
    "自提", "发货时间", "几天到"
  ],
  payment_issue: [
    "支付", "付款", "优惠券", "折扣", "优惠码",
    "打折", "价格", "多少钱"
  ],
  complaint: [
    "投诉", "差评", "态度", "欺骗", "虚假",
    "坑", "骗人", "垃圾", "失望"
  ],
  general: [
    "你好", "嗨", "在吗", "请问", "咨询",
    "帮助", "有用", "谢谢"
  ],
  unknown: []
}

/**
 * 对话状态
 */
export type ConversationState =
  | "initial"                // 初始状态
  | "intent_detected"        // 意图已识别
  | "awaiting_confirmation"  // 等待确认
  | "entities_extracted"     // 实体已提取
  | "resolved"               // 已解决
  | "escalated"             // 转人工

/**
 * 提取的实体
 */
export interface ExtractedEntities {
  orderId?: string
  productId?: string
  email?: string
  phone?: string
  name?: string
  date?: string
}

/**
 * 消息角色
 */
export type MessageRole = "user" | "assistant" | "system"

/**
 * 消息结构
 */
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  intent?: Intent
  confidence?: number
  metadata?: Record<string, unknown>
}

/**
 * 对话上下文
 */
export interface ConversationContext {
  sessionId: string
  userId?: string
  userEmail?: string
  history: ChatMessage[]
  currentIntent?: Intent
  currentState: ConversationState
  extractedEntities: ExtractedEntities
  createdAt: Date
  updatedAt: Date
}

/**
 * RAG 配置
 */
export interface RAGConfig {
  topK: number
  similarityThreshold: number
  maxTokens: number
  temperature: number
}

/**
 * RAG 检索结果
 */
export interface RAGResult {
  id: string
  title: string
  content: string
  category: string
  similarity: number
  source: "knowledge" | "faq" | "product"
}

/**
 * RAG 回复
 */
export interface RAGResponse {
  answer: string
  intent: Intent
  confidence: number
  sources: RAGResult[]
  suggestedActions: string[]
  requiresHuman: boolean
}

/**
 * 对话满意度评价
 */
export type SatisfactionRating = "satisfied" | "neutral" | "dissatisfied"

/**
 * 对话满意度评价
 */
export interface ConversationFeedback {
  conversationId: string
  rating: SatisfactionRating
  comment?: string
  createdAt: Date
}

/**
 * 默认 RAG 配置
 */
export const DEFAULT_RAG_CONFIG: RAGConfig = {
  topK: 5,
  similarityThreshold: 0.7,
  maxTokens: 500,
  temperature: 0.7
}

/**
 * 意图名称映射（中文）
 */
export const INTENT_NAMES: Record<Intent, string> = {
  product_inquiry: "产品咨询",
  order_status: "订单状态",
  return_refund: "退换货",
  shipping_info: "物流信息",
  payment_issue: "支付问题",
  complaint: "投诉",
  general: "一般咨询",
  unknown: "未知"
}
