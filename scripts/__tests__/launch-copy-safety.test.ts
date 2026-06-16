import { readFileSync } from "node:fs"
import { join } from "node:path"

describe("v1.6 launch copy safety", () => {
  const root = process.cwd()

  function read(path: string) {
    return readFileSync(join(root, path), "utf8")
  }

  it("does not expose default admin credentials in login UI or i18n", () => {
    const files = [
      "src/app/[locale]/admin/(auth)/login/page.tsx",
      "src/i18n/messages/zh.json",
      "src/i18n/messages/en.json",
    ]

    for (const file of files) {
      const content = read(file)
      expect(content).not.toMatch(/admin@solosales\.com|Admin@123456|defaultAccount|默认账号/)
    }
  })

  it("does not expose PayPal as a production payment method in customer-facing UI", () => {
    const files = [
      "src/components/checkout/CheckoutModal.tsx",
      "src/components/storefront/StorefrontFooter.tsx",
      "src/components/product/TrustBadges.tsx",
      "src/app/[locale]/faq/page.tsx",
      "src/app/[locale]/faq/__tests__/page.test.tsx",
      "src/i18n/messages/zh.json",
      "src/i18n/messages/en.json",
    ]

    for (const file of files) {
      expect(read(file)).not.toMatch(/PayPal|paypal|PAYPAL/)
    }
  })

  it("does not document PayPal as a required or launched payment method", () => {
    const readme = read("README.md")

    expect(readme).not.toMatch(/Stripe \+ PayPal|Stripe, PayPal|PAYPAL_CLIENT/)
    expect(readme).toContain("PayPal is disabled for production")
  })

  it("does not require PayPal credentials in environment validation", () => {
    expect(read("src/lib/env-validator.ts")).not.toMatch(/PAYPAL_CLIENT|validatePayPalConfig/)
  })

  it("does not keep legacy auth or disabled payment variables in production deployment guidance", () => {
    const deploymentGuide = read("DEPLOYMENT.md")
    const netlifyConfig = read("netlify.toml")

    expect(deploymentGuide).not.toMatch(/NEXTAUTH_|NextAuth/)
    expect(deploymentGuide).toMatch(/BETTER_AUTH_URL/)
    expect(deploymentGuide).toMatch(/BETTER_AUTH_SECRET/)
    expect(netlifyConfig).not.toMatch(/PAYPAL_CLIENT|PAYPAL_SECRET|PayPal/)
  })

  it("does not keep a PayPal checkout validator that accepts client supplied amounts", () => {
    const validators = read("src/lib/validators.ts")

    expect(validators).not.toMatch(/paypalCheckoutSchema|checkout\/paypal|PayPal 支付请求/)
  })
})
