/**
 * ============================================
 * RAG 检索服务 (v0.6.0)
 * ============================================
 * 功能说明：
 *   - 从知识库检索相关内容
 *   - 计算文本相似度
 *   - 支持多源检索（知识库、FAQ、商品）
 * ============================================
 */

import { prisma } from "@/lib/prisma"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"
import { RAGResult, RAGConfig, DEFAULT_RAG_CONFIG } from "./types"

export class RAGService {
  private readonly config: RAGConfig

  constructor(config: Partial<RAGConfig> = {}) {
    this.config = { ...DEFAULT_RAG_CONFIG, ...config }
  }

  /**
   * 检索相关内容
   */
  async retrieve(query: string, topK?: number): Promise<RAGResult[]> {
    const k = topK || this.config.topK

    // 并行检索多个来源
    const [knowledgeResults, faqResults] = await Promise.all([
      this.searchKnowledge(query, k),
      this.searchFAQ(query, k)
    ])

    // 合并结果并排序
    const allResults = [...knowledgeResults, ...faqResults]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)

    return allResults
  }

  /**
   * 搜索知识库
   */
  private async searchKnowledge(query: string, topK: number): Promise<RAGResult[]> {
    // 构建缓存键
    const cacheKey = `${CACHE_KEYS.RAG_KNOWLEDGE || "rag:knowledge"}:${query.slice(0, 50)}`

    // 尝试从缓存获取
    const cached = await cacheGet<RAGResult[]>(cacheKey)
    if (cached) {
      return cached
    }

    // 搜索知识库
    const knowledgeArticles = await prisma.knowledgeArticle.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { tags: { hasSome: [query] } }
        ]
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true
      },
      take: topK * 2, // 取更多结果用于相似度排序
      orderBy: { updatedAt: "desc" }
    })

    // 计算相似度并返回
    const results: RAGResult[] = knowledgeArticles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content.slice(0, 500), // 截取前500字符
      category: article.category,
      similarity: this.calculateSimilarity(query, `${article.title} ${article.content}`),
      source: "knowledge" as const
    }))

    // 按相似度排序
    results.sort((a, b) => b.similarity - a.similarity)

    // 缓存结果
    if (results.length > 0) {
      await cacheSet(cacheKey, results.slice(0, topK), CACHE_TTL.MEDIUM)
    }

    return results.slice(0, topK)
  }

  /**
   * 搜索 FAQ
   */
  private async searchFAQ(query: string, topK: number): Promise<RAGResult[]> {
    // 搜索 FAQ 集合
    const faqResults = await prisma.fAQ.findMany({
      where: {
        OR: [
          { question: { contains: query, mode: "insensitive" } },
          { answer: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true
      },
      take: topK
    })

    return faqResults.map(faq => ({
      id: faq.id,
      title: faq.question,
      content: faq.answer.slice(0, 500),
      category: faq.category || "FAQ",
      similarity: this.calculateSimilarity(query, `${faq.question} ${faq.answer}`),
      source: "faq" as const
    }))
  }

  /**
   * 计算文本相似度（简化的 TF-IDF 算法）
   */
  private calculateSimilarity(query: string, text: string): number {
    const queryWords = this.tokenize(query.toLowerCase())
    const textWords = this.tokenize(text.toLowerCase())

    if (queryWords.length === 0 || textWords.length === 0) {
      return 0
    }

    // 计算查询词在文本中出现的次数
    let matchCount = 0
    for (const word of queryWords) {
      if (textWords.includes(word)) {
        matchCount++
      }
    }

    // 计算相似度：匹配词数 / 查询词数
    const similarity = matchCount / queryWords.length

    // 考虑文本长度因素（越短的文本匹配越精确）
    const lengthPenalty = Math.min(textWords.length / 100, 1)

    return similarity * (0.7 + 0.3 * lengthPenalty)
  }

  /**
   * 分词（简单的中英文分词）
   */
  private tokenize(text: string): string[] {
    // 移除标点符号
    const cleanText = text.replace(/[^\w\s\u4e00-\u9fff]/g, " ")

    // 按空格和中文分词
    const words = cleanText.split(/\s+/).filter(w => w.length >= 2)

    return words
  }

  /**
   * 生成回复（基于检索结果生成）
   */
  generateResponse(query: string, results: RAGResult[]): string {
    if (results.length === 0) {
      return "抱歉，我没有找到相关的答案。您可以尝试换个问题，或者联系人工客服获取帮助。"
    }

    const topResult = results[0]

    // 根据来源生成不同格式的回复
    switch (topResult.source) {
      case "faq":
        return `根据常见问题：\n\n**${topResult.title}**\n\n${topResult.content}\n\n您还有其他问题吗？`

      case "knowledge":
        return `我在知识库中找到相关信息：\n\n**${topResult.title}**\n\n${topResult.content}...\n\n[查看完整内容](#)\n\n这个回答对您有帮助吗？`

      case "product":
        return `相关商品信息：\n\n**${topResult.title}**\n\n${topResult.content}\n\n[查看商品详情](#)`

      default:
        return `${topResult.content}\n\n这个回答对您有帮助吗？`
    }
  }

  /**
   * 检查是否需要转人工
   */
  shouldEscalateToHuman(intent: string, confidence: number, context?: {
    failedAttempts?: number
    currentState?: string
  }): boolean {
    // 低置信度
    if (confidence < 0.3) {
      return true
    }

    // 投诉类意图
    if (intent === "complaint") {
      return true
    }

    // 多次尝试失败
    if ((context?.failedAttempts || 0) >= 3) {
      return true
    }

    // 状态为 escalation
    if (context?.currentState === "escalated") {
      return true
    }

    return false
  }
}

/**
 * RAG 服务单例
 */
let ragService: RAGService | null = null

export function getRAGService(config?: Partial<RAGConfig>): RAGService {
  if (!ragService) {
    ragService = new RAGService(config)
  }
  return ragService
}
