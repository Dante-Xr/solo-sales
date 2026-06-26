<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 鉴权与后台 RBAC 需求 Tasks

## Phase 1: Discovery And Boundaries

- 读取 `src/lib/auth.ts`、`src/server/auth/session.ts`。
- 读取 `src/lib/adminAuth.ts`、`admin-service`、`admin-repository`。
- 读取 RBAC API routes。

## Phase 2: Implementation Requirements

- 定义普通用户、管理员、角色、权限边界。
- 定义 401 和 403 差异。
- 定义权限缓存 key、缓存失效、审计日志。
- 要求后台写操作补齐 CSRF/RBAC。

## Phase 3: Tests And Verification

- 测试未登录、无权限、有权限三类路径。
- 测试角色和权限变更后缓存失效。
- 测试 PermissionLog 写入。

## Phase 4: Documentation And Handoff

- 将权限名、角色职责和后台页面访问矩阵写入具体功能 spec。

