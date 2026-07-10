import { EmailNotificationService } from '../email-notification-service'

// Mock nodemailer
const mockSendMail = jest.fn()
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail
  }))
}))

describe('EmailNotificationService', () => {
  let service: EmailNotificationService
  type PaymentApprovedArgs = Parameters<EmailNotificationService['sendPaymentApprovedEmail']>
  type PaymentRejectedArgs = Parameters<EmailNotificationService['sendPaymentRejectedEmail']>
  type AutoApprovedArgs = Parameters<EmailNotificationService['sendAutoApprovedEmail']>

  beforeEach(() => {
    service = new EmailNotificationService()
    mockSendMail.mockClear()
  })

  it('should send payment approved email', async () => {
    const order = { id: 'order-123', totalAmount: 100.50 }
    const user = { email: 'user@example.com', name: 'Test User' }

    await service.sendPaymentApprovedEmail(order as unknown as PaymentApprovedArgs[0], user as PaymentApprovedArgs[1])

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('支付审核通过')
      })
    )
  })

  it('should send payment rejected email', async () => {
    const order = { id: 'order-123', totalAmount: 100.50 }
    const user = { email: 'user@example.com', name: 'Test User' }

    await service.sendPaymentRejectedEmail(order as unknown as PaymentRejectedArgs[0], user as PaymentRejectedArgs[1], '金额不符')

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('未通过')
      })
    )
  })

  it('should send auto approved email', async () => {
    const order = { id: 'order-123', totalAmount: 100.50 }
    const user = { email: 'user@example.com', name: 'Test User' }

    await service.sendAutoApprovedEmail(order as unknown as AutoApprovedArgs[0], user as AutoApprovedArgs[1])

    expect(mockSendMail).toHaveBeenCalledTimes(1)
  })
})
