jest.mock("bcryptjs", () => ({ hash: jest.fn().mockResolvedValue("new-account-hash") }))

import { completeCliAdminRecovery } from "../cli-admin-recovery-service"

describe("completeCliAdminRecovery", () => {
  it("atomically consumes a CLI token and updates only the credential account", async () => {
    const tx = {
      verification: { findUnique: jest.fn().mockResolvedValue({ value: "user-1" }), deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
      adminUser: { findFirst: jest.fn().mockResolvedValue({ id: "admin-1", email: "admin@example.com", userId: "user-1" }) },
      account: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      session: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
    }
    const db = {
      $transaction: jest.fn(async (callback: (database: typeof tx) => Promise<boolean>) => callback(tx)),
      accountRecoveryAudit: { create: jest.fn().mockResolvedValue({}) },
    }

    await expect(completeCliAdminRecovery({
      db: db as never,
      token: "recovery-token",
      password: "Secure!Password1",
      hmacSecret: "audit-secret",
    })).resolves.toBe(true)

    expect(tx.verification.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "reset-password:recovery-token", identifier: "cli-superadmin-recovery" }),
    }))
    expect(tx.account.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "user-1", providerId: "credential" },
      data: { password: "new-account-hash" },
    }))
    expect(tx.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } })
  })

  it("rejects a replayed CLI token without changing credentials", async () => {
    const tx = {
      verification: { findUnique: jest.fn().mockResolvedValue({ value: "user-1" }), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      adminUser: { findFirst: jest.fn() },
      account: { updateMany: jest.fn() },
      session: { deleteMany: jest.fn() },
    }
    const db = {
      $transaction: jest.fn(async (callback: (database: typeof tx) => Promise<boolean>) => callback(tx)),
      accountRecoveryAudit: { create: jest.fn().mockResolvedValue({}) },
    }

    await expect(completeCliAdminRecovery({
      db: db as never,
      token: "recovery-token",
      password: "Secure!Password1",
      hmacSecret: "audit-secret",
    })).resolves.toBe(false)

    expect(tx.account.updateMany).not.toHaveBeenCalled()
  })
})
