/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：更新 ESLint 忽略范围，避免扫描本地 Python 虚拟环境，并保留 Next/TypeScript lint 基线。
 * 修改模型：gpt-5.5
 */
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "@next/next/no-img-element": "off",
    }
  },
  globalIgnores([
    ".next/**",
    ".venv/**",
    "out/**",
    "build/**",
    "figma frontend enhance/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
