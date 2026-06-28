# SoloSales v1.7.2 个人收款码支付方案 设计文档

**规划时间**: 2026-06-28 15:00:00 北京时间  
**规划者**: AI assistant  
**版本**: v1.7.0 → v1.7.2  
**方案性质**: ⚠️ 临时过渡方案（非自动化）

---

## ⚠️ 重要声明

**本方案为临时过渡性解决方案**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  临时过渡方案 - 非自动化
━━━━━━━━━━━━━━━━━━━━━━━━━━
用途：快速上线，支持早期业务验证
性质：人工审核为主，适合小规模（<50单/天）
期限：过渡方案，待商户资质申请完成后升级
后续：v1.8.0 将升级为官方API自动化方案
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**为什么是临时方案？**
- 个人/商家收款码无API接口，无法自动确认支付
- 需要用户上传支付凭证，管理员人工审核
- 适合日订单量 < 50 的早期阶段
- 待支付宝/微信商户资质申请完成后，升级为v1.8.0自动化方案

---

## 执行总结

基于用户需求和技术限制分析，v1.7.2将实现：

**核心功能**：
1. PC端弹窗显示收款码，移动端全屏显示
2. 用户扫码支付后上传支付凭证截图
3. **OCR自动识别金额**（减少70-80%人工审核）
4. 管理员后台审核凭证，确认后订单状态更新
5. 邮件通知用户审核结果
6. 30天后自动删除凭证图片（隐私保护）

**技术栈**：
- OCR识别：Tesseract.js（开源免费）
- 图片哈希：image-hash + sharp（重复检测）
- 邮件发送：Nodemailer
- 定时任务：node-cron

**预计工作量**: 12-16小时  
**关键风险**: OCR识别准确率

---

## 版本规划

### v1.7.2（本版本）- 基础 + 高优先级改进
- ✅ 收款码展示（PC/移动端）
- ✅ 支付凭证上传
- ✅ **OCR自动识别**（高优先级）
- ✅ **重复凭证检测**（高优先级）
- ✅ **邮件通知**（高优先级）
- ✅ **自动删除图片**（高优先级）
- ✅ 人工审核后台

### v1.7.3 - 运维与UX优化
- 运维监控（审核队列告警）
- UX优化（预计审核时间）
- 存储优化（图片压缩CDN）

### v1.7.4 - 数据分析
- 支付数据看板
- 审核效率统计

### v1.7.5 - 移动端优化
- 移动端直接调用相机
- 更好的移动体验

### v1.8.0 - 自动化升级
- 支付宝/微信官方API集成
- 完全自动化支付
- 废弃人工审核流程

---

## 1. 当前状态分析

### 1.1 已有基础（✅ 可复用）

**支付基础设施**（v1.7.0已完成）：
- ✅ PaymentProvider抽象层
- ✅ PaymentProviderFactory
- ✅ OrderStateMachine（订单状态机）
- ✅ Webhook幂等性机制
- ✅ Payment数据模型

**收款码**（用户已准备）：
- ✅ 支付宝商家收钱码图片（/public/qrcodes/alipay.png）
- ✅ 微信个人收款码图片（/public/qrcodes/wechat.png）

**认证与安全**：
- ✅ 用户认证系统（better-auth）
- ✅ RBAC权限控制
- ✅ CSRF保护
- ✅ 速率限制

### 1.2 需要新增（🆕 v1.7.2实现）

**数据模型**：
- 🆕 PaymentQRCode（收款码配置）
- 🆕 PaymentProof（支付凭证）
- 🆕 ProofStatus枚举

**API层**：
- 🆕 GET /api/payment/qrcode
- 🆕 POST /api/payment/proof
- 🆕 GET /api/admin/payment/proof/pending
- 🆕 POST /api/admin/payment/proof/:id/review

**服务层**：
- 🆕 OCR识别服务（Tesseract.js）
- 🆕 图片哈希服务（重复检测）
- 🆕 邮件通知服务（Nodemailer）
- 🆕 定时清理服务（node-cron）

**前端页面**：
- 🆕 收款码展示页（PC/移动端响应式）
- 🆕 凭证上传组件
- 🆕 管理员审核页面

---

## 2. 数据库设计

### 2.1 新增模型


```prisma
// ⚠️ v1.7.2 临时方案 - 个人收款码配置
model PaymentQRCode {
  id          String   @id @default(cuid())
  name        String   // "支付宝商家收钱码" | "微信个人收款码"
  type        String   // "merchant_alipay" | "personal_wechat"
  imageUrl    String   // 固定收款码图片路径
  accountName String   // 收款人姓名
  accountInfo String?  // 账号信息（可选）
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  
  // 临时方案标记
  isTempSolution Boolean @default(true) // ⚠️ 标记为临时方案
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([isActive, sortOrder])
}

// ⚠️ v1.7.2 临时方案 - 支付凭证（人工审核）
model PaymentProof {
  id            String      @id @default(cuid())
  orderId       String      @unique
  order         Order       @relation(fields: [orderId], references: [id])
  proofImageUrl String      // 用户上传的支付截图
  amount        Decimal     @db.Decimal(10, 2)
  paymentMethod String      // 支付方式
  status        ProofStatus @default(PENDING)
  
  // 🆕 高优先级改进：OCR识别
  ocrAmount     Decimal?    @db.Decimal(10, 2) // OCR识别的金额
  ocrTimestamp  DateTime?   // OCR识别的支付时间
  ocrConfidence Float?      // 识别置信度 (0-1)
  ocrRawText    String?     // OCR原始文本（调试用）
  
  // 🆕 高优先级改进：重复检测
  imageHash     String      // 图片哈希值，用于检测重复
  
  // 人工审核字段
  reviewedBy    String?     // 审核人ID
  reviewedAt    DateTime?   // 审核时间
  rejectReason  String?     // 拒绝原因
  
  // 🆕 高优先级改进：自动删除（隐私保护）
  imageDeletedAt DateTime?   // 图片删除时间
  autoDeleteAt   DateTime    // 计划删除时间（审核后30天）
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@index([status, createdAt])
  @@index([imageHash])        // 🆕 用于重复检测
}

enum ProofStatus {
  PENDING         // 待审核
  OCR_PROCESSING  // 🆕 OCR识别中
  OCR_MATCHED     // 🆕 OCR金额匹配，自动通过
  OCR_MISMATCHED  // 🆕 OCR金额不匹配，需人工审核
  APPROVED        // 人工审核通过
  REJECTED        // 人工审核拒绝
}

// Order模型扩展
model Order {
  // ... 现有字段
  paymentProof PaymentProof? // v1.7.2 支付凭证关系
}
```

### 2.2 迁移脚本

```bash
# 创建迁移
npx prisma migrate dev --name add_personal_qrcode_payment

# 运行种子数据
npx ts-node prisma/seed-qrcode.ts
```

---

## 3. API设计

### 3.1 获取收款码

```typescript
GET /api/payment/qrcode?amount=100.50

// 请求头
Authorization: Bearer {token}

// 响应
{
  qrcode: {
    id: "qr-123",
    type: "merchant_alipay",
    imageUrl: "/api/payment/qrcode/image?token=signed_jwt",
    accountName: "商家名称",
    amount: 100.50,
    
    // ⚠️ 临时方案标记
    isTempSolution: true,
    notice: "当前使用人工审核方案，支付后需上传凭证"
  }
}

// 安全措施
- ✅ 用户认证（必须登录）
- ✅ 图片URL签名（JWT token，15分钟有效）
- ✅ 速率限制（10次/分钟）
```

### 3.2 上传支付凭证

```typescript
POST /api/payment/proof
Content-Type: multipart/form-data

// 请求体
{
  orderId: string,
  proofImage: File,
  paymentMethod: "merchant_alipay_qrcode" | "personal_wechat_qrcode"
}

// 处理流程
1. ✅ 认证：验证用户登录
2. ✅ 授权：验证订单属于该用户
3. ✅ 文件验证：类型（jpg/png/webp）、大小（<5MB）
4. ✅ 内容安全：扫描恶意代码
5. 🆕 图片哈希：计算SHA-256
6. 🆕 重复检测：查询imageHash是否存在
7. ✅ 安全存储：uploads/payment-proofs/{userId}/{orderId}/{randomHash}.jpg
8. 🆕 OCR识别：Tesseract.js识别金额和时间
9. 🆕 自动匹配：OCR金额 vs 订单金额（误差±0.01元）
10. 🆕 自动审核：匹配成功 → 订单PAID
11. 🆕 邮件通知：发送审核结果

// 响应
{
  success: true,
  proofId: "proof-123",
  status: "OCR_MATCHED" | "OCR_MISMATCHED" | "PENDING",
  message: "✅ 支付金额匹配，订单已确认" 
           // 或 "⏳ 等待人工审核（预计1-2小时）"
}

// 错误处理
- 400: 文件类型不支持
- 413: 文件过大（>5MB）
- 409: 此凭证已使用（重复检测）
- 422: 订单状态不允许上传凭证
```

### 3.3 获取待审核列表（管理员）

```typescript
GET /api/admin/payment/proof/pending

// 请求头
Authorization: Bearer {admin_token}

// 响应
{
  proofs: [
    {
      id: "proof-123",
      orderId: "order-456",
      amount: 100.50,
      proofImageUrl: "/api/admin/payment/proof/proof-123/image?token=xxx",
      
      // OCR识别结果
      ocrAmount: 100.50,
      ocrConfidence: 0.92,
      ocrTimestamp: "2026-06-28T12:00:00Z",
      
      // 自动匹配结果
      isOcrMatched: true,  // OCR金额与订单金额匹配
      
      createdAt: "2026-06-28T12:00:00Z",
      
      // ⚠️ 临时方案提示
      requiresManualReview: true
    }
  ],
  count: 15,
  
  // 业务提示
  notice: "⚠️ 当前为人工审核模式，建议尽快升级为自动化支付"
}

// 安全措施
- ✅ 管理员角色验证
- ✅ 图片URL签名（30分钟有效）
- ✅ 操作日志记录
```

### 3.4 审核凭证（管理员）

```typescript
POST /api/admin/payment/proof/:id/review

// 请求头
Authorization: Bearer {admin_token}

// 请求体
{
  action: "approve" | "reject",
  rejectReason?: string  // action=reject时必填
}

// 处理流程（action=approve）
1. ✅ 验证管理员权限
2. ✅ 验证凭证状态（不能重复审核）
3. ✅ 更新PaymentProof状态为APPROVED
4. ✅ 调用OrderStateMachine.handlePaymentSuccess()
   - 订单状态 → PAID
   - 扣减库存
   - 创建Payment记录
5. 🆕 设置autoDeleteAt（30天后）
6. 🆕 发送邮件通知用户
7. ✅ 记录审计日志

// 响应
{
  success: true,
  message: "审核完成，订单已更新为PAID",
  order: {
    id: "order-456",
    status: "PAID"
  }
}

// 安全措施
- ✅ 二次认证（敏感操作）
- ✅ 审计日志（记录操作人、时间、IP）
- ✅ 防止CSRF
- ✅ 幂等性保护（不能重复审核）
```

---

## 4. 核心服务设计

### 4.1 OCR识别服务


| 指标 | 目标 | 说明 |
|------|------|------|
| OCR识别准确率 | >85% | 能正确识别金额 |
| OCR自动通过率 | >70% | 减少人工审核 |
| 平均审核时间 | <2小时 | 人工审核响应时间 |
| 支付凭证重复率 | <1% | 重复提交检测有效性 |
| 图片上传成功率 | >99% | 文件上传稳定性 |

### 10.2 告警设置（v1.7.3）

- 审核队列积压 >20单
- OCR识别失败率 >30%
- 邮件发送失败率 >5%
- 存储空间使用 >80%

---

## 11. 升级路径

### 从v1.7.2到v1.8.0

**准备工作**：
1. 申请支付宝"当面付"产品
2. 申请微信"Native支付"商户号
3. 配置API密钥

**升级步骤**：
1. 保留v1.7.2的收款码作为备用
2. 集成支付宝/微信官方API
3. 灰度切换（10% → 50% → 100%）
4. 废弃人工审核流程
5. 清理PaymentProof表历史数据

---

## 12. 成本估算

### 12.1 开发成本

| 阶段 | 工作量 | 说明 |
|------|--------|------|
| 数据库设计 | 1小时 | Prisma schema |
| API开发 | 4小时 | 4个API端点 |
| 服务层开发 | 4小时 | OCR/邮件/清理 |
| 前端开发 | 3小时 | 2个页面 |
| 测试验证 | 2小时 | 单元+集成测试 |
| **总计** | **14小时** | |

### 12.2 运营成本

| 项目 | 成本 | 说明 |
|------|------|------|
| OCR识别 | ¥0 | Tesseract.js开源免费 |
| 邮件发送 | ~¥50/月 | SMTP服务或SendGrid |
| 存储空间 | ~¥20/月 | 图片存储（100GB） |
| 人工审核 | ~2小时/天 | 按订单量 |
| **总计** | **~¥70/月** | + 人工时间 |

---

## 13. 风险与限制

### 13.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| OCR识别不准确 | 需人工审核 | 优化识别参数，收集样本改进 |
| 用户伪造截图 | 欺诈风险 | 人工审核+OCR双重验证 |
| 图片存储增长快 | 成本上升 | 30天自动删除+压缩 |
| 邮件发送失败 | 用户体验差 | 重试机制+备用通知渠道 |

### 13.2 业务限制

- ⚠️ **非自动化**：需要人工审核，不适合大规模
- ⚠️ **处理时效**：1-2小时审核时间，无法实时确认
- ⚠️ **人力依赖**：管理员需定期查看审核队列
- ⚠️ **扩展性差**：订单量>50单/天时效率低

---

## 14. 总结

### 14.1 方案定位

v1.7.2是一个**务实的过渡方案**：
- ✅ 快速上线（14小时开发）
- ✅ 零第三方成本（OCR免费）
- ✅ 适合早期验证（<50单/天）
- ✅ 为v1.8.0自动化铺路

### 14.2 关键创新

1. **OCR自动识别**：减少70-80%人工审核
2. **图片哈希检测**：防止重复凭证欺诈
3. **邮件自动通知**：提升用户体验
4. **隐私保护**：30天自动删除

### 14.3 后续演进

```
v1.7.2（当前）
  ↓ 申请商户资质（1-2周）
v1.8.0（自动化）
  ↓ 业务增长
v2.0.0（企业支付）
```

---

## 附录

### A. 参考资料

- Tesseract.js文档：https://tesseract.projectnaptha.com/
- Nodemailer文档：https://nodemailer.com/
- 支付宝开放平台：https://open.alipay.com/
- 微信支付文档：https://pay.weixin.qq.com/

### B. 相关文档

- [v1.7.0 最终交付报告](./.trae/documents/implements/2026-06-28_v1.7_最终交付报告.md)
- [v1.7.0 实施计划](./.trae/documents/implements/2026-06-27_v1.7_多支付交易主链路闭环_实施计划.md)
- [v1.7.2 进度跟踪](./.trae/documents/v1.7.2_Progress.md)

### C. 快速开始

```bash
# 1. 安装依赖
npm install tesseract.js image-hash nodemailer node-cron

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加SMTP配置

# 3. 数据库迁移
npx prisma migrate dev --name add_personal_qrcode_payment

# 4. 上传收款码
# 将收款码图片放到 public/qrcodes/

# 5. 运行种子数据
npx ts-node prisma/seed-qrcode.ts

# 6. 启动开发服务器
npm run dev

# 7. 测试支付流程
# 访问 http://localhost:3000/payment/qrcode/{orderId}
```

---

**文档状态**: ✅ 完成  
**审核状态**: 待用户确认  
**下一步**: 编写实施计划（writing-plans）

**规划者**: AI assistant  
**规划时间**: 2026-06-28 15:00:00 +08:00
