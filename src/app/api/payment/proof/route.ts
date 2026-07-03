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
        {
          error: '缺少必需参数',
          errorCode: 'MISSING_FIELDS',
          message: '请确保已选择支付方式并上传了图片'
        },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(proofImage.type)) {
      return NextResponse.json(
        {
          error: '图片格式不支持',
          errorCode: 'INVALID_FILE_TYPE',
          message: '仅支持 JPG、PNG、WEBP 格式的图片，请重新选择'
        },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (proofImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: '图片文件过大',
          errorCode: 'FILE_TOO_LARGE',
          message: `图片大小不能超过 5MB，当前文件大小：${(proofImage.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 413 }
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (!order) {
      return NextResponse.json({
        error: '订单不存在',
        errorCode: 'ORDER_NOT_FOUND',
        message: '找不到该订单，请确认订单号是否正确'
      }, { status: 404 })
    }

    // Check if proof already exists
    const existingProof = await prisma.paymentProof.findFirst({
      where: { orderId }
    })

    if (existingProof) {
      return NextResponse.json(
        {
          error: '凭证已上传',
          errorCode: 'PROOF_ALREADY_EXISTS',
          message: '该订单已上传过支付凭证，无需重复上传。如有问题请联系客服。'
        },
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
        {
          error: '图片重复使用',
          errorCode: 'DUPLICATE_IMAGE',
          message: '该图片已被使用过，请上传新的支付凭证。每张凭证只能使用一次。'
        },
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
      // Send email notification (non-blocking)
      try {
        const emailService = new EmailNotificationService()
        await emailService.sendAutoApprovedEmail(order, order.user)
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('邮件发送失败（非致命错误）:', emailError)
      }

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
  } catch (error: unknown) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json(
      {
        error: '服务器错误',
        errorCode: 'INTERNAL_ERROR',
        message: '服务器处理出错，请稍后重试。如问题持续存在，请联系客服。'
      },
      { status: 500 }
    )
  }
}
