import Tesseract from 'tesseract.js'

export class OCRService {
  /**
   * 识别支付凭证中的金额和时间
   */
  async recognizePaymentProof(
    imagePath: string,
    expectedAmount: number
  ): Promise<{
    ocrAmount: number | null
    ocrTimestamp: Date | null
    ocrConfidence: number
    ocrRawText: string
    isMatched: boolean
  }> {
    try {
      // ⚠️ 临时：使用模拟模式加快测试
      // TODO: 生产环境启用真实 OCR
      const USE_MOCK_OCR = process.env.MOCK_OCR === 'true' || process.env.NODE_ENV === 'development'

      if (USE_MOCK_OCR) {
        console.log('🔧 使用模拟 OCR（开发模式）')
        // 模拟 OCR 识别，直接返回期望金额
        return {
          ocrAmount: expectedAmount,
          ocrTimestamp: new Date(),
          ocrConfidence: 0.95,
          ocrRawText: `模拟OCR结果\n金额: ¥${expectedAmount}\n支付成功`,
          isMatched: true
        }
      }

      // 真实 OCR 识别
      console.log('🔍 开始 OCR 识别...')
      const worker = await Tesseract.createWorker('chi_sim+eng')

      // 设置参数
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789.¥:：-年月日时分秒支付宝微信'
      })

      const { data } = await worker.recognize(imagePath)
      await worker.terminate()

      const rawText = data.text
      const confidence = data.confidence / 100

      console.log('✅ OCR 识别完成，置信度:', confidence)

      // 提取金额
      const amountPatterns = [
        /¥\s*(\d+\.?\d*)/,
        /(\d+\.\d{2})\s*元/,
        /金额[：:]\s*(\d+\.?\d*)/,
        /(\d+\.\d{2})/
      ]

      let ocrAmount: number | null = null
      for (const pattern of amountPatterns) {
        const match = rawText.match(pattern)
        if (match) {
          ocrAmount = parseFloat(match[1])
          break
        }
      }

      // 提取时间
      const timePatterns = [
        /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/,
        /(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2})/
      ]

      let ocrTimestamp: Date | null = null
      for (const pattern of timePatterns) {
        const match = rawText.match(pattern)
        if (match) {
          ocrTimestamp = new Date(match[0])
          break
        }
      }

      // 金额匹配
      const tolerance = 0.01
      const isMatched =
        ocrAmount !== null &&
        Math.abs(ocrAmount - expectedAmount) <= tolerance

      return {
        ocrAmount,
        ocrTimestamp,
        ocrConfidence: confidence,
        ocrRawText: rawText,
        isMatched
      }
    } catch (error) {
      console.error('OCR recognition failed:', error)
      return {
        ocrAmount: null,
        ocrTimestamp: null,
        ocrConfidence: 0,
        ocrRawText: '',
        isMatched: false
      }
    }
  }
}
