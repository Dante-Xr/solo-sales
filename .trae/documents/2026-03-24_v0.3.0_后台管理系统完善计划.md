# SoloSales 后台管理系统完善计划

## 版本信息
- **目标版本**: v0.3.0
- **制定日期**: 2026-03-24
- **当前版本**: v0.2.1

---

## 一、现状分析

### 1.1 已有功能
| 模块 | 页面 | 状态 | 说明 |
|------|------|------|------|
| 控制台 | `/admin` | ⚠️ 部分完成 | 使用 Mock 数据，缺少图表 |
| 商品管理 | `/admin/products` | ⚠️ 部分完成 | 使用 Mock 数据，仅展示 |
| 订单管理 | `/admin/orders` | ⚠️ 部分完成 | 已有 API 集成，可更新状态和物流 |
| 侧边栏 | - | ⚠️ 部分完成 | 6 个菜单项，4 个页面不存在 |

### 1.2 缺失功能
| 模块 | 页面 | 优先级 | 说明 |
|------|------|--------|------|
| 客户管理 | `/admin/customers` | P1 | 用户列表、用户详情 |
| 客服会话 | `/admin/chat` | P2 | 消息列表、聊天界面 |
| 系统设置 | `/admin/settings` | P2 | 基本设置、支付设置 |
| 图表组件 | - | P1 | 销售趋势图表 |
| 实时通知 | - | P2 | 订单状态变化通知 |

---

## 二、实施计划

### Phase 1: 核心功能完善 (P1)

#### Task 1.1: 客户管理页面
**文件**: `src/app/admin/customers/page.tsx` (新建)

**功能**:
- 客户列表展示（ID、姓名、邮箱、注册时间、订单数）
- 客户搜索和筛选
- 客户详情查看

#### Task 1.2: 销售图表组件
**文件**: `src/components/admin/SalesChart.tsx` (新建)

**功能**:
- 7天/30天销售趋势折线图
- 使用 Recharts 库绘制
- 响应式设计

#### Task 1.3: 控制台数据对接
**文件**: `src/app/admin/page.tsx`

**修改**:
- 替换 Mock 数据为真实 API 调用
- 集成 SalesChart 组件
- 添加数据刷新功能

---

### Phase 2: 商品管理完善 (P1)

#### Task 2.1: 商品添加/编辑功能
**文件**: `src/app/admin/products/page.tsx`

**功能**:
- 添加商品 Dialog/Sheet
- 编辑商品 Dialog/Sheet
- 商品表单验证

#### Task 2.2: 商品删除功能
**文件**: `src/app/admin/products/page.tsx`

**功能**:
- 删除确认 Dialog
- 软删除 vs 硬删除策略

---

### Phase 3: 扩展功能 (P2)

#### Task 3.1: 客服会话页面
**文件**: `src/app/admin/chat/page.tsx` (新建)

**功能**:
- 会话列表
- 简易聊天界面（WebSocket 或轮询）

#### Task 3.2: 系统设置页面
**文件**: `src/app/admin/settings/page.tsx` (新建)

**功能**:
- 商店基本设置
- 通知设置

#### Task 3.3: 实时通知
**文件**: 新增 Toast 通知组件

**功能**:
- 新订单通知
- 状态变更通知

---

## 三、文件修改清单

| 顺序 | 文件路径 | 操作 | 优先级 |
|------|----------|------|--------|
| 1 | `src/app/admin/customers/page.tsx` | 新建 | P1 |
| 2 | `src/components/admin/SalesChart.tsx` | 新建 | P1 |
| 3 | `src/app/admin/page.tsx` | 修改 | P1 |
| 4 | `src/app/admin/products/page.tsx` | 修改 | P1 |
| 5 | `src/app/admin/chat/page.tsx` | 新建 | P2 |
| 6 | `src/app/admin/settings/page.tsx` | 新建 | P2 |
| 7 | `src/components/ui/toast.tsx` 或使用现有 | 新建/修改 | P2 |

---

## 四、技术依赖

| 依赖 | 用途 | 版本建议 |
|------|------|----------|
| `recharts` | 图表绘制 | ^2.12.0 |
| `sonner` 或 `toast` | 通知提示 | 最新稳定版 |

---

## 五、验证标准

- [ ] 客户管理页面正常访问和显示
- [ ] 销售图表正确渲染
- [ ] 控制台显示真实数据
- [ ] 商品支持添加、编辑、删除
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 无错误

---

**计划制定完成，等待用户确认后执行。**