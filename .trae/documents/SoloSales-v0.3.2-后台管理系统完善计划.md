# SoloSales 后台管理系统完善计划

## 版本信息
- **目标版本**: v0.3.2
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
| RAG 知识库 | `/admin/knowledge` | P0 | 智能客服素材管理 |
| 批发 API 对接 | `/admin/import` | P0 | 1866 等批发网站数据导入 |

---

## 二、实施计划

### Phase 1: P0 核心功能

#### Task 1.1: RAG 知识库管理系统
**文件**: `src/app/admin/knowledge/page.tsx` (新建)

**功能**:
1. **知识库内容管理**
   - 创建/编辑知识条目（标题、内容、分类、标签）
   - 支持富文本编辑器
   - 内容版本控制

2. **分类体系**
   - 多级分类结构
   - 分类管理（增删改）
   - 标签系统

3. **检索功能**
   - 全文搜索
   - 分类/标签筛选
   - 相关知识推荐

4. **智能客服接口**
   - API 接口暴露知识库内容
   - 向量嵌入支持（预留）
   - 调用日志记录

**数据库模型**:
```prisma
model KnowledgeBase {
  id          String   @id @default(cuid())
  title       String
  content     String
  category    String
  tags        String[]
  version     Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String
}

model KnowledgeCategory {
  id       String @id @default(cuid())
  name     String
  parentId String?
  order    Int    @default(0)
}
```

---

#### Task 1.2: 批发网站 API 对接模块
**目录**: `src/lib/ wholesalers/` (新建)

**功能**:
1. **API 对接**
   - 1866 API 客户端封装
   - 其他批发网站适配器（可扩展）
   - 请求重试和错误处理

2. **商品导入**
   - 批量获取商品信息
   - 商品信息映射和转换
   - 去重和冲突检测

3. **一键上架**
   - 批量上架功能
   - 价格调整策略
   - 库存同步

4. **日志与监控**
   - 导入操作日志
   - 错误记录
   - 同步状态追踪

**文件结构**:
```
src/lib/wholesalers/
├── client.ts          # API 客户端基类
├── 1866/
│   ├── client.ts      # 1866 API 实现
│   ├── mapper.ts      # 数据映射
│   └── types.ts       # 类型定义
├── types.ts           # 通用类型
└── logger.ts          # 日志工具
```

---

### Phase 2: P1 核心功能

#### Task 2.1: 客户管理页面
**文件**: `src/app/admin/customers/page.tsx` (新建)

**功能**:
- 客户列表展示（ID、姓名、邮箱、注册时间、订单数）
- 客户搜索和筛选
- 客户详情查看

#### Task 2.2: 销售图表组件
**文件**: `src/components/admin/SalesChart.tsx` (新建)

**功能**:
- 7天/30天销售趋势折线图
- 使用 Recharts 库绘制
- 响应式设计

#### Task 2.3: 控制台数据对接
**文件**: `src/app/admin/page.tsx`

**修改**:
- 替换 Mock 数据为真实 API 调用
- 集成 SalesChart 组件
- 添加数据刷新功能

#### Task 2.4: 商品管理完善
**文件**: `src/app/admin/products/page.tsx`

**功能**:
- 添加商品 Dialog/Sheet
- 编辑商品 Dialog/Sheet
- 删除确认 Dialog
- 商品表单验证

---

### Phase 3: P2 扩展功能

#### Task 3.1: 客服会话页面
**文件**: `src/app/admin/chat/page.tsx` (新建)

#### Task 3.2: 系统设置页面
**文件**: `src/app/admin/settings/page.tsx` (新建)

#### Task 3.3: 实时通知
**文件**: Toast 组件集成

---

## 三、文件修改清单

### 知识库模块 (P0)
| 顺序 | 文件路径 | 操作 | 说明 |
|------|----------|------|------|
| 1 | `prisma/schema.prisma` | 修改 | 添加 KnowledgeBase, KnowledgeCategory 模型 |
| 2 | `src/app/api/knowledge/route.ts` | 新建 | 知识库 CRUD API |
| 3 | `src/app/api/knowledge/[id]/route.ts` | 新建 | 单条知识操作 API |
| 4 | `src/app/admin/knowledge/page.tsx` | 新建 | 知识库管理页面 |

### 批发 API 模块 (P0)
| 顺序 | 文件路径 | 操作 | 说明 |
|------|----------|------|------|
| 5 | `src/lib/wholesalers/types.ts` | 新建 | 通用类型定义 |
| 6 | `src/lib/wholesalers/client.ts` | 新建 | API 客户端基类 |
| 7 | `src/lib/wholesalers/1866/types.ts` | 新建 | 1866 类型定义 |
| 8 | `src/lib/wholesalers/1866/client.ts` | 新建 | 1866 API 实现 |
| 9 | `src/lib/wholesalers/1866/mapper.ts` | 新建 | 数据映射器 |
| 10 | `src/lib/wholesalers/logger.ts` | 新建 | 日志工具 |
| 11 | `src/app/api/import/route.ts` | 新建 | 批量导入 API |
| 12 | `src/app/admin/import/page.tsx` | 新建 | 导入管理页面 |

### 客户与图表模块 (P1)
| 顺序 | 文件路径 | 操作 | 说明 |
|------|----------|------|------|
| 13 | `src/app/admin/customers/page.tsx` | 新建 | 客户管理页面 |
| 14 | `src/components/admin/SalesChart.tsx` | 新建 | 销售图表组件 |
| 15 | `src/app/admin/page.tsx` | 修改 | 控制台数据对接 |
| 16 | `src/app/admin/products/page.tsx` | 修改 | 商品增删改功能 |

### 其他 (P2)
| 顺序 | 文件路径 | 操作 | 说明 |
|------|----------|------|------|
| 17 | `src/app/admin/chat/page.tsx` | 新建 | 客服会话 |
| 18 | `src/app/admin/settings/page.tsx` | 新建 | 系统设置 |

---

## 四、技术依赖

| 依赖 | 用途 | 版本建议 |
|------|------|----------|
| `recharts` | 图表绘制 | ^2.12.0 |
| `@tiptap/react` | 富文本编辑器 | ^2.2.0 |
| `sonner` | Toast 通知 | ^1.4.0 |
| `zod` | 验证 (已有) | ^4.3.6 |

---

## 五、测试计划

### 单元测试
- 知识库 CRUD 操作
- 1866 API 客户端
- 数据映射器

### 集成测试
- 知识库 API 端到端
- 批发商品导入流程

### 文档
- 用户操作指南 (Markdown)
- API 文档
- 部署文档

---

## 六、验证标准

### 构建验证
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 无错误
- [ ] 数据库迁移成功

### 功能验证
- [ ] 知识库创建、编辑、删除正常
- [ ] 知识库分类和检索功能正常
- [ ] 1866 API 对接成功
- [ ] 商品批量导入功能正常
- [ ] 客户管理页面正常显示
- [ ] 销售图表正确渲染
- [ ] 控制台显示真实数据
- [ ] 商品支持添加、编辑、删除

---

**计划制定完成，等待用户确认后执行。**