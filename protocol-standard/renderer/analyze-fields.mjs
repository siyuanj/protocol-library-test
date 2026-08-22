/*
 * Field-usage analysis across the test-set protocols.
 * Objective input for "which fields are redundant / under-used".
 * Counts, over the 15 test-set files, how many use each field path, plus
 * parameter.type and material.role value distributions.
 *
 * Usage: node renderer/analyze-fields.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "..", "examples", "test-set");
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const N = files.length;

const top = {}, mat = {}, eq = {}, step = {}, param = {}, samp = {}, cont = {}, tbl = {}, meta = {};
const paramTypes = {}, matRoles = {}, sampRoles = {}, srcKinds = {};
const bump = (o, k) => (o[k] = (o[k] || 0) + 1);
// count a field as used by a FILE if any instance in that file has it
function fileHas(obj, present) { return present; }

for (const f of files) {
  const p = JSON.parse(readFileSync(join(dir, f), "utf8"));
  // top-level optional keys
  ["samples", "containers", "tables", "controls", "expectedOutputs", "troubleshooting", "safety", "biosafetyLevel", "limitations", "provenance"].forEach((k) => { if (p[k] !== undefined && (!Array.isArray(p[k]) || p[k].length)) bump(top, k); });
  // metadata
  ["scope", "estimatedTime", "beforeYouBegin", "authors", "license", "doi", "createdAt", "modifiedAt", "tags", "family", "category"].forEach((k) => { if (p.metadata && p.metadata[k] !== undefined) bump(meta, k); });
  // materials
  const mkeys = ["role", "amount", "amountMax", "unit", "workingConcentration", "specification", "vendor", "catalogNumber", "casNumber", "rrid", "lot", "storage", "hazard", "rawText", "needsReview", "sourceReferences"];
  const mused = {};
  (p.materials || []).forEach((m) => { mkeys.forEach((k) => { if (m[k] !== undefined) mused[k] = 1; }); if (m.role) bump(matRoles, m.role); });
  Object.keys(mused).forEach((k) => bump(mat, k));
  // equipment
  const eused = {};
  (p.equipment || []).forEach((e) => { ["model", "settings", "needsReview", "sourceReferences"].forEach((k) => { if (e[k] !== undefined) eused[k] = 1; }); });
  Object.keys(eused).forEach((k) => bump(eq, k));
  // samples
  const sused = {};
  (p.samples || []).forEach((s) => { ["organism", "derivedFromMaterialId", "description", "needsReview"].forEach((k) => { if (s[k] !== undefined) sused[k] = 1; }); if (s.role) bump(sampRoles, s.role); });
  Object.keys(sused).forEach((k) => bump(samp, k));
  // containers
  const cused = {};
  (p.containers || []).forEach((c) => { ["type", "wells", "needsReview"].forEach((k) => { if (c[k] !== undefined) cused[k] = 1; }); });
  Object.keys(cused).forEach((k) => bump(cont, k));
  // tables
  const tused = {};
  (p.tables || []).forEach((t) => { ["title", "note"].forEach((k) => { if (t[k] !== undefined) tused[k] = 1; }); });
  Object.keys(tused).forEach((k) => bump(tbl, k));
  // steps
  const skeys = ["number", "phase", "optional", "pausePoint", "materialIds", "equipmentIds", "inputIds", "outputIds", "containerIds", "tableIds", "parameters", "dependsOn", "decisionPoint", "branches", "media", "expectedResult", "criticalNotes", "safetyNotes", "needsReview", "sourceReferences"];
  const stused = {};
  (p.steps || []).forEach((s) => { skeys.forEach((k) => { if (s[k] !== undefined) stused[k] = 1; }); (s.parameters || []).forEach((pr) => { ["value", "valueMax", "unit", "precision", "needsReview"].forEach((k) => { if (pr[k] !== undefined) param[k] = (param[k] || 0); }); if (pr.type) bump(paramTypes, pr.type); }); });
  Object.keys(stused).forEach((k) => bump(step, k));
  // parameter sub-field usage (count files where any param has the key)
  const pused = {};
  (p.steps || []).forEach((s) => (s.parameters || []).forEach((pr) => { ["value", "valueMax", "unit", "precision", "needsReview"].forEach((k) => { if (pr[k] !== undefined) pused[k] = 1; }); }));
  Object.keys(pused).forEach((k) => bump(param, k));
  // source kinds
  (p.sources || []).forEach((s) => { if (s.kind) bump(srcKinds, s.kind); });
}

function table(title, obj) {
  console.log("\n## " + title + "  (files using / " + N + ")");
  const rows = Object.entries(obj).sort((a, b) => a[1] - b[1]);
  if (!rows.length) { console.log("  (none used)"); return; }
  for (const [k, v] of rows) {
    const bar = "#".repeat(v);
    console.log("  " + String(v).padStart(2) + "/" + N + " " + k.padEnd(22) + " " + bar);
  }
}
function dist(title, obj) {
  console.log("\n## " + title + "  (total instances)");
  const rows = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  for (const [k, v] of rows) console.log("  " + String(v).padStart(3) + "  " + k);
}

console.log("Field-usage across " + N + " test-set protocols");
table("Top-level optional keys", top);
table("metadata subfields", meta);
table("material subfields", mat);
table("equipment subfields", eq);
table("sample subfields (beyond id/name/role)", samp);
table("container subfields (beyond id/name)", cont);
table("table subfields (beyond id/columns/rows)", tbl);
table("step subfields", step);
table("parameter subfields", param);
dist("parameter.type distribution", paramTypes);
dist("material.role distribution", matRoles);
dist("sample.role distribution", sampRoles);
dist("source.kind distribution", srcKinds);
