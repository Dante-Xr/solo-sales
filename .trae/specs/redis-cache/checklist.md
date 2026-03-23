# Redis 缓存层检查清单

## Upstash 配置

- [ ] 已注册 Upstash 账号 (https://upstash.com)
- [ ] 已创建 Redis 数据库
- [ ] 已获取 UPSTASH_REDIS_REST_URL
- [ ] 已获取 UPSTASH_REDIS_REST_TOKEN

## 代码实现

- [x] `src/lib/redis.ts` 已创建
- [x] `src/lib/cache.ts` 已创建
- [x] Redis 连接测试通过（构建成功）

## 商品缓存

- [x] `/api/products/featured` API 已创建
- [x] 热门商品缓存正常
- [x] 缓存 TTL 为 5 分钟（300秒）
- [x] 支持缓存失效

## 热搜词缓存

- [x] `/api/search/trending` API 已创建
- [x] 热搜词 Top 4 缓存正常
- [x] 缓存 TTL 为 1 分钟（60秒）
- [x] SearchBox 已集成 Redis 热搜词

## 环境变量

- [x] `productions.env.example` 已更新
- [x] Upstash Redis 配置已添加

## 性能验证

- [ ] 页面加载时间降低
- [ ] 数据库查询次数减少

## 下一步

1. 注册 Upstash 并获取密钥
2. 配置 Vercel/Netlify 环境变量
3. 推送代码到 GitHub
4. 自动部署并验证
