/*
 * FULL JSON Schema validation (draft 2020-12) for LabRecord protocols, via ajv.
 * Complements validate.mjs (which does referential integrity): this catches
 * additionalProperties:false violations, enum/pattern/type errors, required fields.
 * Reuses the ajv already vendored in the repo (no network install needed).
 * Scans examples/ recursively.
 *
 * Usage: node renderer/validate-schema.mjs
 */
import { createRequire } from "node:module";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const repoRoot = join(root, "..");

// find a vendored ajv (+ ajv-formats) anywhere in the repo's known node_modules
function findPkg(name) {
  for (const base of ["labrecord-protocol-mcp-demo", "mcp-demo"]) {
    const p = join(repoRoot, base, "node_modules", name);
    if (existsSync(p)) return p;
  }
  return name; // fall back to normal resolution
}
const ajvDir = findPkg("ajv");
let Ajv = require(join(ajvDir, "dist", "2020.js")); // draft 2020-12 build
Ajv = Ajv.default || Ajv;
let addFormats = require(findPkg("ajv-formats"));
addFormats = addFormats.default || addFormats;

const schema = JSON.parse(readFileSync(join(root, "canonical-schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const examplesDir = join(root, "examples");
function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}
const files = walk(examplesDir).sort();

let bad = 0;
for (const f of files) {
  const rel = relative(root, f);
  let data;
  try { data = JSON.parse(readFileSync(f, "utf8")); }
  catch (e) { console.log("FAIL " + rel + " - invalid JSON: " + e.message); bad++; continue; }
  if (validate(data)) { console.log("PASS " + rel); }
  else {
    bad++;
    console.log("FAIL " + rel);
    for (const err of validate.errors.slice(0, 12)) {
      console.log("   - " + (err.instancePath || "(root)") + " " + err.message +
        (err.params && Object.keys(err.params).length ? " " + JSON.stringify(err.params) : ""));
    }
    if (validate.errors.length > 12) console.log("   - ...(" + (validate.errors.length - 12) + " more)");
  }
}
console.log("---");
console.log(bad === 0 ? `All ${files.length} files pass full JSON Schema.` : `${bad}/${files.length} files FAILED full JSON Schema.`);
process.exit(bad === 0 ? 0 : 1);
