import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto"

export type RecoveryKeyring = {
  activeKeyId: string
  keys: Record<string, string>
}

export type EncryptedRecoveryPayload = {
  keyId: string
  iv: string
  authTag: string
  ciphertext: string
}

export function generateOtp(random: () => number = () => randomInt(0, 1_000_000) / 1_000_000) {
  return Math.floor(random() * 1_000_000).toString().padStart(6, "0")
}

export function hashRecoverySecret(secret: string, hmacSecret: string) {
  return createHmac("sha256", hmacSecret).update(secret).digest("hex")
}

export function verifyRecoverySecret(secret: string, expectedHash: string, hmacSecret: string) {
  const actual = Buffer.from(hashRecoverySecret(secret, hmacSecret), "hex")
  const expected = Buffer.from(expectedHash, "hex")

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function encryptRecoveryPayload(payload: Record<string, string>, keyring: RecoveryKeyring): EncryptedRecoveryPayload {
  const key = resolveKey(keyring.activeKeyId, keyring)
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()])

  return {
    keyId: keyring.activeKeyId,
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  }
}

export function decryptRecoveryPayload(payload: EncryptedRecoveryPayload, keyring: RecoveryKeyring) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    resolveKey(payload.keyId, keyring),
    Buffer.from(payload.iv, "base64"),
  )
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"))

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ])

  return JSON.parse(plaintext.toString("utf8")) as Record<string, string>
}

function resolveKey(keyId: string, keyring: RecoveryKeyring) {
  const key = keyring.keys[keyId]
  if (!key) {
    throw new Error(`Missing recovery encryption key: ${keyId}`)
  }

  const bytes = Buffer.from(key, "utf8")
  if (bytes.length !== 32) {
    throw new Error("Recovery encryption keys must be exactly 32 bytes")
  }

  return bytes
}
