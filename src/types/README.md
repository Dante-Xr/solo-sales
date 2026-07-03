# SoloSales 类型定义维护指南

本目录包含第三方库和核心模块的 TypeScript 类型定义文件。

---

## 📁 目录结构

```
src/types/
├── alipay-sdk.d.ts         # 支付宝 SDK 类型定义
├── wechatpay.d.ts          # 微信支付 SDK 类型定义
├── paypal.d.ts             # PayPal SDK 类型定义
├── errors.ts               # 错误处理工具和类型
├── __tests__/              # 类型定义测试
│   ├── alipay-sdk.test.ts
│   ├── wechatpay.test.ts
│   ├── paypal.test.ts
│   ├── provider.test.ts
│   └── errors.test.ts
└── README.md               # 本文档
```

---

## 🎯 类型定义来源

### 第三方库类型定义

#### Alipay SDK (`alipay-sdk.d.ts`)

- **对应包**: `alipay-sdk@3.x`
- **官方文档**: https://github.com/alipay/alipay-sdk-nodejs-all
- **维护说明**: 
  - 基于官方文档和实际 API 行为定义
  - 如需更新，参考官方 GitHub 仓库的最新 API
  - 主要接口: `AlipaySdk`, `AlipaySdkConfig`, `AlipayExecParams`

#### WeChat Pay SDK (`wechatpay.d.ts`)

- **对应包**: `wechatpay-axios-plugin@0.7.x`
- **官方文档**: https://github.com/wechatpay-apiv3/wechatpay-axios-plugin
- **维护说明**:
  - APIv3 接口定义
  - 主要接口: `Wechatpay`, `WechatpayConfig`, `NativePayRequest`
  - 包含 Webhook 通知和解密相关类型

#### PayPal SDK (`paypal.d.ts`)

- **对应包**: `@paypal/checkout-server-sdk@1.x`
- **官方文档**: https://developer.paypal.com/docs/api/orders/v2/
- **维护说明**:
  - REST API v2 接口定义
  - 主要接口: `PayPalOrderRequest`, `PayPalOrderResponse`, `PayPalLink`
  - 增强了原始包的类型安全性

---

## 🔧 类型定义更新流程

### 1. 检查 SDK 版本变更

当升级第三方 SDK 时，按以下步骤检查类型定义是否需要更新：

```bash
# 1. 查看包版本
npm list alipay-sdk
npm list wechatpay-axios-plugin
npm list @paypal/checkout-server-sdk

# 2. 检查官方文档是否有 breaking changes
# 3. 运行类型测试
npm test -- src/types/__tests__/
```

### 2. 更新类型定义

如果 SDK API 有变更：

1. **更新类型定义文件** (`.d.ts`)
   - 添加新增的接口/方法
   - 修改变更的字段类型
   - 标记废弃的接口（使用 `@deprecated` 注释）

2. **更新测试文件**
   - 确保新增接口有对应的测试用例
   - 验证类型约束正确

3. **更新使用代码**
   - 检查 `src/server/payments/providers/` 下的提供商代码
   - 根据新类型定义调整调用方式

4. **验证构建**
   ```bash
   npm run type-check
   npm run build
   ```

### 3. 文档同步

在本 README 中更新对应的版本号和变更说明。

---

## ✅ 类型测试

### 运行类型测试

```bash
# 运行所有类型测试
npm test -- src/types/__tests__/

# 运行特定测试
npm test -- src/types/__tests__/alipay-sdk.test.ts
```

### 测试覆盖范围

每个类型定义文件应包含以下测试：

- ✅ 接口字段完整性验证
- ✅ 必填字段约束验证
- ✅ 类型兼容性验证
- ✅ 实际使用场景模拟

---

## 🚨 常见问题

### Q1: 为什么要为第三方库定义类型？

**A**: 这些第三方 SDK 是 CommonJS 模块，没有内置的 TypeScript 类型定义。我们的类型定义：

- 提供编译时类型检查
- 改善 IDE 自动补全
- 防止运行时类型错误
- 作为 API 使用文档

### Q2: 如何处理类型定义与实际 SDK 行为不一致？

**A**: 如果发现类型定义与实际行为不符：

1. 验证 SDK 版本是否匹配
2. 查阅官方文档确认正确行为
3. 更新类型定义文件
4. 添加测试用例防止回归
5. 在代码注释中说明特殊情况

### Q3: `Record<string, unknown>` vs Prisma 类型

**A**: 使用指南：

- ✅ **使用 Prisma 类型**: 数据库查询条件、更新数据
  ```typescript
  const where: Prisma.ProductWhereInput = { status: 'ACTIVE' }
  ```

- ✅ **使用 `Record<string, unknown>`**: 动态 JSON 数据、日志、外部 API 响应
  ```typescript
  const metadata: Record<string, unknown> = { customField: value }
  ```

### Q4: 错误处理最佳实践

**A**: 使用 `src/types/errors.ts` 中的工具函数：

```typescript
import { getErrorMessage, isError } from '@/types/errors'

try {
  // ...
} catch (error: unknown) {
  if (isError(error)) {
    console.error(error.stack)
  }
  const message = getErrorMessage(error)
  // ...
}
```

---

## 📚 相关资源

- [TypeScript Handbook - Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [v1.7.6 类型安全修复规范](./.trae/specs/v1.7.6-type-safety/spec.md)

---

**最后更新**: 2026-07-03  
**维护者**: SoloSales 开发团队
