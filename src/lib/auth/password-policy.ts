const COMMON_PASSWORDS = new Set([
  "Password1!",
  "Admin123!",
  "Welcome1!",
  "Qwerty123!",
])

export type PasswordValidationResult =
  | { valid: true }
  | { valid: false; reason: "length" | "character_class" | "whitespace" | "common" | "reuse" }

export function validatePassword(
  password: string,
  options: { currentPasswordMatches?: boolean } = {}
): PasswordValidationResult {
  if (options.currentPasswordMatches) return { valid: false, reason: "reuse" }
  if (password.length < 8 || password.length > 50) return { valid: false, reason: "length" }
  if (/\s|[\u0000-\u001f\u007f]/.test(password)) return { valid: false, reason: "whitespace" }
  if (COMMON_PASSWORDS.has(password)) return { valid: false, reason: "common" }

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasAsciiPunctuation = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password)

  if (!hasUpper || !hasLower || !hasNumber || !hasAsciiPunctuation) {
    return { valid: false, reason: "character_class" }
  }

  return { valid: true }
}
