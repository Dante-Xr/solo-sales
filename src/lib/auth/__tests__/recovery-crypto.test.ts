import {
  decryptRecoveryPayload,
  encryptRecoveryPayload,
  generateOtp,
  hashRecoverySecret,
  verifyRecoverySecret,
} from "../recovery-crypto"

describe("recovery crypto", () => {
  const keyring = {
    activeKeyId: "2026-07",
    keys: {
      "2026-06": "0123456789abcdef0123456789abcdef",
      "2026-07": "abcdef0123456789abcdef0123456789",
    },
  }

  it("creates a six-digit OTP and verifies only its hash", () => {
    const otp = generateOtp(() => 0.123456)
    const hash = hashRecoverySecret(otp, "test-hmac-secret")

    expect(otp).toBe("123456")
    expect(hash).not.toBe(otp)
    expect(verifyRecoverySecret(otp, hash, "test-hmac-secret")).toBe(true)
    expect(verifyRecoverySecret("000000", hash, "test-hmac-secret")).toBe(false)
  })

  it("encrypts queue payloads with an active key id", () => {
    const payload = encryptRecoveryPayload({ email: "user@example.com", otp: "123456" }, keyring)

    expect(payload.keyId).toBe("2026-07")
    expect(JSON.stringify(payload)).not.toContain("user@example.com")
    expect(decryptRecoveryPayload(payload, keyring)).toEqual({ email: "user@example.com", otp: "123456" })
  })

  it("supports decryption with a retained old key", () => {
    const oldKeyring = { ...keyring, activeKeyId: "2026-06" }
    const payload = encryptRecoveryPayload({ token: "one-time-token" }, oldKeyring)

    expect(decryptRecoveryPayload(payload, keyring)).toEqual({ token: "one-time-token" })
  })
})
