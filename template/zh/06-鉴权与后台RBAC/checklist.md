<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 鉴权与后台 RBAC 需求 Checklist

## Documentation Completeness

- [ ] 覆盖 Better Auth。
- [ ] 覆盖 AdminUser、Role、Permission、PermissionLog。

## Functional Correctness

- [ ] 普通用户只能访问自己的数据。
- [ ] 后台写操作检查权限。

## Data And API Contract

- [ ] 401 表示未认证。
- [ ] 403 表示已认证但无权限。

## Security And Permissions

- [ ] 权限变更写审计。
- [ ] 权限变更清缓存。

## Reliability And Failure Modes

- [ ] Redis 缓存失败不授予额外权限。
- [ ] 默认管理员要求生产改密。

## Verification Commands

- [ ] `npm test -- src/server/services/__tests__/admin-service.test.ts`
- [ ] `npm run smoke:synthetic`

