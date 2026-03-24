# RBAC 权限管理模块实施检查清单

## Phase 1: 数据模型扩展

- [ ] **1.1** Prisma schema 已更新
  - [ ] PermissionType 枚举包含 DATA 类型
  - [ ] PermissionLog 模型已创建
  - [ ] 字段类型和关系正确

- [ ] **1.2** prisma generate 成功

- [ ] **1.3** prisma db push 成功

---

## Phase 2: 权限校验核心库

- [ ] **2.1** `src/lib/adminAuth.ts` 已创建
  - [ ] verifyAdminToken() 实现正确
  - [ ] getAdminPermissions() 实现正确（带缓存）
  - [ ] hasPermission() 实现正确
  - [ ] hasAnyPermission() 实现正确
  - [ ] hasAllPermissions() 实现正确
  - [ ] invalidatePermissionCache() 实现正确
  - [ ] invalidateRoleCache() 实现正确

- [ ] **2.2** 权限校验中间件函数已创建
  - [ ] requireAuth() 实现正确
  - [ ] requirePermission() 实现正确
  - [ ] requireAnyPermission() 实现正确
  - [ ] requireAllPermissions() 实现正确

---

## Phase 3: 缓存机制扩展

- [ ] **3.1** cache.ts 已扩展
  - [ ] ADMIN_PERMISSIONS 缓存键已添加
  - [ ] ROLE_PERMISSIONS 缓存键已添加
  - [ ] ALL_PERMISSIONS 缓存键已添加

- [ ] **3.2** 权限缓存获取已实现
  - [ ] 缓存命中时直接返回
  - [ ] 缓存未命中时查询数据库
  - [ ] 结果已正确缓存

- [ ] **3.3** 权限缓存失效已实现
  - [ ] 用户权限变更时清除缓存
  - [ ] 角色权限变更时清除相关缓存
  - [ ] 权限变更时清除缓存

---

## Phase 4: 权限变更日志

- [ ] **4.1** `src/lib/permissionLog.ts` 已创建
  - [ ] logCreate() 实现正确
  - [ ] logUpdate() 实现正确
  - [ ] logDelete() 实现正确
  - [ ] getLogs() 实现正确

- [ ] **4.2** 权限 API 已集成日志
  - [ ] POST /api/admin/permissions 记录日志
  - [ ] PATCH /api/admin/permissions/:id 记录日志
  - [ ] DELETE /api/admin/permissions/:id 记录日志

- [ ] **4.3** 角色 API 已集成日志
  - [ ] POST /api/admin/roles 记录日志
  - [ ] PATCH /api/admin/roles/:id 记录日志
  - [ ] DELETE /api/admin/roles/:id 记录日志

- [ ] **4.4** 用户 API 已集成日志
  - [ ] POST /api/admin/users 记录日志
  - [ ] PATCH /api/admin/users/:id 记录日志
  - [ ] DELETE /api/admin/users/:id 记录日志

---

## Phase 5: API 完善

- [ ] **5.1** `/api/admin/permissions/[id]/route.ts` 已完善
  - [ ] GET 返回权限详情
  - [ ] PATCH 更新权限
  - [ ] DELETE 删除权限（含引用检查）
  - [ ] 已添加权限校验

- [ ] **5.2** `/api/admin/roles/[id]/route.ts` 已完善
  - [ ] GET 返回角色详情
  - [ ] PATCH 更新角色
  - [ ] DELETE 删除角色（含用户引用检查）
  - [ ] 已添加权限校验
  - [ ] 权限变更时清除缓存

- [ ] **5.3** `/api/admin/users/[id]/route.ts` 已完善
  - [ ] GET 返回用户详情
  - [ ] PATCH 更新用户
  - [ ] DELETE 删除用户
  - [ ] 已添加权限校验

- [ ] **5.4** 所有 Admin API 已添加权限校验
  - [ ] permissions/* 需要相应权限
  - [ ] roles/* 需要相应权限
  - [ ] users/* 需要相应权限

---

## Phase 6: 权限管理 UI

- [ ] **6.1** `/admin/permissions` 页面已创建
  - [ ] 权限列表表格正常显示
  - [ ] 分页控件正常工作
  - [ ] 权限类型 Badge 正确显示

- [ ] **6.2** 权限 Dialog 组件已创建
  - [ ] 创建权限表单完整
  - [ ] 编辑权限表单完整
  - [ ] 表单验证正确

- [ ] **6.3** 删除确认 Dialog 已创建
  - [ ] 显示被引用信息
  - [ ] 阻止删除已使用权限

- [ ] **6.4** 侧边栏已更新
  - [ ] 权限管理菜单项已添加
  - [ ] 路由保护已配置

---

## Phase 7: 动态权限生效

- [ ] **7.1** 登录响应已扩展
  - [ ] 返回完整权限列表
  - [ ] 权限缓存失效机制已配置

- [ ] **7.2** 前端权限 Hook 已创建
  - [ ] usePermissions() 实现正确
  - [ ] hasPermission() 实现正确
  - [ ] 自动刷新机制已配置

- [ ] **7.3** 权限变更通知已实现
  - [ ] 权限变更后返回标记
  - [ ] 前端检测到标记后刷新权限

---

## Phase 8: 测试覆盖

- [ ] **8.1** 权限校验单元测试已创建
  - [ ] verifyAdminToken 测试通过
  - [ ] hasPermission 测试通过
  - [ ] 缓存逻辑测试通过

- [ ] **8.2** API 集成测试已创建
  - [ ] 权限校验中间件测试通过
  - [ ] CRUD API 测试通过

- [ ] **8.3** 缓存机制测试已创建
  - [ ] 缓存命中/未命中测试通过
  - [ ] 缓存失效测试通过

---

## 最终验收

- [ ] **构建验证**: `npm run build` 成功
- [ ] **功能验证**: 所有 API 正常工作
- [ ] **权限验证**: 未授权请求返回 403
- [ ] **缓存验证**: 权限查询走缓存
- [ ] **日志验证**: 权限变更已记录
- [ ] **UI 验证**: 权限管理页面正常