/**
 * ============================================
 * 后台管理员权限数据种子
 * 用于初始化权限、角色和可选初始管理员
 * ============================================
 */

import { PrismaClient, PermissionType } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const PERMISSIONS = [
  // Dashboard 仪表盘
  { name: "dashboard.view", label: "查看仪表盘", description: "访问仪表盘页面", type: PermissionType.PAGE },
  { name: "dashboard.analytics", label: "查看数据分析", description: "查看销售统计和分析", type: PermissionType.ACTION },
  { name: "analytics.view", label: "查看分析 API", description: "访问分析报表 API", type: PermissionType.ACTION },
  { name: "currency.update", label: "更新汇率", description: "刷新和写入汇率数据", type: PermissionType.ACTION },

  // Products 商品管理
  { name: "products.view", label: "查看商品", description: "访问商品列表", type: PermissionType.PAGE },
  { name: "products.create", label: "创建商品", description: "创建新商品", type: PermissionType.ACTION },
  { name: "products.edit", label: "编辑商品", description: "修改商品信息", type: PermissionType.ACTION },
  { name: "products.update", label: "更新商品", description: "更新商品信息", type: PermissionType.ACTION },
  { name: "products.delete", label: "删除商品", description: "删除商品", type: PermissionType.ACTION },
  { name: "products.import", label: "导入商品", description: "执行商品导入", type: PermissionType.ACTION },

  // Categories 分类管理
  { name: "categories.create", label: "创建分类", description: "创建商品分类", type: PermissionType.ACTION },
  { name: "categories.update", label: "更新分类", description: "更新商品分类", type: PermissionType.ACTION },
  { name: "categories.delete", label: "删除分类", description: "删除商品分类", type: PermissionType.ACTION },

  // Orders 订单管理
  { name: "orders.view", label: "查看订单", description: "访问订单列表", type: PermissionType.PAGE },
  { name: "orders.edit", label: "编辑订单", description: "修改订单状态", type: PermissionType.ACTION },
  { name: "orders.update", label: "更新订单", description: "更新订单状态和物流信息", type: PermissionType.ACTION },
  { name: "orders.delete", label: "删除订单", description: "删除订单", type: PermissionType.ACTION },

  // Customers 客户管理
  { name: "customers.view", label: "查看客户", description: "访问客户列表", type: PermissionType.PAGE },
  { name: "customers.edit", label: "编辑客户", description: "修改客户信息", type: PermissionType.ACTION },

  // Points 积分管理
  { name: "points.view", label: "查看积分", description: "查看客户积分账户和流水", type: PermissionType.PAGE },
  { name: "points.update", label: "更新积分", description: "创建积分账户、发放和兑换积分", type: PermissionType.ACTION },

  // Coupons 优惠券管理
  { name: "coupons.view", label: "查看优惠券", description: "查看优惠券和折扣规则", type: PermissionType.PAGE },
  { name: "coupons.update", label: "更新优惠券", description: "创建、更新和删除优惠券", type: PermissionType.ACTION },

  // Reviews 评论审核
  { name: "reviews.view", label: "查看评论", description: "查看评论审核列表", type: PermissionType.PAGE },
  { name: "reviews.update", label: "审核评论", description: "审核、精选和删除评论", type: PermissionType.ACTION },

  // Abandoned carts 废弃购物车
  { name: "abandonedCarts.view", label: "查看废弃购物车", description: "查看废弃购物车恢复数据", type: PermissionType.PAGE },
  { name: "abandonedCarts.update", label: "处理废弃购物车", description: "手动触发废弃购物车检查和恢复任务", type: PermissionType.ACTION },

  // Bundles 商品组合管理
  { name: "bundles.view", label: "查看商品组合", description: "查看商品组合配置", type: PermissionType.PAGE },
  { name: "bundles.update", label: "更新商品组合", description: "创建、更新和删除商品组合", type: PermissionType.ACTION },

  // Sequences 邮件序列管理
  { name: "sequences.view", label: "查看邮件序列", description: "查看营销邮件序列", type: PermissionType.PAGE },
  { name: "sequences.update", label: "更新邮件序列", description: "创建、更新、删除和触发邮件序列", type: PermissionType.ACTION },

  // Affiliates 联盟分销管理
  { name: "affiliates.view", label: "查看联盟分销", description: "查看联盟会员、佣金、链接和提现", type: PermissionType.PAGE },
  { name: "affiliates.update", label: "更新联盟分销", description: "更新联盟会员、链接、佣金转化和提现", type: PermissionType.ACTION },

  // Knowledge 知识库
  { name: "knowledge.view", label: "查看知识库", description: "访问知识库", type: PermissionType.PAGE },
  { name: "knowledge.create", label: "创建知识", description: "创建知识条目", type: PermissionType.ACTION },
  { name: "knowledge.edit", label: "编辑知识", description: "编辑知识条目", type: PermissionType.ACTION },
  { name: "knowledge.update", label: "更新知识", description: "更新知识条目", type: PermissionType.ACTION },
  { name: "knowledge.delete", label: "删除知识", description: "删除知识条目", type: PermissionType.ACTION },
  { name: "knowledge.categories.create", label: "创建知识分类", description: "创建知识库分类", type: PermissionType.ACTION },
  { name: "knowledge.categories.delete", label: "删除知识分类", description: "删除知识库分类", type: PermissionType.ACTION },

  // Import 导入管理
  { name: "import.view", label: "查看导入", description: "访问导入管理", type: PermissionType.PAGE },
  { name: "import.execute", label: "执行导入", description: "执行商品导入", type: PermissionType.ACTION },

  // Inventory 库存管理
  { name: "inventory.view", label: "查看库存", description: "查看库存预警和库存报表", type: PermissionType.PAGE },
  { name: "inventory.update", label: "更新库存配置", description: "更新库存预警配置", type: PermissionType.ACTION },

  // Chat 客服管理
  { name: "chat.view", label: "查看客服", description: "访问客服聊天", type: PermissionType.PAGE },

  // Users 用户管理 (后台管理员)
  { name: "users.view", label: "查看用户", description: "访问管理员用户列表", type: PermissionType.PAGE },
  { name: "users.create", label: "创建用户", description: "创建管理员用户", type: PermissionType.ACTION },
  { name: "users.edit", label: "编辑用户", description: "修改管理员用户", type: PermissionType.ACTION },
  { name: "users.update", label: "更新用户", description: "更新管理员用户", type: PermissionType.ACTION },
  { name: "users.delete", label: "删除用户", description: "删除管理员用户", type: PermissionType.ACTION },

  // Roles 角色管理
  { name: "roles.view", label: "查看角色", description: "访问角色列表", type: PermissionType.PAGE },
  { name: "roles.create", label: "创建角色", description: "创建角色", type: PermissionType.ACTION },
  { name: "roles.edit", label: "编辑角色", description: "修改角色", type: PermissionType.ACTION },
  { name: "roles.update", label: "更新角色", description: "更新角色", type: PermissionType.ACTION },
  { name: "roles.delete", label: "删除角色", description: "删除角色", type: PermissionType.ACTION },

  // Permissions 权限管理
  { name: "permissions.view", label: "查看权限", description: "访问权限列表", type: PermissionType.PAGE },
  { name: "permissions.create", label: "创建权限", description: "创建权限", type: PermissionType.ACTION },
  { name: "permissions.edit", label: "编辑权限", description: "修改权限", type: PermissionType.ACTION },
  { name: "permissions.update", label: "更新权限", description: "更新权限", type: PermissionType.ACTION },
  { name: "permissions.delete", label: "删除权限", description: "删除权限", type: PermissionType.ACTION },

  // Settings 系统设置
  { name: "settings.view", label: "查看设置", description: "访问系统设置", type: PermissionType.PAGE },
  { name: "settings.edit", label: "编辑设置", description: "修改系统设置", type: PermissionType.ACTION },
  { name: "worker.view", label: "查看任务调度", description: "查看认证邮件 worker 状态、运行记录与死信", type: PermissionType.PAGE },
  { name: "worker.manage", label: "管理任务调度", description: "配置、启停和手动执行认证邮件 worker", type: PermissionType.ACTION },
]

async function main() {
  console.log("开始初始化后台管理员数据...")

  // 1. 创建权限
  console.log("创建权限...")
  const createdPermissions = []
  for (const perm of PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { name: perm.name },
    })
    if (!existing) {
      const created = await prisma.permission.create({
        data: perm,
      })
      createdPermissions.push(created)
      console.log(`  创建权限: ${perm.name}`)
    } else {
      createdPermissions.push(existing)
      console.log(`  权限已存在: ${perm.name}`)
    }
  }

  // 2. 创建角色
  console.log("创建角色...")

  // 超级管理员 - 拥有所有权限
  const superAdminPerms = createdPermissions.map((p) => p.id)
  const superAdmin = await prisma.role.upsert({
    where: { name: "super_admin" },
    update: {
      label: "超级管理员",
      description: "拥有系统所有权限",
      permissions: { set: superAdminPerms.map((id) => ({ id })) },
    },
    create: {
      name: "super_admin",
      label: "超级管理员",
      description: "拥有系统所有权限",
      permissions: { connect: superAdminPerms.map((id) => ({ id })) },
    },
  })
  console.log(`  创建角色: ${superAdmin.name}`)

  // 运营管理员 - 部分权限
  const operatorPerms = createdPermissions
    .filter((p) =>
      [
        "dashboard.view",
        "dashboard.analytics",
        "analytics.view",
        "products.view",
        "products.create",
        "products.edit",
        "products.update",
        "products.delete",
        "products.import",
        "categories.create",
        "categories.update",
        "categories.delete",
        "orders.view",
        "orders.edit",
        "orders.update",
        "customers.view",
        "customers.edit",
        "knowledge.view",
        "knowledge.create",
        "knowledge.edit",
        "knowledge.update",
        "knowledge.delete",
        "knowledge.categories.create",
        "knowledge.categories.delete",
        "import.view",
        "import.execute",
        "inventory.view",
        "inventory.update",
        "chat.view",
        "settings.view",
        "settings.edit",
      ].includes(p.name)
    )
    .map((p) => p.id)

  const operator = await prisma.role.upsert({
    where: { name: "operator" },
    update: {
      label: "运营管理员",
      description: "负责日常运营管理",
      permissions: { set: operatorPerms.map((id) => ({ id })) },
    },
    create: {
      name: "operator",
      label: "运营管理员",
      description: "负责日常运营管理",
      permissions: { connect: operatorPerms.map((id) => ({ id })) },
    },
  })
  console.log(`  创建角色: ${operator.name}`)

  // 客服 - 基础权限
  const supportPerms = createdPermissions
    .filter((p) =>
      [
        "dashboard.view",
        "customers.view",
        "customers.edit",
        "orders.view",
        "orders.edit",
        "orders.update",
        "knowledge.view",
        "chat.view",
      ].includes(p.name)
    )
    .map((p) => p.id)

  const support = await prisma.role.upsert({
    where: { name: "support" },
    update: {
      label: "客服",
      description: "客服人员",
      permissions: { set: supportPerms.map((id) => ({ id })) },
    },
    create: {
      name: "support",
      label: "客服",
      description: "客服人员",
      permissions: { connect: supportPerms.map((id) => ({ id })) },
    },
  })
  console.log(`  创建角色: ${support.name}`)

  // 3. 可选创建初始管理员。生产环境必须通过环境变量显式提供，脚本不内置默认凭据。
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD
  const seedAdminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin"

  if (seedAdminEmail && seedAdminPassword) {
    console.log("创建初始管理员...")
    const hashedPassword = await bcrypt.hash(seedAdminPassword, 10)

    const adminUser = await prisma.adminUser.upsert({
      where: { email: seedAdminEmail },
      update: {
        username: seedAdminUsername,
        password: hashedPassword,
        roleId: superAdmin.id,
        isActive: true,
      },
      create: {
        username: seedAdminUsername,
        email: seedAdminEmail,
        password: hashedPassword,
        roleId: superAdmin.id,
        isActive: true,
      },
    })
    console.log(`  初始管理员已创建或更新: ${adminUser.email}`)
  } else {
    console.log("未设置 SEED_ADMIN_EMAIL 和 SEED_ADMIN_PASSWORD，跳过初始管理员创建。")
  }

  console.log("后台管理员数据初始化完成!")
}

main()
  .catch((e) => {
    console.error("初始化失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
