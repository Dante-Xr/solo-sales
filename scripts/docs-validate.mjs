import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SOURCE_DIRECTORIES = [
  ".trae/documents",
  ".trae/plans",
  ".trae/specs",
]

const ALLOWED_DISPOSITIONS = new Set([
  "adopted",
  "consolidated",
  "historical_only",
  "superseded",
  "future_planning",
])

function toPosix(value) {
  return value.split(path.sep).join("/")
}

function listMarkdownFiles(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath)
    }
  }
  return files
}

function titleFromMarkdown(content, fallback) {
  const heading = content.match(/^#\s+(.+)$/m)
  return heading ? heading[1].trim() : fallback
}

function inferVersion(source, content) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1] || ""
  const match = `${source}\n${heading}`.match(/v(\d+\.\d+(?:\.\d+)?)/i)
  return match ? `v${match[1]}` : null
}

function inferKind(source) {
  const name = path.basename(source, ".md").toLowerCase()
  if (name === "spec") return "spec"
  if (name === "tasks") return "tasks"
  if (name === "checklist") return "checklist"
  if (name.includes("plan")) return "plan"
  if (name.includes("report") || name.includes("analysis")) return "report"
  if (name.includes("guide")) return "guide"
  return "document"
}

export function collectSourceInventory(projectRoot) {
  const entries = SOURCE_DIRECTORIES.flatMap((relativeDirectory) => {
    const directory = path.join(projectRoot, relativeDirectory)
    if (!fs.existsSync(directory)) return []
    return listMarkdownFiles(directory).map((absolutePath) => {
      const content = fs.readFileSync(absolutePath, "utf8")
      const source = toPosix(path.relative(projectRoot, absolutePath))
      const lines = content === "" ? 0 : content.split(/\r?\n/).length
      return {
        source,
        sha256: crypto.createHash("sha256").update(content).digest("hex"),
        title: titleFromMarkdown(content, path.basename(absolutePath, ".md")),
        version: inferVersion(source, content),
        kind: inferKind(source),
        lines,
        checkboxes: {
          complete: (content.match(/^\s*[-*]\s+\[[xX]\]/gm) || []).length,
          incomplete: (content.match(/^\s*[-*]\s+\[ \]/gm) || []).length,
        },
      }
    })
  }).sort((left, right) => left.source.localeCompare(right.source))

  const aggregateSha256 = crypto
    .createHash("sha256")
    .update(entries.map((entry) => `${entry.source}\0${entry.sha256}\n`).join(""))
    .digest("hex")

  return { entries, aggregateSha256 }
}

export function validateInventoryCoverage(sourceEntries, migrationEntries) {
  const errors = []
  const mapped = new Map(migrationEntries.map((entry) => [entry.source, entry]))

  for (const sourceEntry of sourceEntries) {
    const migration = mapped.get(sourceEntry.source)
    if (!migration) {
      errors.push(`Unmapped source: ${sourceEntry.source}`)
      continue
    }
    if (!ALLOWED_DISPOSITIONS.has(migration.disposition)) {
      errors.push(`Invalid disposition: ${sourceEntry.source}`)
    }
    if (!Array.isArray(migration.targets) || migration.targets.length === 0) {
      errors.push(`Missing targets: ${sourceEntry.source}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

function validateRequiredFiles(projectRoot) {
  const required = [
    "docs/README.md",
    "docs/governance/rules.md",
    "docs/releases/manifest.json",
    "docs/releases/roadmap.md",
    "docs/architecture/overview.md",
    "docs/architecture/runtime.md",
    "docs/specs/current.md",
    "docs/changes/README.md",
    "docs/legacy/README.md",
    "docs/legacy/inventory.json",
    "docs/legacy/migration-map.md",
  ]
  return required
    .filter((relativePath) => !fs.existsSync(path.join(projectRoot, relativePath)))
    .map((relativePath) => `Missing required document: ${relativePath}`)
}

function validateArchiveDirectories(projectRoot) {
  const archiveRoot = path.join(projectRoot, "docs/changes/archive")
  if (!fs.existsSync(archiveRoot)) return ["Missing archive root: docs/changes/archive"]
  const errors = []
  for (const version of fs.readdirSync(archiveRoot, { withFileTypes: true })) {
    if (!version.isDirectory()) continue
    const versionPath = path.join(archiveRoot, version.name)
    for (const change of fs.readdirSync(versionPath, { withFileTypes: true })) {
      if (!change.isDirectory()) continue
      const changePath = path.join(versionPath, change.name)
      for (const required of ["spec.md", "tasks.md"]) {
        if (!fs.existsSync(path.join(changePath, required))) {
          errors.push(`Incomplete archive: docs/changes/archive/${version.name}/${change.name}/${required}`)
        }
      }
    }
  }
  return errors
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath]
  })
}

function validateMarkdownStructure(projectRoot) {
  const errors = []
  const docsRoot = path.join(projectRoot, "docs")
  const requirementIds = new Set()
  for (const absolutePath of listFiles(docsRoot).filter((file) => file.endsWith(".md"))) {
    const content = fs.readFileSync(absolutePath, "utf8")
    const relativePath = toPosix(path.relative(projectRoot, absolutePath))
    if (content.includes("\uFFFD")) errors.push(`Invalid UTF-8 replacement character: ${relativePath}`)
    for (const match of content.matchAll(/\bREQ-(\d{4})\b/g)) {
      const id = `REQ-${match[1]}`
      if (requirementIds.has(id)) errors.push(`Duplicate requirement ID: ${id}`)
      requirementIds.add(id)
    }
    for (const match of content.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)) {
      const target = match[1]
      if (/^(https?:|mailto:)/i.test(target)) continue
      const resolved = path.resolve(path.dirname(absolutePath), target)
      if (!fs.existsSync(resolved)) errors.push(`Broken document link: ${relativePath} -> ${target}`)
    }
  }
  return errors
}

export function validateDocs(projectRoot) {
  const errors = [
    ...validateRequiredFiles(projectRoot),
    ...validateArchiveDirectories(projectRoot),
    ...validateMarkdownStructure(projectRoot),
  ]
  const inventoryPath = path.join(projectRoot, "docs/legacy/inventory.json")
  if (fs.existsSync(inventoryPath)) {
    const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"))
    const sourceInventory = collectSourceInventory(projectRoot)
    if (inventory.aggregate_sha256 !== sourceInventory.aggregateSha256) {
      errors.push("Source inventory hash differs from the current .trae source set")
    }
    const coverage = validateInventoryCoverage(sourceInventory.entries, inventory.entries || [])
    errors.push(...coverage.errors)
  }
  return { valid: errors.length === 0, errors }
}

const invokedPath = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === invokedPath) {
  const projectRoot = process.cwd()
  const result = validateDocs(projectRoot)
  if (!result.valid) {
    console.error(result.errors.join("\n"))
    process.exitCode = 1
  } else {
    console.log("docs:check passed")
  }
}
