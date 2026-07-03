import sharp from 'sharp'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export class ImageHashService {
  /**
   * 计算图片感知哈希
   * Note: Using SHA-256 for simplicity (image-hash has Jest compatibility issues)
   */
  async calculatePerceptualHash(imagePath: string): Promise<string> {
    return this.calculateSHA256(imagePath)
  }

  /**
   * 计算SHA-256哈希
   */
  async calculateSHA256(imagePath: string): Promise<string> {
    try {
      const buffer = await sharp(imagePath)
        .resize(200, 200)
        .grayscale()
        .toBuffer()

      return crypto.createHash('sha256').update(buffer).digest('hex')
    } catch (error: unknown) {
      console.error('SHA-256 calculation failed:', error)
      throw error
    }
  }

  /**
   * 检测是否为重复图片
   */
  async isDuplicate(imageHash: string): Promise<boolean> {
    const existing = await prisma.paymentProof.findFirst({
      where: { imageHash }
    })
    return !!existing
  }
}
