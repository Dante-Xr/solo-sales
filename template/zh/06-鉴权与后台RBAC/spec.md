<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 鉴权与后台 RBAC 需求 Spec

## 目的

定义普通用户认证、管理员认证、Session、AdminUser、Role、Permission、PermissionLog 和权限缓存要求。

## Requirement: 普通用户认证

系统 SHALL 使用 Better Auth 管理普通用户注册、登录、Session 和账户关联。

### Scenario: 未登录访问受保护资源

- WHEN 未登录用户访问个人订单或资料
- THEN 系统 SHALL 返回 401 或跳转登录
- AND 不得返回其他用户数据

## Requirement: 后台 RBAC

后台 SHALL 使用 `AdminUser -> Role -> Permission` 模型控制权限，后台写操作 SHALL 检查管理员权限。

### Scenario: 无权限访问后台写接口

- WHEN 管理员缺少目标权限
- THEN 系统 SHALL 返回 403
- AND SHOULD 写入必要的审计上下文

## Requirement: 审计和缓存

权限、角色、管理员变更 SHALL 写 `PermissionLog`，并清理相关 Redis 权限缓存。

