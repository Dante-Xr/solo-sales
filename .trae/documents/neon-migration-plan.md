# SoloSales 数据库迁移至 Neon 计划

## 一、迁移概述

### 1.1 目标
将项目数据库从现有 PostgreSQL 提供商迁移至 **Neon** (Serverless PostgreSQL)，以适配 **Netlify** 部署环境。

### 1.2 Neon 优势
- **Serverless**: 按需扩缩容，冷启动快
- **Netlify 兼容**: 原生支持 Netlify 集成
- **免费额度**: 3GB 存储，0.5GB 内存
- **分支数据库**: 支持预览部署隔离

### 1.3 风险评估
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据丢失 | 高 | 迁移前完整备份 |
| 服务中断 | 中 | 设置切换窗口 |
| 连接超时 | 中 | 配置连接池和重试 |
| 性能下降 | 低 | 监控并优化查询 |

---

## 二、实施步骤

### Phase 1: 创建 Neon 项目

**步骤 1.1: 注册 Neon 账号**
- 访问 https://neon.tech
- 使用 GitHub 账号登录
- 创建新项目

**步骤 1.2: 配置 Neon 项目**
- 项目名称: `solosales`
- 区域: 选择离用户最近的区域 (如 `us-east-1`)
- 计算: Serverless (默认)

**步骤 1.3: 获取连接字符串**
- 在 Neon Dashboard 获取连接字符串
- 格式: `postgresql://user:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/solosales?sslmode=require`

### Phase 2: 更新项目配置

**步骤 2.1: 更新 .env 文件**
```
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/solosales?sslmode=require
```

**步骤 2.2: 安装 Prisma SSL 依赖 (如需要)**
```bash
npm install @prisma/client
```

**步骤 2.3: 验证 Prisma 配置**
```bash
npx prisma db push
```

### Phase 3: 数据迁移

**步骤 3.1: 备份现有数据**
```bash
# 导出现有数据库
pg_dump -h localhost -U postgres -d solosales > backup.sql
```

**步骤 3.2: 推送 Prisma Schema 至 Neon**
```bash
npx prisma db push --force-reset
```

**步骤 3.3: 导入数据**
```bash
# 使用 psql 或 Neon 的 SQL Editor
psql "postgresql://user:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/solosales" < backup.sql
```

**步骤 3.4: 运行种子数据**
```bash
npx ts-node prisma/seed-admin.ts
```

### Phase 4: Netlify 集成配置

**步骤 4.1: 配置环境变量**
在 Netlify Dashboard 中设置:
```
DATABASE_URL = postgresql://user:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/solosales?sslmode=require
```

**步骤 4.2: 创建 netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**步骤 4.3: 配置 Prisma 部署钩子**
```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Phase 5: 测试验证

**步骤 5.1: 本地测试**
```bash
npm run dev
# 测试所有 CRUD 操作
```

**步骤 5.2: Netlify 部署测试**
- 创建 PR 触发预览部署
- 验证预览环境连接正常

**步骤 5.3: 生产环境验证**
- 检查所有 API 路由
- 验证数据完整性

### Phase 6: 监控与优化

**步骤 6.1: 设置监控**
- 使用 Neon Dashboard 监控查询性能
- 设置慢查询告警

**步骤 6.2: 连接池配置**
```typescript
// prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=1"
    }
  }
})
```

---

## 三、预计工时

| Phase | 任务 | 工时 |
|-------|------|------|
| 1 | 创建 Neon 项目 | 10min |
| 2 | 更新项目配置 | 5min |
| 3 | 数据迁移 | 15min |
| 4 | Netlify 集成 | 15min |
| 5 | 测试验证 | 20min |
| 6 | 监控配置 | 5min |
| **总计** | | **~70min** |

---

## 四、回滚方案

如迁移失败，可快速回滚：
1. 恢复原有的 `DATABASE_URL`
2. 从备份恢复数据: `psql < backup.sql`
3. 重新配置原有数据库连接

---

## 五、后续优化建议

1. **配置 Prisma Accelerate** - 边缘缓存层
2. **使用 Neon 分支** - 每个 PR 创建独立数据库
3. **设置连接池** - 使用 Supavisor 或 PgBouncer

---

*计划版本: v1.0*
*创建日期: 2026-03-24*
