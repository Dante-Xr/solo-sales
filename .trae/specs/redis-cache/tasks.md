# Redis 缓存层实施任务

## Task 1: 注册 Upstash Redis

- [ ] SubTask 1.1: 访问 https://upstash.com 注册
- [ ] SubTask 1.2: 创建 Redis 数据库
- [ ] SubTask 1.3: 获取 REST URL 和 Token

## Task 2: 安装 Redis 客户端

- [ ] SubTask 2.1: 安装 `@upstash/redis` 包
- [ ] SubTask 2.2: 创建 `src/lib/redis.ts` 连接文件

## Task 3: 实现缓存工具函数

- [ ] SubTask 3.1: 实现 `cache.get()` 函数
- [ ] SubTask 3.2: 实现 `cache.set()` 函数
- [ ] SubTask 3.3: 实现 `cache.del()` 函数

## Task 4: 商品缓存集成

- [ ] SubTask 4.1: 修改 `HomeCarousel.tsx` 添加商品缓存
- [ ] SubTask 4.2: 添加热门商品缓存逻辑

## Task 5: 热搜词缓存集成

- [ ] SubTask 5.1: 修改 `SearchBox.tsx` 添加热搜缓存
- [ ] SubTask 5.2: 实现热搜词缓存更新

## Task 6: 环境变量配置

- [ ] SubTask 6.1: 更新 `productions.env.example`
- [ ] SubTask 6.2: 更新 `DEPLOYMENT.md`

## Task 7: 本地测试

- [ ] SubTask 7.1: 验证 Redis 连接
- [ ] SubTask 7.2: 测试缓存读写
- [ ] SubTask 7.3: 测试缓存失效

# Task Dependencies

- Task 1 完成后才能开始 Task 2
- Task 2 完成后才能开始 Task 3
- Task 3 完成后才能开始 Task 4、5
- Task 4、5 完成后才能开始 Task 7
