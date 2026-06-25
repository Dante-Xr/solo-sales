#!/usr/bin/env node
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const trackedFiles = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean)
const historyFiles = execFileSync("git", ["log", "--all", "--name-only", "--pretty=format:"], {
  cwd: root,
  encoding: "utf8",
})
  .split(/\r?\n/)
  .filter(Boolean)

const envFilePattern = /(^|\/)\.env(\..*)?$/
const trackedEnvFiles = trackedFiles.filter((file) => envFilePattern.test(file.replaceAll("\\", "/")))
const historyEnvFiles = [...new Set(historyFiles.filter((file) => envFilePattern.test(file.replaceAll("\\", "/"))))]

const scanTargets = trackedFiles.filter((file) => {
  const normalized = file.replaceAll("\\", "/")
  if (normalized.startsWith(".trae/") || normalized.startsWith(".codex/")) return false
  if (normalized.includes("/__tests__/")) return false
  if (normalized === "src/lib/prisma.ts") return false
  return /\.(ts|tsx|js|mjs|json|md|yml|yaml)$/.test(normalized)
})

const secretPatterns = [
  { name: "Stripe live secret", pattern: /sk_live_[A-Za-z0-9]{12,}/ },
  { name: "OpenAI API key", pattern: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { name: "Private key block", pattern: /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/ },
  { name: "Database URL with password", pattern: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/ },
  { name: "Upstash token literal", pattern: /UPSTASH_REDIS_REST_TOKEN\s*=\s*["']?[A-Za-z0-9._-]{16,}/ },
]

const findings = []

for (const file of scanTargets) {
  const absolutePath = join(root, file)
  if (!existsSync(absolutePath)) continue
  const content = readFileSync(absolutePath, "utf8")
  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(content)) {
      findings.push(file + ": " + name)
    }
  }
}

if (trackedEnvFiles.length > 0 || historyEnvFiles.length > 0 || findings.length > 0) {
  console.error("Secret audit failed")
  for (const file of trackedEnvFiles) console.error("tracked env file: " + file)
  for (const file of historyEnvFiles) console.error("history env file: " + file)
  for (const finding of findings) console.error("secret pattern: " + finding)
  process.exit(1)
}

console.log("Secret audit passed trackedEnvFiles=" + trackedEnvFiles.length + " historyEnvFiles=" + historyEnvFiles.length + " findings=" + findings.length)
