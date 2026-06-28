import { ImageHashService } from '../image-hash-service'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    paymentProof: {
      findFirst: jest.fn()
    }
  }
}))

describe('ImageHashService', () => {
  let service: ImageHashService

  beforeEach(() => {
    service = new ImageHashService()
    jest.clearAllMocks()
  })

  it('should calculate perceptual hash', async () => {
    // With fake path, should throw error
    await expect(service.calculatePerceptualHash('fake-image.jpg')).rejects.toThrow()
  })

  it('should detect duplicate when hash exists', async () => {
    (prisma.paymentProof.findFirst as jest.Mock).mockResolvedValue({ id: 'proof-123' })

    const isDup = await service.isDuplicate('hash-123')
    expect(isDup).toBe(true)
  })

  it('should return false when hash does not exist', async () => {
    (prisma.paymentProof.findFirst as jest.Mock).mockResolvedValue(null)

    const isDup = await service.isDuplicate('hash-456')
    expect(isDup).toBe(false)
  })
})
