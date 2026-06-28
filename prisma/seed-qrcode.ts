import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedQRCodes() {
  console.log('🌱 Seeding payment QR codes...')

  await prisma.paymentQRCode.upsert({
    where: { id: 'qrcode-alipay-merchant' },
    update: {},
    create: {
      id: 'qrcode-alipay-merchant',
      name: '支付宝商家收钱码',
      type: 'merchant_alipay',
      imageUrl: '/qrcodes/alipay.png',
      accountName: '商家账户',
      accountInfo: '支付宝商家',
      isActive: true,
      sortOrder: 1
    }
  })

  await prisma.paymentQRCode.upsert({
    where: { id: 'qrcode-wechat-personal' },
    update: {},
    create: {
      id: 'qrcode-wechat-personal',
      name: '微信个人收款码',
      type: 'personal_wechat',
      imageUrl: '/qrcodes/wechat.png',
      accountName: '个人账户',
      accountInfo: '微信收款',
      isActive: true,
      sortOrder: 2
    }
  })

  console.log('✅ QR codes seeded')
}

seedQRCodes()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
