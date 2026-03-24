# SoloSales v0.3.2 后台管理系统完善任务清单

## 版本信息
- **目标版本**: v0.3.2
- **制定日期**: 2026-03-24

---

## Phase 1: P0 核心功能

### Task 1.1: RAG 知识库 - 数据库模型
**文件**: `prisma/schema.prisma`

**执行步骤**:
1. 添加 `KnowledgeBase` 模型（id, title, content, category, tags, version, createdAt, updatedAt, createdBy）
2. 添加 `KnowledgeCategory` 模型（id, name, parentId, order）
3. 添加中文注释说明模型用途
4. 执行 `npx prisma generate` 生成类型

---

### Task 1.2: RAG 知识库 - CRUD API
**文件**: `src/app/api/knowledge/route.ts` (新建)

**执行步骤**:
1. 创建 GET handler - 获取知识列表（支持分页、分类筛选、关键词搜索）
2. 创建 POST handler - 创建知识条目
3. 添加中文注释说明每个 handler 用途
4. 使用 Zod 验证请求参数

---

### Task 1.3: RAG 知识库 - 详情 API
**文件**: `src/app/api/knowledge/[id]/route.ts` (新建)

**执行步骤**:
1. 创建 GET handler - 获取单条知识详情
2. 创建 PATCH handler - 更新知识内容（自动增加版本号）
3. 创建 DELETE handler - 删除知识条目
4. 添加中文注释说明

---

### Task 1.4: RAG 知识库 - 管理页面
**文件**: `src/app/admin/knowledge/page.tsx` (新建)

**执行步骤**:
1. 创建知识列表展示组件（卡片或表格形式）
2. 创建知识编辑 Dialog（标题、内容、分类、标签）
3. 创建分类管理功能
4. 实现搜索和筛选功能
5. 添加中文注释说明组件用途

---

### Task 1.5: 批发 API - 通用类型
**文件**: `src/lib/wholesalers/types.ts` (新建)

**执行步骤**:
1. 定义 `WholesalerProduct` 类型（SKU、名称、价格、图片、库存等）
2. 定义 `ImportResult` 类型（成功数、失败数、错误列表）
3. 定义 `WholesalerConfig` 类型（API 配置）
4. 添加中文注释说明每个类型用途

---

### Task 1.6: 批发 API - 客户端基类
**文件**: `src/lib/wholesalers/client.ts` (新建)

**执行步骤**:
1. 创建 `WholesalerClient` 基类
2. 实现通用请求方法（带重试机制）
3. 实现错误处理和日志记录
4. 添加中文注释说明

---

### Task 1.7: 批发 API - 1866 类型和客户端
**文件**:
- `src/lib/wholesalers/1866/types.ts` (新建)
- `src/lib/wholesalers/1866/client.ts` (新建)

**执行步骤**:
1. 定义 1866 API 专用类型
2. 实现 1866 API 客户端类
3. 实现商品列表获取方法
4. 添加中文注释说明

---

### Task 1.8: 批发 API - 数据映射器
**文件**: `src/lib/wholesalers/1866/mapper.ts` (新建)

**执行步骤**:
1. 创建 1866 数据到系统商品的映射函数
2. 实现价格计算策略（加价率）
3. 实现库存映射逻辑
4. 添加中文注释说明映射规则

---

### Task 1.9: 批发 API - 日志工具
**文件**: `src/lib/wholesalers/logger.ts` (新建)

**执行步骤**:
1. 创建导入操作日志类型
2. 实现日志记录函数
3. 实现错误日志记录
4. 添加中文注释说明

---

### Task 1.10: 批发 API - 导入 API
**文件**: `src/app/api/import/route.ts` (新建)

**执行步骤**:
1. 创建 POST handler - 触发批量导入
2. 实现商品去重检测
3. 实现数据库写入逻辑
4. 返回导入结果
5. 添加中文注释说明

---

### Task 1.11: 批发 API - 导入管理页面
**文件**: `src/app/admin/import/page.tsx` (新建)

**执行步骤**:
1. 创建导入历史列表
2. 创建导入状态展示（进度、结果）
3. 创建手动触发导入按钮
4. 添加中文注释说明

---

## Phase 2: P1 核心功能

### Task 2.1: 客户管理页面
**文件**: `src/app/admin/customers/page.tsx` (新建)

**执行步骤**:
1. 创建客户列表组件
2. 创建客户搜索和筛选功能
3. 创建客户详情查看功能
4. 添加中文注释说明

---

### Task 2.2: 销售图表组件
**文件**: `src/components/admin/SalesChart.tsx` (新建)

**执行步骤**:
1. 使用 Recharts 创建折线图组件
2. 支持 7天/30天切换
3. 实现响应式设计
4. 添加中文注释说明

---

### Task 2.3: 控制台数据对接
**文件**: `src/app/admin/page.tsx`

**执行步骤**:
1. 替换 Mock 数据为 API 调用
2. 集成 SalesChart 组件
3. 添加数据刷新功能
4. 添加中文注释说明

---

### Task 2.4: 商品管理完善
**文件**: `src/app/admin/products/page.tsx`

**执行步骤**:
1. 创建添加商品 Dialog/Sheet
2. 创建编辑商品 Dialog/Sheet
3. 创建删除确认 Dialog
4. 添加表单验证
5. 添加中文注释说明

---

## Phase 3: P2 扩展功能

### Task 3.1: 客服会话页面
**文件**: `src/app/admin/chat/page.tsx` (新建)

---

### Task 3.2: 系统设置页面
**文件**: `src/app/admin/settings/page.tsx` (新建)

---

## 任务完成标准

### 构建验证
- [ ] `npm run build` 成功
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