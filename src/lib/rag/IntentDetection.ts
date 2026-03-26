/**
 * ============================================
 * 意图识别服务 (v0.6.0)
 * ============================================
 * 功能说明：
 *   - 基于关键词模式匹配识别用户意图
 *   - 支持多轮对话上下文
 *   - 提取关键实体（订单号、商品ID、邮箱等）
 * ============================================
 */

import {
  Intent,
  INTENT_PATTERNS,
  ExtractedEntities,
  ConversationContext,
  ConversationState,
  INTENT_NAMES
} from "./types"

/**
 * 实体提取正则表达式
 */
const ENTITY_PATTERNS = {
  orderId: /订单[号#]?\s*([A-Za-z0-9\-_]+)/i,
  productId: /商品[ID号]?\s*([A-Za-z0-9\-_]+)/i,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  phone: /1[3-9]\d{9}/,
  name: /(?:我叫|我是)\s*([^\s]+)/,
  date: /(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/
}

/**
 * 意图识别服务类
 */
export class IntentDetectionService {
  private readonly intentPatterns: Record<Intent, string[]>

  constructor() {
    this.intentPatterns = INTENT_PATTERNS
  }

  /**
   * 识别用户意图
   */
  detectIntent(message: string, context?: ConversationContext): {
    intent: Intent
    confidence: number
  } {
    const lowerMessage = message.toLowerCase()

    // 如果有上下文且之前已识别意图，检查是否继续同一意图
    if (context?.currentIntent && context.currentState !== "initial") {
      const continuationScore = this.calculateContinuationScore(message, context)
      if (continuationScore > 0.6) {
        return {
          intent: context.currentIntent,
          confidence: continuationScore
        }
      }
    }

    // 计算每个意图的匹配分数
    const scores: Record<Intent, number> = {} as Record<Intent, number>

    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (intent === "unknown") continue

      let score = 0
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern.toLowerCase())) {
          score += 1
        }
      }

      // 归一化分数
      scores[intent as Intent] = patterns.length > 0 ? score / patterns.length : 0
    }

    // 找出最高分意图
    let maxIntent: Intent = "unknown"
    let maxScore = 0

    for (const [intent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score
        maxIntent = intent as Intent
      }
    }

    // 如果最高分低于阈值，返回 unknown
    if (maxScore < 0.1) {
      return { intent: "general", confidence: 0.5 }
    }

    return {
      intent: maxIntent,
      confidence: Math.min(maxScore * 2, 1) // 放大分数但不超过 1
    }
  }

  /**
   * 计算继续同一意图的概率
   */
  private calculateContinuationScore(message: string, context: ConversationContext): number {
    if (!context.currentIntent) return 0

    const lowerMessage = message.toLowerCase()
    const patterns = this.intentPatterns[context.currentIntent]

    // 检查是否有继续意图的关键词
    const continuationPatterns = ["继续", "是的", "对", "没错", "好的", "了解", "明白了"]
    for (const pattern of continuationPatterns) {
      if (lowerMessage.includes(pattern)) {
        return 0.8
      }
    }

    // 检查是否包含当前意图的关键词
    let matchCount = 0
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        matchCount++
      }
    }

    return patterns.length > 0 ? matchCount / patterns.length : 0
  }

  /**
   * 提取消息中的实体
   */
  extractEntities(message: string, intent: Intent): ExtractedEntities {
    const entities: ExtractedEntities = {}

    // 提取邮箱
    const emailMatch = message.match(ENTITY_PATTERNS.email)
    if (emailMatch) {
      entities.email = emailMatch[0]
    }

    // 提取手机号
    const phoneMatch = message.match(ENTITY_PATTERNS.phone)
    if (phoneMatch) {
      entities.phone = phoneMatch[0]
    }

    // 提取姓名
    const nameMatch = message.match(ENTITY_PATTERNS.name)
    if (nameMatch) {
      entities.name = nameMatch[1]
    }

    // 根据意图提取特定实体
    switch (intent) {
      case "order_status":
      case "return_refund":
        const orderMatch = message.match(ENTITY_PATTERNS.orderId)
        if (orderMatch) {
          entities.orderId = orderMatch[1]
        }
        break

      case "product_inquiry":
        const productMatch = message.match(ENTITY_PATTERNS.productId)
        if (productMatch) {
          entities.productId = productMatch[1]
        }
        break
    }

    return entities
  }

  /**
   * 确定对话状态
   */
  determineState(
    intent: Intent,
    entities: ExtractedEntities,
    context?: ConversationContext
  ): ConversationState {
    // 如果实体已完整提取
    if (this.isEntitiesComplete(intent, entities)) {
      return "entities_extracted"
    }

    // 如果需要更多确认
    if (this.needsConfirmation(intent, entities)) {
      return "awaiting_confirmation"
    }

    // 如果之前状态是等待确认
    if (context?.currentState === "awaiting_confirmation") {
      if (this.isConfirmationPositive(context.history[context.history.length - 1]?.content || "")) {
        return "intent_detected"
      }
    }

    return "initial"
  }

  /**
   * 检查实体是否完整
   */
  private isEntitiesComplete(intent: Intent, entities: ExtractedEntities): boolean {
    switch (intent) {
      case "order_status":
      case "return_refund":
        return !!(entities.orderId || entities.email || entities.phone)
      case "product_inquiry":
        return !!(entities.productId || entities.name)
      case "general":
      case "unknown":
        return true
      default:
        return false
    }
  }

  /**
   * 检查是否需要确认
   */
  private needsConfirmation(intent: Intent, entities: ExtractedEntities): boolean {
    return !this.isEntitiesComplete(intent, entities)
  }

  /**
   * 检查是否确认积极
   */
  private isConfirmationPositive(message: string): boolean {
    const positivePatterns = ["是的", "对", "没错", "正确", "是"]
    const lowerMessage = message.toLowerCase()
    return positivePatterns.some(p => lowerMessage.includes(p))
  }

  /**
   * 获取意图的友好名称
   */
  getIntentName(intent: Intent): string {
    return INTENT_NAMES[intent] || "未知"
  }

  /**
   * 生成确认问题
   */
  generateConfirmationQuestion(intent: Intent, missingEntity: string): string {
    const questions: Record<string, string> = {
      orderId: "请提供您的订单号，我可以帮您查询订单状态。",
      email: "请提供您的注册邮箱，以便我查询您的订单。",
      phone: "请提供您的手机号码，以便我查询您的订单。",
      productId: "请提供您想咨询的商品名称或商品ID。",
      name: "请告诉我您的姓名。"
    }

    return questions[missingEntity] || "请提供更多信息以便我帮助您。"
  }

  /**
   * 获取意图对应的快捷回复
   */
  getSuggestedResponses(intent: Intent): string[] {
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

    return suggestions[intent] || suggestions.unknown
  }
}

/**
 * 意图检测服务单例
 */
let intentDetectionService: IntentDetectionService | null = null

export function getIntentDetectionService(): IntentDetectionService {
  if (!intentDetectionService) {
    intentDetectionService = new IntentDetectionService()
  }
  return intentDetectionService
}
