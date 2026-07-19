import { buildAdminIdentityMigrationPlan } from "../admin-identity-migration"

describe("buildAdminIdentityMigrationPlan", () => {
  it("rejects case-insensitive email collisions before any identity is migrated", () => {
    const plan = buildAdminIdentityMigrationPlan({
      admins: [
        { id: "admin-1", email: "Admin@Example.com", username: "admin", userId: null, password: "hash-1" },
      ],
      users: [
        { id: "user-1", email: "admin@example.com", role: "user" },
      ],
      credentialAccounts: [],
    })

    expect(plan.conflicts).toEqual(["ordinary_user_email_collision:admin@example.com"])
    expect(plan.operations).toEqual([])
  })

  it("plans normalized User, AdminUser and credential Account records for an unlinked administrator", () => {
    const plan = buildAdminIdentityMigrationPlan({
      admins: [
        { id: "admin-1", email: " Admin@Example.com ", username: "admin", userId: null, password: "legacy-bcrypt-hash" },
      ],
      users: [],
      credentialAccounts: [],
    })

    expect(plan.conflicts).toEqual([])
    expect(plan.operations).toEqual([
      expect.objectContaining({
        adminId: "admin-1",
        normalizedEmail: "admin@example.com",
        createUser: true,
        createCredentialAccount: true,
        credentialPassword: "legacy-bcrypt-hash",
      }),
    ])
  })

  it("requires an existing linked administrator to have a credential account", () => {
    const plan = buildAdminIdentityMigrationPlan({
      admins: [
        { id: "admin-1", email: "admin@example.com", username: "admin", userId: "user-1", password: "legacy-bcrypt-hash" },
      ],
      users: [{ id: "user-1", email: "admin@example.com", role: "admin" }],
      credentialAccounts: [],
    })

    expect(plan.conflicts).toEqual([])
    expect(plan.operations[0]).toEqual(expect.objectContaining({
      createUser: false,
      createCredentialAccount: true,
    }))
  })
})
