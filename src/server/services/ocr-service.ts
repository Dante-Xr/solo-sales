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
      // OCR识别
      const { data } = await Tesseract.recognize(
        imagePath,
        'chi_sim+eng',
        {
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
          tessedit_char_whitelist: '0123456789.¥:：-年月日时分秒支付宝微信'
        }
      )

      const rawText = data.text
      const confidence = data.confidence / 100

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
