/**
 * 修改时间：2026-06-27 17:10:00 +08:00
 * 修改内容：排除Playwright E2E测试文件，只运行Jest单元测试
 * 修改依据：E2E测试使用Playwright，不应由Jest运行
 */
import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  dir: "./",
})

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^server-only$": "<rootDir>/src/server/__mocks__/server-only.ts",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/tests/e2e/", // 排除E2E测试（使用Playwright）
    "<rootDir>/scripts/node-tests/", // 使用 node --test 的原生测试
  ],
}

export default createJestConfig(config)
