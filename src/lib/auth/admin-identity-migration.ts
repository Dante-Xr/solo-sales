export type AdminIdentityRecord = {
  id: string
  email: string
  username: string
  userId: string | null
  password: string | null
}

export type IdentityUserRecord = { id: string; email: string; role: string }
export type CredentialAccountRecord = { userId: string; providerId: string }

export type AdminIdentityMigrationOperation = {
  adminId: string
  normalizedEmail: string
  username: string
  userId: string | null
  createUser: boolean
  createCredentialAccount: boolean
  credentialPassword: string | null
  clearLegacyPassword: boolean
}

export function normalizeIdentityEmail(email: string) {
  return email.trim().toLowerCase()
}

export function buildAdminIdentityMigrationPlan(input: {
  admins: AdminIdentityRecord[]
  users: IdentityUserRecord[]
  credentialAccounts: CredentialAccountRecord[]
}) {
  const conflicts: string[] = []
  const adminByEmail = new Map<string, AdminIdentityRecord>()
  const userByEmail = new Map<string, IdentityUserRecord>()
  const userById = new Map(input.users.map((user) => [user.id, user]))
  const credentialUserIds = new Set(
    input.credentialAccounts
      .filter((account) => account.providerId === "credential")
      .map((account) => account.userId),
  )

  for (const admin of input.admins) {
    const email = normalizeIdentityEmail(admin.email)
    if (!email) conflicts.push(`invalid_admin_email:${admin.id}`)
    if (adminByEmail.has(email)) conflicts.push(`duplicate_admin_email:${email}`)
    adminByEmail.set(email, admin)
  }

  for (const user of input.users) {
    const email = normalizeIdentityEmail(user.email)
    if (!email) conflicts.push(`invalid_user_email:${user.id}`)
    if (userByEmail.has(email)) conflicts.push(`duplicate_user_email:${email}`)
    userByEmail.set(email, user)
  }

  const operations: AdminIdentityMigrationOperation[] = []
  for (const admin of input.admins) {
    const normalizedEmail = normalizeIdentityEmail(admin.email)
    const emailUser = userByEmail.get(normalizedEmail)
    const linkedUser = admin.userId ? userById.get(admin.userId) : undefined
    const user = linkedUser ?? emailUser

    if (admin.userId && !linkedUser) {
      conflicts.push(`linked_user_missing:${admin.id}`)
      continue
    }
    if (linkedUser && normalizeIdentityEmail(linkedUser.email) !== normalizedEmail) {
      conflicts.push(`linked_user_email_mismatch:${admin.id}`)
      continue
    }
    if (emailUser && emailUser.role !== "admin") {
      conflicts.push(`ordinary_user_email_collision:${normalizedEmail}`)
      continue
    }
    if (linkedUser && linkedUser.role !== "admin") {
      conflicts.push(`linked_user_not_admin:${admin.id}`)
      continue
    }
    if (!admin.password && !user?.id) {
      conflicts.push(`missing_legacy_credential:${admin.id}`)
      continue
    }
    if (!admin.password && user && !credentialUserIds.has(user.id)) {
      conflicts.push(`missing_credential_account:${admin.id}`)
      continue
    }

    operations.push({
      adminId: admin.id,
      normalizedEmail,
      username: admin.username,
      userId: user?.id ?? null,
      createUser: !user,
      createCredentialAccount: !user || !credentialUserIds.has(user.id),
      credentialPassword: admin.password,
      clearLegacyPassword: Boolean(admin.password),
    })
  }

  return { conflicts: [...new Set(conflicts)].sort(), operations: conflicts.length ? [] : operations }
}
