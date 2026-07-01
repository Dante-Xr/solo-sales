/**
 * v1.7.2 测试脚本 - 创建测试订单
 * 用于测试个人收款码支付流程
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log('🧪 开始创建测试订单...\n');

    // 1. 获取一个测试产品
    const product = await prisma.product.findFirst({
      where: { isPublished: true },
    });

    if (!product) {
      console.error('❌ 没有找到可用的产品，请先创建产品');
      return;
    }

    console.log(`✅ 找到测试产品: ${product.name}`);

    // 2. 创建测试用户（如果不存在）
    let user = await prisma.user.findFirst({
      where: { email: 'test@solosales.com' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@solosales.com',
          name: '测试用户',
        },
      });
      console.log('✅ 创建测试用户成功');
    } else {
      console.log('✅ 使用现有测试用户');
    }

    // 3. 创建订单
    const orderAmount = Number(product.price);
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: orderAmount,
        status: 'PENDING',
        items: {
          create: [
            {
              productId: product.id,
              quantity: 1,
              price: product.price,
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log('\n✅ 测试订单创建成功！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`订单ID: ${order.id}`);
    console.log(`订单金额: $${orderAmount}`);
    console.log(`订单状态: ${order.status}`);
    console.log(`商品: ${order.items[0].product.name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 下一步测试：');
    console.log(`1. 访问支付页面: http://localhost:3001/zh/payment/qrcode/${order.id}`);
    console.log(`2. 上传支付凭证截图`);
    console.log(`3. 验证 OCR 识别结果`);
    console.log(`4. 测试管理员审核: http://localhost:3001/zh/admin/payment/proof\n`);

  } catch (error) {
    console.error('❌ 创建测试订单失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
