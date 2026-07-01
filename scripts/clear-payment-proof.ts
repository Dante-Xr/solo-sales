import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orderId = 'cmqy1ol460002fb2n7z6cwa5o'

  const deleted = await prisma.paymentProof.deleteMany({
    where: { orderId }
  })

  console.log(`✅ 已删除 ${deleted.count} 条支付凭证记录`)
  console.log(`订单 ${orderId} 现在可以重新测试上传了`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
