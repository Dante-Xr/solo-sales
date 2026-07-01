import { readFileSync } from "node:fs";
import path from "node:path";
import { join } from "node:path";

describe("v1.6 launch copy safety", () => {
  const root = path.resolve(__dirname, "../..");

  function read(path: string) {
    return readFileSync(join(root, path), "utf8");
  }

  it("does not expose default admin credentials in login UI or i18n", () => {
    const files = [
      "src/app/[locale]/admin/(auth)/login/page.tsx",
      "src/i18n/messages/zh.json",
      "src/i18n/messages/en.json",
    ];

    for (const file of files) {
      const content = read(file);
      expect(content).not.toMatch(
        /admin@solosales\.com|Admin@123456|defaultAccount|默认账号/,
      );
    }
  });

  it("CHANGELOG.md does not contain default credentials", () => {
    const changelog = read("CHANGELOG.md");
    expect(changelog).not.toMatch(/admin@solosales\.com|Admin@123456/);
  });

  it("does not expose PayPal in customer-facing UI (controlled by env var)", () => {
    const files = [
      "src/components/storefront/StorefrontFooter.tsx",
      "src/components/product/TrustBadges.tsx",
      "src/app/[locale]/faq/page.tsx",
    ];

    for (const file of files) {
      expect(read(file)).not.toMatch(/PayPal|paypal|PAYPAL/);
    }
  });

  it("documents PayPal Business integration in v1.7.3", () => {
    const readme = read("README.md");

    // v1.7.3 已集成 PayPal Business (Sole Proprietor)
    expect(readme).toMatch(/PayPal Business/);
    expect(readme).toMatch(/v1\.7\.3/);
  });

  it("PayPal credentials are optional and controlled by ENABLED_PAYMENT_PROVIDERS", () => {
    const envValidator = read("src/lib/env-validator.ts");
    // PayPal 配置是可选的，通过 ENABLED_PAYMENT_PROVIDERS 控制
    expect(envValidator).not.toMatch(/required.*PAYPAL/);
  });

  it("does not keep legacy auth or disabled payment variables in production deployment guidance", () => {
    const deploymentGuide = read("DEPLOYMENT.md");
    const netlifyConfig = read("netlify.toml");

    expect(deploymentGuide).not.toMatch(/NEXTAUTH_|NextAuth/);
    expect(deploymentGuide).toMatch(/BETTER_AUTH_URL/);
    expect(deploymentGuide).toMatch(/BETTER_AUTH_SECRET/);
    expect(netlifyConfig).not.toMatch(/PAYPAL_CLIENT|PAYPAL_SECRET|PayPal/);
  });

  it("does not keep a PayPal checkout validator that accepts client supplied amounts", () => {
    const validators = read("src/lib/validators.ts");

    expect(validators).not.toMatch(
      /paypalCheckoutSchema|checkout\/paypal|PayPal 支付请求/,
    );
  });
});
