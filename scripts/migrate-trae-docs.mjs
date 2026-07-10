import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { collectSourceInventory } from "./docs-validate.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const docs = path.join(root, "docs")
const futureVersions = new Set(["v1.8.0", "v1.9.0", "v2.0.0"])

function write(relativePath, content) {
  const destination = path.join(docs, relativePath)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.writeFileSync(destination, `${content.trim()}\n`, "utf8")
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "legacy-records"
}

function normalizeVersion(value) {
  const match = value?.match(/v?(\d+)\.(\d+)(?:\.(\d+))?/i)
  return match ? `v${match[1]}.${match[2]}.${match[3] || "0"}` : "v0.0.0"
}

function sourceText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8")
}

function markdownHeadings(content) {
  return [...content.matchAll(/^#{1,3}\s+(.+)$/gm)]
    .map((match) => match[1].trim())
    .filter((heading) => !/^SoloSales\s+v?\d/i.test(heading))
    .slice(0, 12)
}

function frontmatter(lines) {
  return `---\n${lines.join("\n")}\n---`
}

function buildArchive(version, id, title, sources) {
  const folder = `changes/archive/${version}/${id}-${slug(title)}`
  const texts = sources.map((source) => ({ source, content: sourceText(source) }))
  const headings = [...new Set(texts.flatMap(({ content }) => markdownHeadings(content)))].slice(0, 18)
  const completed = texts.reduce((total, { content }) => total + (content.match(/^\s*[-*]\s+\[[xX]\]/gm) || []).length, 0)
  const pending = texts.reduce((total, { content }) => total + (content.match(/^\s*[-*]\s+\[ \]/gm) || []).length, 0)
  const verification = completed === 0 ? "unverified" : pending === 0 ? "partially_verified" : "contradictory_evidence"

  write(`${folder}/spec.md`, `${frontmatter([
    `id: ${id}`,
    `version: ${version}`,
    "status: historical",
    "archive_reason: historical_import",
    "source_of_truth: .trae (read-only evidence)",
  ])}

# ${title}

## 迁移结论

这是从旧 \`.trae\` 资料导入的历史变更单元。它不声明当前行为；当前可执行要求以 [current.md](../../../../specs/current.md) 为准。旧计划中的完成标记只能作为线索，未被自动提升为事实。

## 原始范围线索

${headings.length ? headings.map((heading) => `- ${heading}`).join("\n") : "- 原始文档未提供可提取的范围标题。"}

## 原始来源

${sources.map((source) => `- \`${source}\``).join("\n")}

## 采纳与验证

- 验证状态：\`${verification}\`。
- 旧资料中发现 ${completed} 个已勾选项和 ${pending} 个未勾选项；不据此推断实现状态。
- 当前代码、测试、Prisma schema、提交和 tag 是事实采纳证据；与旧资料冲突时以这些证据为准。
`)

  write(`${folder}/tasks.md`, `${frontmatter([
    `id: ${id}-TASKS`,
    `version: ${version}`,
    "status: historical",
    "archive_reason: historical_import",
    `verification: ${verification}`,
  ])}

# ${title} - 历史任务与证据

## 来源记录

${sources.map((source) => `- \`${source}\``).join("\n")}

## 状态解释

- 旧文档 checkbox：完成 ${completed}，未完成 ${pending}。
- 迁移状态：\`${verification}\`；此状态只说明旧记录的一致性，不代表功能已在当前版本存在。
- 需要重新开发或复核的事项，应创建真实 GitHub Issue，并写入相应版本目录，而不是修改本归档。

## 可追溯证据

- 历史正文、hash 和映射均记录在 [legacy/inventory.json](../../../../legacy/inventory.json) 与 [legacy/migration-map.md](../../../../legacy/migration-map.md)。
`)
  return [`docs/${folder}/spec.md`, `docs/${folder}/tasks.md`]
}

const staticDocuments = {
  "README.md": `# SoloSales 技术文档

当前代码版本：**v1.7.6**。当前代码的最新 Git tag：**v1.7.0**。两者尚待发布核验，见 [发布登记表](releases/manifest.json)。

## 开发入口

- 当前已生效的产品与技术要求：[specs/current.md](specs/current.md)
- 当前架构和运行链路：[architecture/overview.md](architecture/overview.md)、[architecture/runtime.md](architecture/runtime.md)
- 版本迭代需求和 Issue 入口：[changes/README.md](changes/README.md)
- 版本计划：[releases/roadmap.md](releases/roadmap.md)
- 操作与发布：[runbooks/](runbooks/)
- 旧 \`.trae\` 文档迁移证据：[legacy/README.md](legacy/README.md)

文档使用规则、ID、状态和更新流程见 [governance/rules.md](governance/rules.md)。`,
  "governance/rules.md": `# 文档治理规则

## 来源优先级

1. 运行中的代码、Prisma schema、自动化测试和已发布 tag。
2. \`docs/specs/current.md\` 的已采纳要求。
3. 已批准版本变更的 \`changes/vX.Y.Z/\` 规格与真实 GitHub Issue。
4. 历史 archive 与 \`.trae\` 资料，仅作追溯证据。

## 文件职责

- \`specs/current.md\`：当前生效事实，使用全局 \`REQ-####\`。
- \`changes/vX.Y.Z/README.md\`：版本目标、范围、候选项、依赖和发布门禁。
- \`changes/vX.Y.Z/<issue>/spec.md\`：相对于 current spec 的增量；\`tasks.md\`：任务、证据和状态。
- \`changes/archive/**/HIST-####-*\`：历史导入，不能修改为当前事实。
- \`architecture/adr/ADR-####-*.md\`：不可逆或影响广泛的技术决策。

## 状态

变更使用 \`draft\`、\`approved\`、\`in_progress\`、\`released\`、\`cancelled\`。历史验证使用 \`verified\`、\`partially_verified\`、\`unverified\` 或 \`contradictory_evidence\`。禁止把旧 checkbox 直接转为 \`verified\`。

## 版本和链接

目录版本统一 \`vX.Y.Z\`。每次发布前，将已实施增量并回 \`current.md\`，更新 release manifest，并为发布说明补充可验证证据。运行 \`npm run docs:check\` 阻止遗漏映射或归档结构不完整。`,
  "releases/roadmap.md": `# 发布路线图

| 版本 | 状态 | 目标 | 跟踪 |
| --- | --- | --- | --- |
| v1.7.6 | needs_release_verification | 类型安全修复后的当前代码状态 | [登记](v1.7.6.md) |
| v1.8.0 | planned | 后台、知识库和客服去演示化 | [计划](../changes/v1.8.0/README.md) |
| v1.9.0 | planned | 生产部署、运行时配置和质量门禁 | [计划](../changes/v1.9.0/README.md) |
| v2.0.0 | planned | 范围冻结后的上线验收与发布 | [计划](../changes/v2.0.0/README.md) |

GitHub 跟踪：v1.8.0 为 [Issue #1](https://github.com/Dante-Xr/solo-sales/issues/1)，v1.9.0 为 [Issue #2](https://github.com/Dante-Xr/solo-sales/issues/2)，v2.0.0 为 [Issue #3](https://github.com/Dante-Xr/solo-sales/issues/3)。详细功能 Issue 在真正开发前拆分。`,
  "releases/v1.7.0.md": `# v1.7.0 发布记录

- Git tag：` + "`v1.7.0`" + `
- 状态：` + "`released`" + `
- 范围：多支付提供商抽象、统一结账服务、订单状态机和 webhook 幂等处理。
- 证据：Git tag、[RELEASES.md](../../RELEASES.md) 和历史 v1.7 归档。
`,
  "releases/v1.7.6.md": `# v1.7.6 代码版本记录

- 代码版本：` + "`1.7.6`" + `
- Git tag：无同版本 tag；最新 tag 为 ` + "`v1.7.0`" + `。
- 状态：` + "`implemented_untagged`" + `，仍需发布核验。
- 范围：支付、缓存、Bundle、Affiliate、Prisma 等类型边界修复，并新增 ` + "`npm run type-check`" + `。
- 证据：` + "`package.json`" + `、` + "`CHANGELOG.md`" + `、` + "`RELEASES.md`" + `、v1.7.6 历史归档。
`,
  "architecture/overview.md": `# 架构概览

SoloSales 是 Next.js 16 App Router 的模块化单体。页面和 Route Handlers 位于 ` + "`src/app`" + `；服务端业务逻辑在 ` + "`src/server`" + `；Prisma 连接 PostgreSQL；Redis 用于缓存和限流；Better Auth 管理会话；支付通过 provider abstraction 集成 Stripe、支付宝和微信支付。

## 边界

- ` + "`src/app`" + `：前台、后台和 HTTP 边界。
- ` + "`src/server/contracts`" + `：统一成功/错误响应与错误码。
- ` + "`src/server/services`" + `：结账、订单状态、依赖保护、后台任务等业务规则。
- ` + "`src/server/repositories`" + `：Prisma 数据访问封装。
- ` + "`src/server/auth`" + `：会话、认证和 RBAC。
- ` + "`src/server/payments`" + `：支付 provider、工厂和通知处理。
- ` + "`prisma`" + `：数据模型、迁移和受环境变量控制的种子。

API 成功响应采用 ` + "`{ success: true, data, meta? }`" + `；错误响应采用 ` + "`{ success: false, error: { code, message } }`" + `。兼容接口可能保留旧顶层字段。`,
  "architecture/runtime.md": `# 运行链路

请求经 Next.js Route Handler 或 Server Component 进入服务端层；认证和授权在受保护路径执行；服务层以 Zod 校验输入、调用 repository/外部 provider，并通过 contracts 返回标准响应。支付通知必须在验签、金额校验和幂等检查后变更订单与 Payment 状态。

运行依赖：PostgreSQL/Neon、Upstash Redis、Better Auth、支付 provider、邮件服务、可选 AI 客服服务和 Sentry。生产变量必须由托管平台的 Secret Manager 提供；详见 [部署 runbook](../runbooks/deploy-netlify.md)。

后台重任务可以记录为 ` + "`BackgroundJob`" + `。当前资料证明了入队和状态模型；实际消费者、重试和告警能力必须以 v1.9 验收为准。`,
  "architecture/adr/ADR-0001-docs-source-of-truth.md": `---
id: ADR-0001
status: accepted
date: 2026-07-10
---

# ADR-0001 文档事实来源与历史隔离

当前事实由代码、schema、测试、tag 和 ` + "`docs/specs/current.md`" + ` 共同定义。版本变更只在 ` + "`docs/changes`" + ` 表达增量。\`.trae\` 保持只读，并通过 inventory 和 migration map 追溯，不再与 ` + "`docs`" + ` 双写。`,
  "specs/current.md": `---
status: current
code_version: 1.7.6
evidence: package.json, prisma/schema.prisma, src/server, tests, README.md
---

# 当前规格

## 元数据与适用范围

本规格描述当前仓库可观察到的 SoloSales 行为和约束，不承诺未来版本计划中的未完成能力。

## 全局约束

- REQ-0001：服务端状态变更必须在服务端执行输入校验；不得信任客户端计算的订单金额或权限结果。
- REQ-0002：订单、支付、用户、后台和知识库数据访问必须遵守认证、所有者或 RBAC 边界。
- REQ-0003：支付通知必须验证提供商签名、核对金额，并以 provider 事件/交易标识实现幂等处理。
- REQ-0004：生产密钥不得提交到仓库；` + "`npm run audit:secrets`" + ` 是发布前检查的一部分。

## 当前要求

- REQ-0005：商品、分类、购物车、认证用户订单和结账由 Next.js Route Handlers 与服务层提供，订单和支付记录持久化于 PostgreSQL。
- REQ-0006：订单状态包含 ` + "`PENDING`" + `、` + "`PAID`" + `、` + "`SHIPPED`" + `、` + "`DELIVERED`" + `、` + "`CANCELLED`" + `；Payment 状态包含 ` + "`PENDING`" + `、` + "`COMPLETED`" + `、` + "`FAILED`" + `、` + "`REFUNDED`" + `。
- REQ-0007：支付层支持 Stripe、支付宝和微信支付的 provider abstraction；PayPal 不属于 v2.0 上线范围。
- REQ-0008：后台 API、RBAC、商品、订单、评论、营销、导入、分析和知识库能力共享统一契约与错误映射。
- REQ-0009：知识库包含草稿、已发布、归档状态；公开读取不得把草稿或归档内容当成可公开内容。
- REQ-0010：Redis 可用于缓存和限流；外部依赖失败应通过 dependency guard 显式映射，而不是伪造成功。

## 跨领域不变量

- REQ-0011：金额以数据库 Decimal 和服务端重新计算结果为准。
- REQ-0012：同一 ` + "`provider + transactionId`" + ` 组合必须唯一；重复支付通知不得重复改变订单、库存或支付结果。
- REQ-0013：服务端模块不得被 Client Component 直接导入。

## 外部契约

- REQ-0014：认证使用 Better Auth，生产必须配置 ` + "`BETTER_AUTH_URL`" + ` 和 ` + "`BETTER_AUTH_SECRET`" + `。
- REQ-0015：数据库使用 ` + "`DATABASE_URL`" + `；支付 provider 仅在相应密钥完整时可启用。

## 已知限制与弃用行为

- REQ-0016：v1.5 的高并发资料只证明准备与门禁，不构成特定 QPS 容量承诺。
- REQ-0017：后台任务消费者、生产告警和完整 RAG 对外能力属于未来版本验收范围，不能由旧计划或 UI 表象证明已完成。
`,
  "changes/README.md": `# 版本变更

每个版本目录先用 README 定义版本级需求；真正开始开发时，创建真实 GitHub Issue，并以其编号建立子目录。` + "`spec.md`" + ` 只描述相对 [current.md](../specs/current.md) 的增量，` + "`tasks.md`" + ` 记录可执行步骤、验证和进度。

- [v1.8.0](v1.8.0/README.md)
- [v1.9.0](v1.9.0/README.md)
- [v2.0.0](v2.0.0/README.md)
- [历史 archive](archive/)
`,
  "changes/v1.8.0/README.md": `---
version: v1.8.0
status: planned
github_milestone: https://github.com/Dante-Xr/solo-sales/milestone/1
github_tracking_issue: https://github.com/Dante-Xr/solo-sales/issues/1
---

# v1.8.0 后台、RAG 与客服真实化

版本总追踪：[GitHub Issue #1](https://github.com/Dante-Xr/solo-sales/issues/1)。

## 版本目标

让后台订单、商品展示、客服会话、知识库检索和仪表盘反映真实业务状态，清除可购买 mock/fallback 和随机业务指标。

## 范围

- 后台订单展示真实支付、物流和订单状态。
- 客服会话/消息/反馈绑定 owner，知识库管理与公开检索分离。
- 前台商品搜索、首页和列表不展示可购买 mock。
- 移除 dashboard 随机或硬编码业务指标。

## 排除项

- 不把未验证的向量库或注入防护宣传为完整 RAG。
- 不扩大支付或发布范围。

## 依赖与门禁

依赖 v1.7 订单/支付数据和 RBAC 边界。发布前应有真实数据证明、权限测试、i18n 回归检查，并将已采纳增量合并回 ` + "`specs/current.md`" + `。
`,
  "changes/v1.9.0/README.md": `---
version: v1.9.0
status: planned
github_milestone: https://github.com/Dante-Xr/solo-sales/milestone/2
github_tracking_issue: https://github.com/Dante-Xr/solo-sales/issues/2
---

# v1.9.0 生产部署与质量门禁

版本总追踪：[GitHub Issue #2](https://github.com/Dante-Xr/solo-sales/issues/2)。

## 版本目标

建立可复现的生产运行时配置、依赖安全、后台任务消费、CI 门禁和监控告警。

## 范围

- 平台 Secret Manager 提供运行时密钥，缺失关键变量时 fail fast。
- 清理 high audit 和弃用 PayPal SDK，禁止 Redis/邮件静默 mock success。
- 为后台任务建立实际消费者、重试状态和可观测失败记录。
- 将 install、audit、lint、type-check、test、build 纳入 CI，并配置 Sentry 与关键失败告警。

## 排除项

- 不以本地构建成功代替生产运行验证。

## 发布门禁

生产变量、worker、通知处理、Sentry、质量命令和部署文档均须在接近生产环境验证；已实现增量必须回写 current spec。
`,
  "changes/v2.0.0/README.md": `---
version: v2.0.0
status: planned
github_milestone: https://github.com/Dante-Xr/solo-sales/milestone/3
github_tracking_issue: https://github.com/Dante-Xr/solo-sales/issues/3
---

# v2.0.0 上线验收与正式发布

版本总追踪：[GitHub Issue #3](https://github.com/Dante-Xr/solo-sales/issues/3)。

## 版本目标

冻结范围，验证登录、下单、支付、订单追踪、后台运营、客服知识库与生产部署已达到上线标准。

## 范围

- Stripe、支付宝、微信支付成功、失败、通知验签与重复通知幂等验收。
- 匿名和越权访问后台、订单、知识库和财务接口必须被拒绝。
- 生产变量、CI、audit、worker、Sentry 和发布资料完成验收。

## 排除项

- PayPal 和游客下单不进入 Go/No-Go。

## 发布门禁

在接近生产环境通过关键主链路，并通过 ` + "`npm test -- --runInBand`" + `、` + "`npm run lint`" + `、` + "`npm run type-check`" + `、` + "`npm run audit:secrets`" + `、` + "`npm run build`" + `。`,
  "how-to/configure-payment-providers.md": `# 配置支付提供商

1. 在平台 Secret Manager 中配置 ` + "`ENABLED_PAYMENT_PROVIDERS`" + `，只列出已具备完整凭据的 provider。
2. 配置 Stripe 的 publishable key、secret key 和 webhook secret；配置支付宝和微信支付所需的应用、证书与通知地址凭据。
3. 在非生产环境先完成 provider 测试通知，确认签名验证、金额校验和重复通知幂等。
4. 不提交 \`.env\` 或私钥；运行 ` + "`npm run audit:secrets`" + `。

变量名称和责任边界见 [支付配置参考](../reference/payment-configuration.md)。`,
  "reference/payment-configuration.md": `# 支付配置参考

| 配置 | 用途 | 约束 |
| --- | --- | --- |
| ` + "`ENABLED_PAYMENT_PROVIDERS`" + ` | 启用 provider 列表 | 只启用凭据完整的 provider |
| ` + "`STRIPE_PUBLIC_KEY`" + ` | Stripe 客户端标识 | 非 secret |
| ` + "`STRIPE_SECRET_KEY`" + ` | Stripe 服务端调用 | 平台 Secret Manager |
| ` + "`STRIPE_WEBHOOK_SECRET`" + ` | Stripe 通知验签 | 平台 Secret Manager |
| 支付宝/微信支付凭据 | API 调用、证书/通知验签 | 平台 Secret Manager，不入库 |

Payment 记录以 ` + "`provider`" + ` 和 ` + "`transactionId`" + ` 标识第三方交易；该组合在数据库中唯一。任何 provider 通知均应先验签、校验金额和执行幂等检查。`,
  "runbooks/deploy-netlify.md": `# Netlify 部署 Runbook

1. 在 Netlify 项目 Secret Manager 配置数据库、Better Auth、Redis、支付、邮件和 Sentry 变量；不要把运行时密钥写入 ` + "`netlify.toml`" + `。
2. 确认 ` + "`BETTER_AUTH_URL`" + ` 与实际部署域名一致，并设置 ` + "`BETTER_AUTH_SECRET`" + `。
3. 部署前运行质量门禁；部署后执行健康检查、认证、支付通知和关键读取路径验证。
4. 记录 deploy ID、环境变量变更、Prisma migration、验证结果和回滚点。
`,
  "runbooks/release.md": `# 发布 Runbook

1. 确认版本 README 的范围和排除项，所有已实施 delta 已并入 current spec。
2. 运行 ` + "`npm run docs:check`" + `、测试、lint、type-check、secret audit 与 build。
3. 核对 package 版本、Git tag、HEAD 和 release manifest；差异必须明确标记，不能静默发布。
4. 创建 tag 和 GitHub Release，更新 ` + "`docs/releases/vX.Y.Z.md`" + ` 与 manifest 的证据。
`,
  "runbooks/rollback.md": `# 回滚 Runbook

1. 停止或限制受影响发布，记录时间、版本、部署 ID 和用户影响。
2. 回滚到已验证的部署；数据库迁移按可逆性和备份策略处理，禁止盲目降级。
3. 验证健康检查、认证、下单、支付通知和后台关键读取。
4. 将原因、缓解措施和后续 Issue 关联到对应版本，不修改历史 archive 伪造完成状态。
`,
  "templates/version-readme.md": `---
version: vX.Y.Z
status: draft
github_milestone: pending
github_tracking_issue: pending
---

# vX.Y.Z 名称

## 版本目标

## 范围

## 排除项

## 候选功能与依赖

## 发布门禁
`,
  "templates/change-spec.md": `---
issue: NNNN
version: vX.Y.Z
status: draft
---

# NNNN 变更标题

## 相对 current spec 的增量

## 验收条件

## 非目标
`,
  "templates/tasks.md": `---
issue: NNNN
status: draft
---

# NNNN 任务

## 实施步骤

## 验证证据

## 风险与阻塞
`,
  "templates/adr.md": `---
id: ADR-0000
status: proposed
date: YYYY-MM-DD
---

# ADR-0000 决策标题

## 背景

## 决策

## 后果
`,
  "legacy/README.md": `# 旧文档迁移证据

\`.trae/documents\`、\`.trae/plans\`、\`.trae/specs\` 保持原状且不作为当前规格。` + "`inventory.json`" + ` 记录每份源文档的 SHA-256、标题、版本、类型、处置和目标；` + "`migration-map.md`" + ` 提供可读映射。运行 ` + "`npm run docs:check`" + ` 检查 180/180 覆盖与源集合未变。`,
}

for (const [relativePath, content] of Object.entries(staticDocuments)) write(relativePath, content)

const sourceInventory = collectSourceInventory(root)
const specDirectories = fs.readdirSync(path.join(root, ".trae/specs"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()
const sourceToTargets = new Map()
let id = 1

for (const directory of specDirectories) {
  const sources = fs.readdirSync(path.join(root, ".trae/specs", directory))
    .filter((name) => name.endsWith(".md"))
    .map((name) => `.trae/specs/${directory}/${name}`)
  const combined = sources.map(sourceText).join("\n")
  const version = normalizeVersion(combined.match(/v\d+\.\d+(?:\.\d+)?/i)?.[0] || directory)
  if (futureVersions.has(version)) {
    for (const source of sources) sourceToTargets.set(source, [`docs/changes/${version}/README.md`])
    continue
  }
  const archiveId = `HIST-${String(id++).padStart(4, "0")}`
  const targets = buildArchive(version, archiveId, directory, sources)
  for (const source of sources) sourceToTargets.set(source, targets)
}

const generalGroups = new Map()
for (const entry of sourceInventory.entries) {
  if (sourceToTargets.has(entry.source)) continue
  const content = sourceText(entry.source)
  const version = normalizeVersion(entry.version || content.match(/v\d+\.\d+(?:\.\d+)?/i)?.[0])
  const isFuture = futureVersions.has(version)
  const isPayment = /payment.*(guide|reference)|支付.*(指南|参考)/i.test(`${entry.source}\n${entry.title}`)
  const isDeploy = /deploy|部署/i.test(`${entry.source}\n${entry.title}`)
  const isArchitecture = /architecture|架构|framework/i.test(`${entry.source}\n${entry.title}`)
  if (isFuture) {
    sourceToTargets.set(entry.source, [`docs/changes/${version}/README.md`])
  } else if (isPayment) {
    sourceToTargets.set(entry.source, ["docs/how-to/configure-payment-providers.md", "docs/reference/payment-configuration.md"])
  } else if (isDeploy) {
    sourceToTargets.set(entry.source, ["docs/runbooks/deploy-netlify.md"])
  } else if (isArchitecture) {
    sourceToTargets.set(entry.source, ["docs/architecture/overview.md", "docs/architecture/runtime.md"])
  } else {
    const key = version
    if (!generalGroups.has(key)) generalGroups.set(key, [])
    generalGroups.get(key).push(entry.source)
  }
}

for (const [version, sources] of generalGroups) {
  const archiveId = `HIST-${String(id++).padStart(4, "0")}`
  const targets = buildArchive(version, archiveId, `${version} legacy records`, sources)
  for (const source of sources) sourceToTargets.set(source, targets)
}

const inventoryEntries = sourceInventory.entries.map((entry) => {
  const targets = sourceToTargets.get(entry.source)
  const future = targets.some((target) => /docs\/changes\/v(?:1\.8\.0|1\.9\.0|2\.0\.0)\/README\.md/.test(target))
  const disposition = future ? "future_planning" : targets.some((target) => target.includes("archive")) ? "historical_only" : "consolidated"
  return { ...entry, disposition, targets }
})

write("legacy/inventory.json", JSON.stringify({
  schema_version: 1,
  source_directories: [".trae/documents", ".trae/plans", ".trae/specs"],
  source_count: sourceInventory.entries.length,
  aggregate_sha256: sourceInventory.aggregateSha256,
  entries: inventoryEntries,
}, null, 2))

write("legacy/migration-map.md", `# 迁移映射\n\n源文件总数：${inventoryEntries.length}。每个源文档均保留 hash，且至少映射到一个新文档。\n\n| 源文件 | 处置 | 目标 | 原因 |\n| --- | --- | --- | --- |\n${inventoryEntries.map((entry) => `| \`${entry.source}\` | ${entry.disposition} | ${entry.targets.map((target) => `\`${target}\``).join("<br>")} | ${entry.disposition === "future_planning" ? "未来版本计划汇总" : entry.disposition === "historical_only" ? "历史导入与证据保留" : "按当前用途合并"} |`).join("\n")}`)

write("releases/manifest.json", JSON.stringify({
  schema_version: 1,
  generated_at: "2026-07-10",
  versions: [
    { version: "v1.7.0", code_version: "1.7.0", git_tag: "v1.7.0", release_status: "released", evidence: ["git tag", "RELEASES.md"] },
    { version: "v1.7.6", code_version: "1.7.6", git_tag: null, latest_git_tag: "v1.7.0", head: "414a972613b052d785d5a026fc1e85cde925ed46", release_status: "needs_release_verification", evidence: ["package.json", "CHANGELOG.md", "RELEASES.md"] },
    { version: "v1.8.0", release_status: "planned", github_milestone: 1, github_tracking_issue: 1 },
    { version: "v1.9.0", release_status: "planned", github_milestone: 2, github_tracking_issue: 2 },
    { version: "v2.0.0", release_status: "planned", github_milestone: 3, github_tracking_issue: 3 }
  ]
}, null, 2))

console.log(`Migrated ${inventoryEntries.length}/${sourceInventory.entries.length} source documents.`)
