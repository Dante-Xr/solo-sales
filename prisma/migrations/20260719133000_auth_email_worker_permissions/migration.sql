INSERT INTO "Permission" ("id", "name", "label", "description", "type", "createdAt", "updatedAt")
VALUES
  (md5(random()::text || clock_timestamp()::text), 'worker.view', '查看任务调度', '查看认证邮件 worker 状态、运行记录与死信', 'PAGE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (md5(random()::text || clock_timestamp()::text), 'worker.manage', '管理任务调度', '配置、启停和手动执行认证邮件 worker', 'ACTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET "label" = EXCLUDED."label", "description" = EXCLUDED."description", "type" = EXCLUDED."type", "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "_RolePermissions" ("A", "B")
SELECT permission."id", role."id"
FROM "Permission" permission
CROSS JOIN "Role" role
WHERE permission."name" IN ('worker.view', 'worker.manage')
  AND role."name" = 'super_admin'
ON CONFLICT DO NOTHING;
