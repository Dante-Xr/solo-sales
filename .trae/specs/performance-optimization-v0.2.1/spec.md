# SoloSales v0.2.1 性能优化实施规格

## 版本信息
- **目标版本**: v0.2.1
- **制定日期**: 2026-03-24
- **优化目标**: 页面首次加载时间减少30%以上，页面切换响应时间控制在200ms以内

---

## 一、优化范围

### 1.1 已确认的已有优化（保持）
| 类别 | 配置 |
|------|------|
| 图片优化 | AVIF/WebP 格式自动转换 |
| 包导入优化 | optimizePackageImports: lucide-react |
| Context 缓存 | CartContext/WishlistContext 使用 useMemo |
| 静态数据 | FEATURED_PRODUCTS 组件外部常量 |

### 1.2 本次新增优化

#### P0 级别（关键优化）
1. **WelcomeModal 动态导入** - 首屏 JS 体积减少
2. **HomeCarousel 定时器优化** - 消除每秒重渲染
3. **Context 嵌套合并** - 减少重渲染组件数量

#### P1 级别（重要优化）
4. **AuthProvider 动态导入** - 优化首屏加载
5. **UI 组件 React.memo** - 减少不必要重渲染
6. **路由预加载策略** - 提升页面切换速度
7. **Bundle Analyzer 配置** - 量化分析优化效果

#### P2 级别（版本更新）
8. **版本号更新** - 0.1.0 → 0.2.1
9. **变更日志** - 记录性能优化内容

---

## 二、代码规范要求

### 2.1 注释要求
- 所有修改的代码必须添加中文注释
- 注释说明"修改原因"和"优化目的"
- 复杂逻辑需详细说明实现思路

### 2.2 性能指标
- Lighthouse Performance Score >= 90
- 首屏加载时间减少 >= 30%
- 页面切换响应时间 < 200ms

---

## 三、修改文件清单

| 序号 | 文件路径 | 修改类型 | 优先级 |
|------|----------|----------|--------|
| 1 | `src/app/page.tsx` | 动态导入 WelcomeModal | P0 |
| 2 | `src/components/storefront/HomeCarousel.tsx` | 定时器优化 | P0 |
| 3 | `src/app/layout.tsx` | Context 合并 | P0 |
| 4 | `src/components/providers/AuthProvider.tsx` | 动态导入 | P1 |
| 5 | `src/components/ui/card.tsx` | React.memo | P1 |
| 6 | `src/components/ui/button.tsx` | React.memo | P1 |
| 7 | `src/components/storefront/ProductCard.tsx` | 新建组件 | P1 |
| 8 | `next.config.ts` | Bundle Analyzer | P1 |
| 9 | `package.json` | 版本号更新 | P2 |
| 10 | `CHANGELOG.md` | 新建 | P2 |

---

## 四、验证标准

### 4.1 构建验证
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 无错误
- [ ] 开发服务器正常启动

### 4.2 性能验证
- [ ] Bundle 大小可通过 `npm run analyze` 查看
- [ ] 首屏加载时间减少 30%
- [ ] 页面切换响应时间 < 200ms