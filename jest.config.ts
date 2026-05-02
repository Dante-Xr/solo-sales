/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：为 Jest 增加 server-only 模块映射，支持服务端边界代码在测试环境运行。
 * 修改模型：gpt-5.5
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
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
}

export default createJestConfig(config)
