/**
 * 获取收款码列表 API
 * 公开端点 - 用于支付页面展示
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const qrcodes = await prisma.paymentQRCode.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({
      success: true,
      qrcodes: qrcodes.map(qr => ({
        id: qr.id,
        type: qr.type,
        name: qr.name,
        imageUrl: qr.imageUrl,
        accountName: qr.accountName,
        isTempSolution: qr.isTempSolution
      }))
    })
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load QR codes' },
      { status: 500 }
    )
  }
}
