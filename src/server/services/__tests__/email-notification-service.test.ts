import { EmailNotificationService } from '../email-notification-service'

type EmailOrder = Parameters<EmailNotificationService['sendPaymentApprovedEmail']>[0]
type EmailUser = Parameters<EmailNotificationService['sendPaymentApprovedEmail']>[1]

// Mock nodemailer
const mockSendMail = jest.fn()
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail
  }))
}))

describe('EmailNotificationService', () => {
  let service: EmailNotificationService

  beforeEach(() => {
    service = new EmailNotificationService()
    mockSendMail.mockClear()
  })

  it('should send payment approved email', async () => {
    const order = { id: 'order-123', totalAmount: 100.50 } as unknown as EmailOrder
    const user = { email: 'user@example.com', name: 'Test User' } as unknown as EmailUser

    await service.sendPaymentApprovedEmail(order, user)

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('支付审核通过')
      })
    )
  })

  it('should send payment rejected email', async () => {
    const order = { id: 'order-123', totalAmount: 100.50 } as unknown as EmailOrder
    const user = { email: 'user@example.com', name: 'Test User' } as unknown as EmailUser

    await service.sendPaymentRejectedEmail(order, user, '金额不符')

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('未通过')
      })
    )
  })

  it('should send auto approved email', async () => {
    const order = { id: 'order-123', totalAmount: 100.50 } as unknown as EmailOrder
    const user = { email: 'user@example.com', name: 'Test User' } as unknown as EmailUser

    await service.sendAutoApprovedEmail(order, user)

    expect(mockSendMail).toHaveBeenCalledTimes(1)
  })
})
