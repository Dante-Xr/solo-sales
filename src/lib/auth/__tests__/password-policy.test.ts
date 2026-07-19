import { validatePassword } from "../password-policy"

describe("validatePassword", () => {
  it("accepts a password with all required character classes", () => {
    expect(validatePassword("ValidPass1!")).toEqual({ valid: true })
  })

  it.each([
    "short1!",
    "lowercase1!",
    "UPPERCASE1!",
    "NoNumber!",
    "NoSymbol1A",
    "Space Pass1!",
    "a".repeat(51) + "A1!",
  ])("rejects a password outside the approved policy: %s", (password) => {
    expect(validatePassword(password).valid).toBe(false)
  })

  it("rejects common passwords even when they meet the complexity rule", () => {
    expect(validatePassword("Password1!").valid).toBe(false)
  })

  it("rejects reuse of the current password", () => {
    expect(validatePassword("ValidPass1!", { currentPasswordMatches: true }).valid).toBe(false)
  })
})
