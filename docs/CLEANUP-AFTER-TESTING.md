# ⚠️ 测试完成后清理清单

**重要**: 本文件列出了为测试方便而创建的临时文件，**上线前必须删除**！

---

## 🗑️ 必须删除的文件

### 1. 临时订单 API（无认证）
```bash
rm src/app/api/payment/orders/[id]/route.ts
```

**原因**: 此 API 允许无需登录即可查看订单信息，存在安全风险。

**文件路径**: `src/app/api/payment/orders/[id]/route.ts`

**创建原因**: 为了测试支付页面而临时创建，绕过了订单 API 的认证检查。

---

## ✅ 上线前检查清单

- [ ] 删除临时订单 API
- [ ] 验证正式订单 API (`/api/orders/[id]`) 需要认证
- [ ] 确认支付页面使用服务端组件直接查询数据库
- [ ] 测试普通用户无法访问他人订单
- [ ] 运行安全扫描

---

## 🔒 正确的上线架构

### 支付页面数据获取（推荐）
使用**服务端组件**直接从数据库获取：

```typescript
// src/app/[locale]/payment/qrcode/[orderId]/page.tsx
export default async function QRCodePaymentPage({ params }: PageProps) {
  const { orderId } = await params
  
  // ✅ 服务端直接查询，无需 API
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  })
  
  // 渲染客户端组件
  return <QRCodePaymentClient order={order} />
}
```

### 或者：使用带令牌的公开链接
如果需要支持客户端渲染，可以：

1. **生成支付令牌**
   ```typescript
   // 创建订单时生成临时令牌
   const paymentToken = generateSecureToken()
   await prisma.order.update({
     where: { id: orderId },
     data: { paymentToken, paymentTokenExpiresAt: /* 24小时后 */ }
   })
   ```

2. **使用令牌访问**
   ```
   /payment/qrcode/{orderId}?token={paymentToken}
   ```

3. **API 验证令牌**
   ```typescript
   // /api/payment/orders/[id]/route.ts
   const token = searchParams.get('token')
   if (!token || !isValidToken(orderId, token)) {
     return unauthorized()
   }
   ```

---

## 📝 删除命令

测试完成后，运行以下命令：

```bash
# 删除临时 API
rm src/app/api/payment/orders/[id]/route.ts

# 验证删除成功
ls src/app/api/payment/orders/[id]/route.ts 2>&1 | grep "No such file"
```

---

## 🧪 验证清理成功

删除后，访问以下 URL 应该返回 404：
```
http://localhost:3000/api/payment/orders/cmqy1ol460002fb2n7z6cwa5o
```

---

**记住**: 安全 > 便利，测试完成后立即清理！🔒
