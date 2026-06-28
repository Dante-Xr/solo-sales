import { OCRService } from '../ocr-service'
import path from 'path'

describe('OCRService', () => {
  let ocrService: OCRService

  beforeEach(() => {
    ocrService = new OCRService()
  })

  // Skip this test - requires real image fixture and Tesseract language download
  it.skip('should recognize amount from payment screenshot', async () => {
    // Create test fixture directory if needed
    const fixturePath = path.join(__dirname, '__fixtures__', 'payment-100.50.txt')

    // Mock for now - will use real image later
    const result = await ocrService.recognizePaymentProof(fixturePath, 100.50)

    expect(result.ocrAmount).toBeGreaterThanOrEqual(0)
    expect(result.ocrConfidence).toBeGreaterThanOrEqual(0)
    expect(result.ocrRawText).toBeDefined()
    expect(typeof result.isMatched).toBe('boolean')
  })

  it('should detect amount mismatch', async () => {
    const result = await ocrService.recognizePaymentProof('fake-path', 100.50)

    // With fake path, should handle gracefully
    expect(result).toBeDefined()
    expect(result.ocrAmount).toBeNull()
    expect(result.isMatched).toBe(false)
  })
})
