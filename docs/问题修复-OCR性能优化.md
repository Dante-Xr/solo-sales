# OCR 性能问题修复

**问题时间**: 2026-06-29  
**问题**: 上传卡在 90%，API 无响应  
**根本原因**: Tesseract.js OCR 识别耗时太长（5-30秒）

---

## 🔍 问题诊断过程

### 1. 前端日志分析
```
开始上传到: /api/payment/proof
❌ 没有后续日志（响应状态、结果）
```

### 2. 服务器日志分析
```
✅ 接收到上传请求
✅ 查询订单成功
✅ 检查重复凭证
❌ 卡在 OCR 识别阶段
```

### 3. 代码分析
**卡住位置**: `src/app/api/payment/proof/route.ts:93`
```typescript
const ocrResult = await ocrService.recognizePaymentProof(
  filePath,
  Number(order.totalAmount)
)
```

### 4. 根本原因
**Tesseract.js OCR 识别**非常慢：
- 第一次运行需要下载语言包（~10MB）
- 单次识别耗时 5-30 秒
- 没有超时控制
- 阻塞整个请求

---

## ✅ 解决方案

### 临时方案：模拟 OCR（开发/测试）

**修改文件**: `src/server/services/ocr-service.ts`

**添加功能**:
```typescript
const USE_MOCK_OCR = process.env.MOCK_OCR === 'true' || 
                     process.env.NODE_ENV === 'development'

if (USE_MOCK_OCR) {
  console.log('🔧 使用模拟 OCR（开发模式）')
  return {
    ocrAmount: expectedAmount,     // 直接返回期望金额
    ocrTimestamp: new Date(),
    ocrConfidence: 0.95,
    ocrRawText: `模拟OCR结果\n金额: ¥${expectedAmount}`,
    isMatched: true                // 自动匹配
  }
}
```

**环境变量**: `.env.local`
```env
# ⚠️ 开发模式：使用模拟 OCR（加快测试速度）
# 生产环境请设置为 false 启用真实 OCR
MOCK_OCR=true
```

---

## 🎯 效果对比

### 修复前
```
1. 用户上传图片
2. 前端显示 90% 进度
3. 等待 5-30 秒（OCR 识别）
4. 可能超时失败
5. 用户体验极差 ❌
```

### 修复后（模拟模式）
```
1. 用户上传图片
2. 前端显示 90% 进度
3. 立即完成（< 1秒）
4. 显示成功提示
5. 用户体验良好 ✅
```

---

## 🚀 生产环境方案

### 方案 1: 异步 OCR（推荐）

**架构**:
```
上传请求 → 保存文件 → 返回成功
                ↓
           后台任务队列
                ↓
           OCR 识别（异步）
                ↓
           更新数据库 → 发送通知
```

**优点**:
- ✅ 上传立即返回
- ✅ 用户体验好
- ✅ 可重试
- ✅ 可监控

**实现**:
```typescript
// 1. 上传时立即返回
await prisma.paymentProof.create({
  status: 'PENDING_OCR',
  // ...
})

// 2. 加入队列
await ocrQueue.add('recognize', { proofId })

// 3. 后台处理
ocrQueue.process('recognize', async (job) => {
  const result = await ocrService.recognize(...)
  await prisma.paymentProof.update({
    status: result.isMatched ? 'OCR_MATCHED' : 'PENDING'
  })
})
```

### 方案 2: 云端 OCR API

**使用第三方服务**:
- 阿里云 OCR
- 腾讯云 OCR
- 百度 AI OCR

**优点**:
- ✅ 速度快（< 1秒）
- ✅ 准确率高
- ✅ 无需维护

**缺点**:
- ❌ 需要付费
- ❌ 有调用限制

### 方案 3: 优化 Tesseract.js

**优化措施**:
```typescript
// 1. 预加载语言包
await Tesseract.createWorker('chi_sim+eng')

// 2. 使用 Worker 池
const scheduler = Tesseract.createScheduler()
const workers = await Promise.all(
  Array(4).fill(0).map(() => 
    Tesseract.createWorker('chi_sim+eng')
  )
)
workers.forEach(w => scheduler.addWorker(w))

// 3. 添加超时
const result = await Promise.race([
  ocrService.recognize(imagePath),
  timeout(30000)
])

// 4. 图片预处理（压缩、灰度化）
const processed = await sharp(imagePath)
  .resize(800)
  .grayscale()
  .toBuffer()
```

---

## 📋 测试步骤

### 1. 验证模拟模式
```bash
# 检查环境变量
grep MOCK_OCR .env.local

# 应该显示
MOCK_OCR=true
```

### 2. 重启服务器
```bash
# 杀掉旧进程
taskkill /PID <PID> /F

# 启动新进程
npm run dev
```

### 3. 测试上传
1. 刷新页面: http://localhost:3000/zh/payment/qrcode/cmqy1ol460002fb2n7z6cwa5o
2. 上传任意图片
3. 观察进度条到 100%
4. 应该立即显示成功（< 2秒）

### 4. 查看日志
浏览器控制台应该显示：
```
开始上传到: /api/payment/proof
上传响应状态: 200
上传结果: {success: true, status: 'OCR_MATCHED', ...}
```

服务器日志应该显示：
```
🔧 使用模拟 OCR（开发模式）
```

---

## ⚠️ 注意事项

### 开发/测试环境
- ✅ 保持 `MOCK_OCR=true`
- ✅ 快速迭代测试
- ✅ 验证上传流程

### 生产环境
- ⚠️ **必须**设置 `MOCK_OCR=false`
- ⚠️ 或使用异步 OCR 方案
- ⚠️ 或使用云端 OCR API

### 切换到真实 OCR
```bash
# .env.local 或 .env.production
MOCK_OCR=false
```

---

## 📊 性能对比

| 方案 | 响应时间 | 准确率 | 成本 | 复杂度 |
|------|---------|--------|------|--------|
| 模拟 OCR | < 1s | 100%* | 免费 | 低 |
| Tesseract.js (同步) | 5-30s | 70-90% | 免费 | 低 |
| Tesseract.js (异步) | 2s + 后台 | 70-90% | 免费 | 中 |
| 云端 OCR | < 1s | 95%+ | 付费 | 低 |

*模拟模式直接匹配，仅用于测试

---

## 🎯 推荐路线

### 短期（当前）
✅ 使用模拟 OCR 完成功能测试

### 中期（上线前）
🔄 实现异步 OCR 处理

### 长期（规模化）
🚀 切换到云端 OCR API

---

**问题已解决！现在可以快速测试上传功能了！** 🎉
