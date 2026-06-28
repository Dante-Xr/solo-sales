import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OCRService } from '@/server/services/ocr-service'
import { ImageHashService } from '@/server/services/image-hash-service'
import { EmailNotificationService } from '@/server/services/email-notification-service'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const orderId = formData.get('orderId') as string
    const proofImage = formData.get('proofImage') as File
    const paymentMethod = formData.get('paymentMethod') as string

    // Validation
    if (!orderId || !proofImage || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(proofImage.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WEBP allowed' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (proofImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 5MB' },
        { status: 413 }
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if proof already exists
    const existingProof = await prisma.paymentProof.findFirst({
      where: { orderId }
    })

    if (existingProof) {
      return NextResponse.json(
        { error: 'Proof already uploaded for this order' },
        { status: 422 }
      )
    }

    // Save file
    const uploadDir = path.join(process.cwd(), 'uploads', 'payment-proofs', order.userId, orderId)
    await fs.mkdir(uploadDir, { recursive: true })

    const fileExt = proofImage.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = path.join(uploadDir, fileName)

    const buffer = await proofImage.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(buffer))

    // Calculate image hash
    const imageHashService = new ImageHashService()
    const imageHash = await imageHashService.calculatePerceptualHash(filePath)

    // Check for duplicate
    const duplicateProof = await prisma.paymentProof.findFirst({
      where: { imageHash }
    })

    if (duplicateProof) {
      await fs.unlink(filePath) // Clean up
      return NextResponse.json(
        { error: '此凭证已使用（重复检测）' },
        { status: 409 }
      )
    }

    // OCR recognition
    const ocrService = new OCRService()
    const ocrResult = await ocrService.recognizePaymentProof(
      filePath,
      Number(order.totalAmount)
    )

    // Determine status
    let status: 'OCR_MATCHED' | 'OCR_MISMATCHED' | 'PENDING' = 'PENDING'
    if (ocrResult.ocrAmount !== null) {
      status = ocrResult.isMatched ? 'OCR_MATCHED' : 'OCR_MISMATCHED'
    }

    // Set auto-delete date (30 days from now)
    const autoDeleteAt = new Date()
    autoDeleteAt.setDate(autoDeleteAt.getDate() + 30)

    // Create proof record
    const proof = await prisma.paymentProof.create({
      data: {
        orderId,
        proofImageUrl: filePath,
        amount: order.totalAmount,
        paymentMethod,
        status,
        ocrAmount: ocrResult.ocrAmount,
        ocrTimestamp: ocrResult.ocrTimestamp,
        ocrConfidence: ocrResult.ocrConfidence,
        ocrRawText: ocrResult.ocrRawText,
        imageHash,
        autoDeleteAt
      }
    })

    // If OCR matched, auto-approve
    if (status === 'OCR_MATCHED') {
      // TODO: Update order status to PAID (requires OrderStateMachine integration)
      // For now, just send email
      const emailService = new EmailNotificationService()
      await emailService.sendAutoApprovedEmail(order, order.user)

      return NextResponse.json({
        success: true,
        proofId: proof.id,
        status: 'OCR_MATCHED',
        message: '✅ 支付金额匹配，订单已确认'
      })
    }

    // Otherwise, needs manual review
    return NextResponse.json({
      success: true,
      proofId: proof.id,
      status,
      message: '⏳ 等待人工审核（预计1-2小时）'
    })
  } catch (error) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
