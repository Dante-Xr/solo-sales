# Redis 缓存层检查清单

## Upstash 配置

- [ ] 已注册 Upstash 账号
- [ ] 已创建 Redis 数据库
- [ ] 已获取 UPSTASH_REDIS_REST_URL
- [ ] 已获取 UPSTASH_REDIS_REST_TOKEN

## 代码实现

- [ ] `src/lib/redis.ts` 已创建
- [ ] `src/lib/cache.ts` 已创建
- [ ] Redis 连接测试通过

## 商品缓存

- [ ] 热门商品缓存正常
- [ ] 缓存 TTL 为 5 分钟
- [ ] 商品更新时缓存失效

## 热搜词缓存

- [ ] 热搜词 Top 10 缓存正常
- [ ] 缓存 TTL 为 1 分钟
- [ ] 缓存更新逻辑正常

## 环境变量

- [ ] `.env.example` 已更新
- [ ] `DEPLOYMENT.md` 已更新

## 性能验证

- [ ] 页面加载时间降低
- [ ] 数据库查询次数减少
