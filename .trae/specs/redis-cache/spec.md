# Redis 缓存层实施 Spec

## Why

为了提升 TikTok 独立站的性能和响应速度，需要添加 Redis 缓存层。主流电商平台（如 Shopify）都使用缓存来应对高流量场景。

## What Changes

- 集成 Redis 缓存服务
- 实现商品数据缓存
- 实现热门搜索词缓存
- 实现会话管理（可选）

## Impact

- Affected code:
  - 新增 `src/lib/redis.ts`
  - 新增 `src/lib/cache.ts`
  - 修改 `src/context/CartContext.tsx`
  - 修改 `src/components/storefront/SearchBox.tsx`
  - 修改 `src/components/storefront/HomeCarousel.tsx`

## Redis 服务商选择

| 服务商 | 免费额度 | 国内访问 | 推荐度 |
|--------|----------|----------|--------|
| Upstash | 3GB | 快（全球CDN） | ⭐⭐⭐⭐⭐ |
| Redis Cloud | 30MB | 一般 | ⭐⭐⭐ |
| Amazon ElastiCache | 750h免费 | 需翻墙 | ⭐⭐ |

**推荐：Upstash** - 按请求计费，免费额度足够开发使用，国内访问速度快。

## 缓存策略

### 1. 商品数据缓存
- 缓存热门商品列表
- TTL: 5 分钟
- 失效: 商品更新时主动清除

### 2. 热搜词缓存
- 缓存热门搜索词 Top 10
- TTL: 1 分钟
- 失效: 实时更新

### 3. 会话缓存（可选）
- 用户会话存储
- TTL: 24 小时

## API 设计

```typescript
// 缓存键设计
cache:get:products:featured     // 热门商品
cache:get:products:category:{id} // 分类商品
cache:get:search:trending        // 热搜词
cache:get:product:{id}          // 单个商品

// 缓存操作
await cache.get(key)
await cache.set(key, value, ttl)
await cache.del(key)
```

## 环境变量

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## 验证标准

- [ ] Redis 连接成功
- [ ] 商品缓存正常读写
- [ ] 热搜词缓存正常
- [ ] 缓存失效机制正常
