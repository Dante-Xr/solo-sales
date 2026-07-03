import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailNotificationService } from '@/server/services/email-notification-service'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession()
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { action, rejectReason } = await req.json()

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !rejectReason) {
      return NextResponse.json(
        { error: 'Reject reason is required' },
        { status: 400 }
      )
    }

    const { id: proofId } = await params

    // Get proof with order and user
    const proof = await prisma.paymentProof.findUnique({
      where: { id: proofId },
      include: {
        order: {
          include: {
            user: true
          }
        }
      }
    })

    if (!proof) {
      return NextResponse.json({ error: 'Proof not found' }, { status: 404 })
    }

    // Check if already reviewed
    if (['APPROVED', 'REJECTED'].includes(proof.status)) {
      return NextResponse.json(
        { error: 'Proof already reviewed' },
        { status: 422 }
      )
    }

    const emailService = new EmailNotificationService()

    if (action === 'approve') {
      // Update proof status
      await prisma.paymentProof.update({
        where: { id: proofId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date()
          // TODO: Add reviewedBy when auth is ready
        }
      })

      // TODO: Update order status to PAID using OrderStateMachine
      // await orderStateMachine.handlePaymentSuccess(proof.order)

      // Set auto-delete date
      const autoDeleteAt = new Date()
      autoDeleteAt.setDate(autoDeleteAt.getDate() + 30)
      await prisma.paymentProof.update({
        where: { id: proofId },
        data: { autoDeleteAt }
      })

      // Send approval email
      await emailService.sendPaymentApprovedEmail(proof.order, proof.order.user)

      return NextResponse.json({
        success: true,
        message: '审核完成，订单已更新为PAID',
        order: {
          id: proof.order.id,
          status: 'PAID' // TODO: Update from actual order
        }
      })
    } else {
      // Reject
      await prisma.paymentProof.update({
        where: { id: proofId },
        data: {
          status: 'REJECTED',
          rejectReason,
          reviewedAt: new Date()
        }
      })

      // Send rejection email
      await emailService.sendPaymentRejectedEmail(
        proof.order,
        proof.order.user,
        rejectReason
      )

      return NextResponse.json({
        success: true,
        message: '已拒绝凭证，用户将收到邮件通知'
      })
    }
  } catch (error) {
    console.error('Review proof error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
