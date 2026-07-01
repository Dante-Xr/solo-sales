/**
 * v1.7.2 自动化测试脚本 - API功能测试
 * 测试支付凭证相关API端点
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
}

const results: TestResult[] = [];

function logTest(name: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string) {
  results.push({ name, status, message });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${name}: ${message}`);
}

async function testDatabaseSetup() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test 1: 数据库设置验证');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1.1 检查 PaymentQRCode 表
    const qrCodes = await prisma.paymentQRCode.findMany();
    if (qrCodes.length === 0) {
      logTest('PaymentQRCode 数据', 'FAIL', '收款码数据为空，请运行种子脚本');
      return false;
    }
    logTest('PaymentQRCode 数据', 'PASS', `找到 ${qrCodes.length} 个收款码`);

    // 1.2 验证收款码字段
    const alipay = qrCodes.find(c => c.type === 'merchant_alipay');
    const wechat = qrCodes.find(c => c.type === 'personal_wechat');

    if (!alipay) {
      logTest('支付宝收款码', 'FAIL', '未找到支付宝收款码');
      return false;
    }
    logTest('支付宝收款码', 'PASS', `${alipay.name} - ${alipay.imageUrl}`);

    if (!wechat) {
      logTest('微信收款码', 'FAIL', '未找到微信收款码');
      return false;
    }
    logTest('微信收款码', 'PASS', `${wechat.name} - ${wechat.imageUrl}`);

    // 1.3 检查测试订单
    const testOrder = await prisma.order.findFirst({
      where: {
        user: { email: 'test@solosales.com' },
        status: 'PENDING'
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!testOrder) {
      logTest('测试订单', 'FAIL', '未找到测试订单，请运行创建脚本');
      return false;
    }
    logTest('测试订单', 'PASS', `订单ID: ${testOrder.id}, 金额: $${testOrder.totalAmount}`);

    return true;
  } catch (error) {
    logTest('数据库连接', 'FAIL', `错误: ${error}`);
    return false;
  }
}

async function testPaymentPages() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Test 2: 支付页面可访问性');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 2.1 获取测试订单
    const testOrder = await prisma.order.findFirst({
      where: {
        user: { email: 'test@solosales.com' },
        status: 'PENDING'
      }
    });

    if (!testOrder) {
      logTest('支付页面测试', 'SKIP', '没有可用的测试订单');
      return false;
    }

    // 2.2 测试支付页面
    const paymentUrl = `${BASE_URL}/zh/payment/qrcode/${testOrder.id}`;
    const response = await fetch(paymentUrl);

    if (response.status === 200) {
      logTest('支付页面访问', 'PASS', `${paymentUrl} - HTTP ${response.status}`);
    } else {
      logTest('支付页面访问', 'FAIL', `HTTP ${response.status}`);
      return false;
    }

    // 2.3 检查页面内容
    const html = await response.text();
    const hasQRCode = html.includes('qrcode') || html.includes('收款码') || html.includes('payment');

    if (hasQRCode) {
      logTest('页面内容验证', 'PASS', '页面包含支付相关内容');
    } else {
      logTest('页面内容验证', 'FAIL', '页面可能缺少收款码元素');
    }

    return true;
  } catch (error) {
    logTest('支付页面测试', 'FAIL', `错误: ${error}`);
    return false;
  }
}

async function testAdminPages() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💼 Test 3: 管理员页面可访问性');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 3.1 测试管理员审核页面
    const adminUrl = `${BASE_URL}/zh/admin/payment/proof`;
    const response = await fetch(adminUrl);

    logTest('管理员审核页面', response.status === 200 ? 'PASS' : 'FAIL',
      `${adminUrl} - HTTP ${response.status}`);

    return response.status === 200;
  } catch (error) {
    logTest('管理员页面测试', 'FAIL', `错误: ${error}`);
    return false;
  }
}

async function testFileStructure() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📁 Test 4: 文件结构验证');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const fs = await import('fs');
  const path = await import('path');

  const requiredFiles = [
    'src/server/services/ocr-service.ts',
    'src/server/services/image-hash-service.ts',
    'src/server/services/email-notification-service.ts',
    'src/app/api/payment/proof/route.ts',
    'public/qrcodes/alipay.png',
    'public/qrcodes/wechat.png',
  ];

  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    logTest(`文件: ${file}`, exists ? 'PASS' : 'FAIL',
      exists ? '存在' : '缺失');
  }

  return true;
}

async function printSummary() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 测试结果汇总');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;

  console.log(`总计: ${total} 项测试`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`⏭️  跳过: ${skipped}`);
  console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('⚠️  失败的测试：');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
    console.log();
  }
}

async function runTests() {
  console.log('🧪 v1.7.2 自动化测试开始\n');

  await testDatabaseSetup();
  await testPaymentPages();
  await testAdminPages();
  await testFileStructure();
  await printSummary();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 下一步手动测试：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const testOrder = await prisma.order.findFirst({
    where: {
      user: { email: 'test@solosales.com' },
      status: 'PENDING'
    }
  });

  if (testOrder) {
    console.log('1. 在浏览器打开支付页面：');
    console.log(`   ${BASE_URL}/zh/payment/qrcode/${testOrder.id}\n`);
    console.log('2. 验证页面显示：');
    console.log('   - 收款码图片');
    console.log('   - 订单金额');
    console.log('   - 上传按钮\n');
    console.log('3. 准备测试图片并测试上传功能\n');
  }

  await prisma.$disconnect();
}

runTests().catch(console.error);
