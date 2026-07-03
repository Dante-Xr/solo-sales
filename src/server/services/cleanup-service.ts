import cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'

export class CleanupService {
  /**
   * 启动定时清理任务
   */
  start() {
    // 每天凌晨2点执行
    cron.schedule('0 2 * * *', async () => {
      await this.cleanExpiredProofImages()
    })

    console.log('🕐 定时清理服务已启动（每天凌晨2点执行）')
  }

  /**
   * 清理过期的支付凭证图片
   */
  async cleanExpiredProofImages() {
    console.log('🧹 开始清理过期支付凭证...')

    const proofsToDelete = await prisma.paymentProof.findMany({
      where: {
        autoDeleteAt: { lte: new Date() },
        imageDeletedAt: null,
        status: { in: ['APPROVED', 'REJECTED'] } // 仅删除已审核的
      }
    })

    let successCount = 0
    let failCount = 0

    for (const proof of proofsToDelete) {
      try {
        // 1. 删除物理文件
        await fs.unlink(proof.proofImageUrl)

        // 2. 更新数据库记录
        await prisma.paymentProof.update({
          where: { id: proof.id },
          data: {
            proofImageUrl: '[已删除-隐私保护]',
            imageDeletedAt: new Date()
          }
        })

        successCount++
        console.log(`  ✅ 已删除凭证: ${proof.id}`)
      } catch (error: unknown) {
        failCount++
        console.error(`  ❌ 删除失败: ${proof.id}`, error)
      }
    }

    console.log(`✨ 清理完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  }
}
