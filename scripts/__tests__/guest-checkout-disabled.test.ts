import fs from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(__dirname, "../..")

function readProjectFile(file: string) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8")
}

describe("guest checkout disabled before v2.0 launch", () => {
  it("does not expose guest checkout in the enhanced checkout modal", () => {
    const source = readProjectFile("src/components/checkout/EnhancedCheckoutModal.tsx")

    expect(source).not.toContain("GuestCheckoutForm")
    expect(source).not.toContain("handleGuestCheckout")
    expect(source).not.toContain('"guest"')
    expect(source).not.toContain("guestCheckout")
    expect(source).not.toContain("loginOrGuest")
  })

  it("does not expose a guest tab or guest callback in the auth modal", () => {
    const source = readProjectFile("src/components/auth/AuthModal.tsx")

    expect(source).not.toContain("GuestCheckoutForm")
    expect(source).not.toContain("onGuestCheckout")
    expect(source).not.toContain('value="guest"')
    expect(source).not.toContain("guestTitle")
    expect(source).not.toContain("guestDesc")
  })

  it("does not leave guest checkout copy in locale messages", () => {
    for (const file of ["src/i18n/messages/en.json", "src/i18n/messages/zh.json"]) {
      const source = readProjectFile(file)

      expect(source).not.toContain('"guestCheckout"')
      expect(source).not.toContain('"guestTitle"')
      expect(source).not.toContain('"guestDesc"')
      expect(source).not.toContain('"loginOrGuest"')
    }
  })

  it("does not keep the deprecated guest checkout form component", () => {
    expect(fs.existsSync(path.join(repoRoot, "src/components/auth/GuestCheckoutForm.tsx"))).toBe(false)
  })
})
