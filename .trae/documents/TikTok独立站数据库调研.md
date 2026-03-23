# TikTok 独立站数据库调研计划

## 研究背景

当前项目使用 PostgreSQL + Prisma ORM。需要调研主流 TikTok 独立站使用的数据库方案。

## 调研结论

### 主流电商平台数据库选型

| 平台               | 数据库                | 说明                        |
| ---------------- | ------------------ | ------------------------- |
| Shopify          | **MySQL**          | 全球最大 SaaS 电商，MySQL 集群规模惊人 |
| WooCommerce      | MySQL              | WordPress 生态标配            |
| Magento          | MySQL              | 企业级电商标准                   |
| BigCommerce      | MySQL              | SaaS 电商                   |
| TikTok Shop (字节) | 内部自研 + MySQL/Redis | 全球化电商基础设施                 |

### 关键发现：Shopify 的数据库架构

Shopify 仍然使用 **MySQL** 作为核心数据库：

* 数百个数据库分片

* 每秒超过 1000 万次查询

* 基于快照的备份，恢复窗口为 30 分钟

* 在线模式变更

**架构特点**：

* 模块化单体架构（Ruby on Rails）

* 六边形架构（端口与适配器模式）

* 核心业务逻辑与外部系统解耦

### 数据库对比

| 特性     | MySQL            | PostgreSQL |
| ------ | ---------------- | ---------- |
| 成熟度    | ⭐⭐⭐⭐⭐            | ⭐⭐⭐⭐       |
| 电商场景   | ⭐⭐⭐⭐⭐（Shopify验证） | ⭐⭐⭐⭐       |
| JSON支持 | 基础               | 强大（JSONB）  |
| 数组类型   | 不支持              | 支持         |
| 读写性能   | 读多写少场景优秀         | 复杂查询更强     |
| 生态工具   | 极其丰富             | 较丰富        |

## 调研结论

### 推荐方案

**当前项目（PostgreSQL）保留，原因**：

1. TikTok 独立站主要需要展示商品、处理订单，数据复杂度高
2. JSONB 类型方便存储灵活的商品属性（如 SKU 变体）
3. Prisma ORM 对 PostgreSQL 支持更好
4. 对于中小规模电商，PostgreSQL 完全满足需求

**如需升级到 MySQL 的场景**：

* 需要与 Shopify/WooCommerce 生态集成

* 需要支持 WordPress 插件

* 需要更广泛的第三方工具兼容

### 数据库服务商推荐

| 服务商         | 数据库        | 免费额度  | 国内访问 |
| ----------- | ---------- | ----- | ---- |
| Supabase    | PostgreSQL | 500MB | 需CDN |
| Neon        | PostgreSQL | 3GB   | 需CDN |
| PlanetScale | MySQL      | 免费套餐  | 尚可   |
| TiDB        | MySQL      | 有限免费  | 快    |

## 下一步行动

1. **保持当前 PostgreSQL 方案** - 满足当前业务需求
2. **如需 MySQL** - 可使用 PlanetScale（免费 MySQL 服务）
3. **性能优化** - 添加 Redis 缓存层（可选）

