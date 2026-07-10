import assert from "node:assert/strict"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import {
  collectSourceInventory,
  validateInventoryCoverage,
} from "../docs-validate.mjs"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
)

test("captures every .trae project document in the frozen source set", () => {
  const inventory = collectSourceInventory(projectRoot)

  assert.equal(inventory.entries.length, 180)
  assert.equal(
    inventory.aggregateSha256,
    "54714dd24f5e47065facce7d5ebf7306ff05eb62901dc52f273f30878736186f"
  )
})

test("rejects a migration map that omits a source document", () => {
  const result = validateInventoryCoverage(
    [
      {
        source: ".trae/specs/example/spec.md",
        disposition: "adopted",
        targets: ["docs/specs/current.md"],
      },
    ],
    []
  )

  assert.equal(result.valid, false)
  assert.deepEqual(result.errors, [
    "Unmapped source: .trae/specs/example/spec.md",
  ])
})
