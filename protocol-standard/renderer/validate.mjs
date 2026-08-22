/*
 * Dependency-free validator for LabRecord canonical protocols (v0.1 / v0.2).
 * Checks structural rules AND referential integrity (which JSON Schema alone cannot fully do):
 *  - id patterns (m#/e#/s#/src#/sp#/c#/t#), uniqueness
 *  - step.materialIds / equipmentIds / dependsOn / sourceReferences / inputIds / outputIds /
 *    containerIds / tableIds / branches.targetStepId all resolve to real ids
 *  - parameter.type in the schema enum; parameter.rawText present
 *  - provenance.status / library in enum
 * Enums are read from canonical-schema.json so the validator stays in sync.
 * Scans examples/ recursively (so examples/test-set/*.json is validated too).
 *
 * Usage: node renderer/validate.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const schema = JSON.parse(readFileSync(join(root, "canonical-schema.json"), "utf8"));
const paramTypes = schema.$defs.parameter.properties.type.enum;
const provStatus = schema.$defs.provenance.properties.status.enum;
const provLibrary = schema.$defs.provenance.properties.library.enum;
const versions = schema.properties.schemaVersion.enum;

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

function countReview(p) {
  let c = 0;
  (p.materials || []).forEach((x) => x.needsReview && c++);
  (p.equipment || []).forEach((x) => x.needsReview && c++);
  (p.steps || []).forEach((s) => { if (s.needsReview) c++; (s.parameters || []).forEach((pr) => pr.needsReview && c++); });
  return c;
}

let totalErrors = 0, pass = 0;
for (const f of files) {
  const rel = relative(root, f);
  const errs = [];
  let p;
  try { p = JSON.parse(readFileSync(f, "utf8")); }
  catch (e) { console.log("FAIL " + rel + " - invalid JSON: " + e.message); totalErrors++; continue; }
  const check = (cond, msg) => { if (!cond) errs.push(msg); };

  check(versions.includes(p.schemaVersion), `schemaVersion must be one of ${versions.join("/")}`);
  check(p.metadata && !!p.metadata.title, "metadata.title required");
  check(p.metadata && !!p.metadata.purpose, "metadata.purpose required");

  const matIds = new Set();
  (p.materials || []).forEach((x, i) => {
    check(/^m\d+$/.test(x.id || ""), `materials[${i}].id must match m# (got ${x.id})`);
    check(!matIds.has(x.id), `duplicate material id ${x.id}`); matIds.add(x.id);
    check(!!x.name, `materials[${i}].name required`);
  });
  const eqIds = new Set();
  (p.equipment || []).forEach((x, i) => {
    check(/^e\d+$/.test(x.id || ""), `equipment[${i}].id must match e# (got ${x.id})`);
    check(!eqIds.has(x.id), `duplicate equipment id ${x.id}`); eqIds.add(x.id);
    check(!!x.name, `equipment[${i}].name required`);
  });
  const swIds = new Set();
  (p.software || []).forEach((x, i) => {
    check(/^sw\d+$/.test(x.id || ""), `software[${i}].id must match sw# (got ${x.id})`);
    check(!swIds.has(x.id), `duplicate software id ${x.id}`); swIds.add(x.id);
    check(!!x.name, `software[${i}].name required`);
  });
  const sampleIds = new Set();
  (p.samples || []).forEach((x, i) => {
    check(/^sp\d+$/.test(x.id || ""), `samples[${i}].id must match sp# (got ${x.id})`);
    check(!sampleIds.has(x.id), `duplicate sample id ${x.id}`); sampleIds.add(x.id);
    check(!!x.name, `samples[${i}].name required`);
    check(!!x.role, `samples[${i}].role required`);
    if (x.derivedFromMaterialId) check(matIds.has(x.derivedFromMaterialId), `sample ${x.id} derivedFromMaterialId missing ${x.derivedFromMaterialId}`);
  });
  const containerIds = new Set();
  (p.containers || []).forEach((x, i) => {
    check(/^c\d+$/.test(x.id || ""), `containers[${i}].id must match c# (got ${x.id})`);
    check(!containerIds.has(x.id), `duplicate container id ${x.id}`); containerIds.add(x.id);
    check(!!x.name, `containers[${i}].name required`);
    (x.layout || []).forEach((cell) => {
      if (cell.sampleId) check(sampleIds.has(cell.sampleId), `container ${x.id} layout sampleId missing ${cell.sampleId}`);
      if (cell.materialId) check(matIds.has(cell.materialId), `container ${x.id} layout materialId missing ${cell.materialId}`);
    });
  });
  const tableIds = new Set();
  (p.tables || []).forEach((x, i) => {
    check(/^t\d+$/.test(x.id || ""), `tables[${i}].id must match t# (got ${x.id})`);
    check(!tableIds.has(x.id), `duplicate table id ${x.id}`); tableIds.add(x.id);
    check(Array.isArray(x.columns) && x.columns.length >= 1, `tables[${i}].columns required`);
    check(Array.isArray(x.rows), `tables[${i}].rows required`);
  });
  const srcIds = new Set();
  (p.sources || []).forEach((x, i) => {
    check(/^src\d+$/.test(x.id || ""), `sources[${i}].id must match src# (got ${x.id})`); srcIds.add(x.id);
  });
  check((p.sources || []).length >= 1, "at least one source required");

  check((p.steps || []).length >= 1, "at least one step required");
  const stepIds = new Set();
  (p.steps || []).forEach((s) => { stepIds.add(s.id); });
  (p.steps || []).forEach((s, i) => {
    check(/^s\d+$/.test(s.id || ""), `steps[${i}].id must match s# (got ${s.id})`);
    check(!!s.action, `steps[${i}].action required`);
    (s.materialIds || []).forEach((id) => check(matIds.has(id), `step ${s.id} references missing material ${id}`));
    (s.materialUses || []).forEach((mu) => check(matIds.has(mu.materialId), `step ${s.id} materialUses missing material ${mu.materialId}`));
    (s.equipmentIds || []).forEach((id) => check(eqIds.has(id), `step ${s.id} references missing equipment ${id}`));
    (s.softwareIds || []).forEach((id) => check(swIds.has(id), `step ${s.id} softwareIds missing ${id}`));
    (s.acceptanceCriteria || []).forEach((ac) => { if (ac.onFailStepId) check(stepIds.has(ac.onFailStepId), `step ${s.id} acceptance onFailStepId missing ${ac.onFailStepId}`); });
    (s.inputIds || []).forEach((id) => check(matIds.has(id) || sampleIds.has(id), `step ${s.id} inputIds missing ${id}`));
    (s.outputIds || []).forEach((id) => check(sampleIds.has(id), `step ${s.id} outputIds missing sample ${id}`));
    (s.containerIds || []).forEach((id) => check(containerIds.has(id), `step ${s.id} containerIds missing ${id}`));
    (s.tableIds || []).forEach((id) => check(tableIds.has(id), `step ${s.id} tableIds missing ${id}`));
    (s.dependsOn || []).forEach((id) => check(stepIds.has(id), `step ${s.id} dependsOn missing ${id}`));
    (s.branches || []).forEach((b) => { if (b.targetStepId) check(stepIds.has(b.targetStepId), `step ${s.id} branch targetStepId missing ${b.targetStepId}`); });
    (s.parameters || []).forEach((pr, j) => {
      check(paramTypes.includes(pr.type), `step ${s.id} param[${j}].type invalid: ${pr.type}`);
      check(!!pr.rawText, `step ${s.id} param[${j}].rawText required`);
    });
    (s.sourceReferences || []).forEach((r) => check(srcIds.has(r.sourceId), `step ${s.id} sourceRef missing ${r.sourceId}`));
  });

  if (p.provenance) {
    if (p.provenance.status) check(provStatus.includes(p.provenance.status), `provenance.status invalid: ${p.provenance.status}`);
    if (p.provenance.library) check(provLibrary.includes(p.provenance.library), `provenance.library invalid: ${p.provenance.library}`);
  }

  if (errs.length) { totalErrors += errs.length; console.log("FAIL " + rel); errs.forEach((e) => console.log("   - " + e)); }
  else { pass++; console.log(`PASS ${rel} (v${p.schemaVersion}, ${(p.steps || []).length} steps, ${(p.materials || []).length} materials, ${(p.samples || []).length} samples, ${countReview(p)} needsReview)`); }
}
console.log("---");
console.log(totalErrors === 0 ? `All ${files.length} protocols valid (${pass} files).` : `${totalErrors} error(s) found across ${files.length} files.`);
process.exit(totalErrors === 0 ? 0 : 1);
