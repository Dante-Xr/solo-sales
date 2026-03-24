# SoloSales v0.3.2 后台管理系统完善规格

## 版本信息
- **目标版本**: v0.3.2
- **制定日期**: 2026-03-24
- **当前版本**: v0.2.1
- **优化目标**: 完成后台管理系统的核心功能，包括 RAG 知识库和批发 API 对接

---

## 一、代码规范要求

### 1.1 注释要求
- **所有新增代码必须添加中文注释**
- 注释说明"功能"、"修改原因"和"优化目的"
- 复杂逻辑需详细说明实现思路
- React 组件需说明 Props 用途

### 1.2 代码风格
- 使用 TypeScript 严格模式
- 组件使用 `"use client"` 标注客户端组件
- API 路由使用 Server Components
- 遵循现有项目 ESLint 配置

---

## 二、功能规格

### 2.1 P0 功能（RAG 知识库 + 批发 API）

#### 知识库模块
| 功能 | 规格 | 文件 |
|------|------|------|
| 数据库模型 | KnowledgeBase, KnowledgeCategory | prisma/schema.prisma |
| 知识 CRUD API | 创建、读取、更新、删除 | src/app/api/knowledge/route.ts |
| 知识详情 API | 单条知识操作 | src/app/api/knowledge/[id]/route.ts |
| 管理页面 | 知识库管理 UI | src/app/admin/knowledge/page.tsx |

#### 批发 API 模块
| 功能 | 规格 | 文件 |
|------|------|------|
| 通用类型 | WholesalerProduct, ImportResult | src/lib/wholesalers/types.ts |
| 客户端基类 | 重试、错误处理 | src/lib/wholesalers/client.ts |
| 1866 类型 | 1866 API 类型定义 | src/lib/wholesalers/1866/types.ts |
| 1866 客户端 | 1866 API 实现 | src/lib/wholesalers/1866/client.ts |
| 数据映射器 | 商品数据转换 | src/lib/wholesalers/1866/mapper.ts |
| 日志工具 | 操作日志记录 | src/lib/wholesalers/logger.ts |
| 导入 API | 批量导入接口 | src/app/api/import/route.ts |
| 导入页面 | 导入管理 UI | src/app/admin/import/page.tsx |

### 2.2 P1 功能（客户管理 + 图表 + 商品完善）

| 功能 | 规格 | 文件 |
|------|------|------|
| 客户列表 | 用户管理 UI | src/app/admin/customers/page.tsx |
| 销售图表 | 7/30天趋势图 | src/components/admin/SalesChart.tsx |
| 控制台对接 | 真实数据 + 图表 | src/app/admin/page.tsx |
| 商品管理 | 增删改功能 | src/app/admin/products/page.tsx |

### 2.3 P2 功能（客服 + 设置）

| 功能 | 规格 | 文件 |
|------|------|------|
| 客服会话 | 消息列表 | src/app/admin/chat/page.tsx |
| 系统设置 | 配置页面 | src/app/admin/settings/page.tsx |

---

## 三、技术依赖

| 依赖 | 用途 | 版本 |
|------|------|------|
| recharts | 图表绘制 | ^2.12.0 |
| @tiptap/react | 富文本编辑器 | ^2.2.0 |
| sonner | Toast 通知 | ^1.4.0 |
| zod | 参数验证（已有） | ^4.3.6 |

---

## 四、验证标准

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