/*
 * One-shot migration script for the minimization pass:
 * 1. Remove parameter.precision (fold into rawText ±N if not already there)
 * 2. Merge step.decisionPoint into step.branches
 * 3. Remove step.media (0 files use it, but guard anyway)
 * Usage: node renderer/migrate-trim.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "examples");

function walk(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (f.endsWith(".json")) out.push(p);
  }
  return out;
}

let totalChanges = 0;

for (const fp of walk(root)) {
  const raw = readFileSync(fp, "utf8");
  const p = JSON.parse(raw);
  let changed = false;

  // 1. Remove parameter.precision — rawText already captures the ± info
  for (const s of (p.steps || [])) {
    for (const pr of (s.parameters || [])) {
      if (pr.precision !== undefined) {
        delete pr.precision;
        changed = true;
      }
    }
  }

  // 2. Merge step.decisionPoint → step.branches
  for (const s of (p.steps || [])) {
    if (s.decisionPoint !== undefined) {
      if (!s.branches || !s.branches.length) {
        s.branches = [{ condition: s.decisionPoint }];
      }
      delete s.decisionPoint;
      changed = true;
    }
  }

  // 3. Remove step.media (should be 0 files, but guard)
  for (const s of (p.steps || [])) {
    if (s.media !== undefined) {
      delete s.media;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(fp, JSON.stringify(p, null, 2) + "\n", "utf8");
    totalChanges++;
    console.log("migrated: " + fp.replace(root, "examples"));
  }
}

console.log("\nTotal files migrated: " + totalChanges);
