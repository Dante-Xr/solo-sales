import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession()
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const proofs = await prisma.paymentProof.findMany({
      where: {
        status: {
          in: ['PENDING', 'OCR_MISMATCHED']
        }
      },
      include: {
        order: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const formattedProofs = proofs.map((proof) => ({
      id: proof.id,
      orderId: proof.orderId,
      amount: proof.amount,
      proofImageUrl: proof.proofImageUrl, // TODO: Sign URL with JWT
      paymentMethod: proof.paymentMethod,
      status: proof.status,
      ocrAmount: proof.ocrAmount,
      ocrConfidence: proof.ocrConfidence,
      ocrTimestamp: proof.ocrTimestamp,
      isOcrMatched: proof.ocrAmount !== null && Math.abs(Number(proof.ocrAmount) - Number(proof.amount)) <= 0.01,
      createdAt: proof.createdAt,
      order: {
        id: proof.order.id,
        totalAmount: proof.order.totalAmount,
        user: {
          name: proof.order.user.name,
          email: proof.order.user.email
        }
      }
    }))

    return NextResponse.json({
      proofs: formattedProofs,
      count: formattedProofs.length,
      notice: '⚠️ 当前为人工审核模式，建议尽快升级为自动化支付'
    })
  } catch (error) {
    console.error('Get pending proofs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
