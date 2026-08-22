/*
 * Comprehensive field-usage analysis across ALL 30 protocol files.
 * Covers v0.1, v0.2, and v0.3 fields for Core/Extension classification.
 * Usage: node renderer/analyze-all.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
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

const allFiles = walk(root);
const N = allFiles.length;
const bump = (o, k) => (o[k] = (o[k] || 0) + 1);

const topLevel = {}, metaFields = {}, matFields = {}, eqFields = {}, swFields = {};
const sampFields = {}, contFields = {}, tblFields = {}, stepFields = {};
const paramFields = {}, paramTypes = {}, matRoles = {}, sampRoles = {};
const srcKinds = {}, muFields = {}, acFields = {}, repFields = {};
const sdFields = {}, compFields = {};

for (const fp of allFiles) {
  const p = JSON.parse(readFileSync(fp, "utf8"));

  // top-level optional
  for (const k of ["software","samples","containers","tables","controls","expectedOutputs",
    "troubleshooting","safety","biosafetyLevel","studyDesign","compliance","limitations","provenance"]) {
    if (p[k] !== undefined && (!Array.isArray(p[k]) || p[k].length)) bump(topLevel, k);
  }

  // metadata
  for (const k of ["scope","estimatedTime","beforeYouBegin","authors","license","doi",
    "createdAt","modifiedAt","tags","family","category","discipline","version","protocolId"]) {
    if (p.metadata && p.metadata[k] !== undefined) bump(metaFields, k);
  }

  // materials
  const mu = {};
  for (const x of (p.materials || [])) {
    for (const k of ["role","amount","amountMax","unit","workingConcentration","specification",
      "vendor","catalogNumber","casNumber","rrid","lot","storage","hazard","rawText",
      "needsReview","sourceReferences","smiles","molecularWeight"]) {
      if (x[k] !== undefined) mu[k] = 1;
    }
    if (x.role) bump(matRoles, x.role);
  }
  for (const k of Object.keys(mu)) bump(matFields, k);

  // equipment
  const eu = {};
  for (const x of (p.equipment || [])) {
    for (const k of ["model","settings","needsReview","sourceReferences","rawText"]) {
      if (x[k] !== undefined) eu[k] = 1;
    }
  }
  for (const k of Object.keys(eu)) bump(eqFields, k);

  // software (v0.3)
  const swu = {};
  for (const x of (p.software || [])) {
    for (const k of ["version","command","url","parameters","needsReview"]) {
      if (x[k] !== undefined) swu[k] = 1;
    }
  }
  for (const k of Object.keys(swu)) bump(swFields, k);

  // samples
  const su = {};
  for (const x of (p.samples || [])) {
    for (const k of ["organism","derivedFromMaterialId","description","needsReview","kind","dataType"]) {
      if (x[k] !== undefined) su[k] = 1;
    }
    if (x.role) bump(sampRoles, x.role);
  }
  for (const k of Object.keys(su)) bump(sampFields, k);

  // containers
  const cu = {};
  for (const x of (p.containers || [])) {
    for (const k of ["type","wells","needsReview","layout"]) {
      if (x[k] !== undefined && (!Array.isArray(x[k]) || x[k].length)) cu[k] = 1;
    }
  }
  for (const k of Object.keys(cu)) bump(contFields, k);

  // tables
  const tu = {};
  for (const x of (p.tables || [])) {
    for (const k of ["title","note","kind","needsReview"]) {
      if (x[k] !== undefined) tu[k] = 1;
    }
  }
  for (const k of Object.keys(tu)) bump(tblFields, k);

  // steps
  const stu = {};
  for (const s of (p.steps || [])) {
    for (const k of ["number","phase","optional","pausePoint","materialIds","equipmentIds",
      "inputIds","outputIds","containerIds","tableIds","parameters","dependsOn",
      "decisionPoint","branches","media","expectedResult","criticalNotes","safetyNotes",
      "needsReview","sourceReferences","softwareIds","command","materialUses",
      "acceptanceCriteria","repeat"]) {
      if (s[k] !== undefined && (!Array.isArray(s[k]) || s[k].length)) stu[k] = 1;
    }

    // materialUses sub-fields (v0.3)
    for (const u of (s.materialUses || [])) {
      for (const k of ["amount","amountMax","unit","equivalents","limitingReagent","role","rawText","needsReview"]) {
        if (u[k] !== undefined) bump(muFields, k);
      }
    }

    // acceptanceCriteria sub-fields (v0.3)
    for (const a of (s.acceptanceCriteria || [])) {
      for (const k of ["parameter","comparator","value","valueMax","unit","classification","description","onFailStepId","needsReview"]) {
        if (a[k] !== undefined) bump(acFields, k);
      }
    }

    // repeat sub-fields (v0.3)
    if (s.repeat) {
      for (const k of ["count","untilCondition","over","notes"]) {
        if (s.repeat[k] !== undefined) bump(repFields, k);
      }
    }

    // parameter sub-fields
    for (const pr of (s.parameters || [])) {
      for (const k of ["value","valueMax","unit","precision","needsReview","rawText",
        "valueText","comparator","perUnit","formula","sourceReferences"]) {
        if (pr[k] !== undefined) bump(paramFields, k);
      }
      if (pr.type) bump(paramTypes, pr.type);
    }
  }
  for (const k of Object.keys(stu)) bump(stepFields, k);

  // studyDesign (v0.3)
  if (p.studyDesign) {
    for (const k of ["groups","randomization","blinding","timepoints","statisticalPlan","notes"]) {
      if (p.studyDesign[k] !== undefined && (!Array.isArray(p.studyDesign[k]) || p.studyDesign[k].length)) bump(sdFields, k);
    }
  }

  // compliance (v0.3)
  if (p.compliance) {
    for (const k of ["iacuc","irb","approvalId","consent","wasteDisposal","notes"]) {
      if (p.compliance[k] !== undefined) bump(compFields, k);
    }
  }
}

function table(title, obj, total) {
  total = total || N;
  console.log("\n## " + title + "  (files using / " + total + ")");
  const rows = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  if (!rows.length) { console.log("  (none)"); return; }
  for (const [k, v] of rows) {
    const pct = Math.round(100 * v / total);
    const tier = pct >= 60 ? "CORE" : pct >= 20 ? "EXT" : "RARE";
    console.log("  " + String(v).padStart(2) + "/" + total + " (" + String(pct).padStart(3) + "%) " + k.padEnd(24) + " " + tier);
  }
}
function dist(title, obj) {
  console.log("\n## " + title + "  (total instances)");
  const rows = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  for (const [k, v] of rows) console.log("  " + String(v).padStart(3) + "  " + k);
}

console.log("=== Comprehensive field-usage across ALL " + N + " protocol files ===\n");
table("Top-level optional keys", topLevel);
table("Metadata subfields", metaFields);
table("Material subfields", matFields);
table("Equipment subfields", eqFields);
table("Software subfields (v0.3)", swFields);
table("Sample subfields", sampFields);
table("Container subfields", contFields);
table("Table subfields", tblFields);
table("Step subfields", stepFields);
table("Parameter subfields", paramFields);
table("materialUses subfields (v0.3)", muFields);
table("acceptanceCriteria subfields (v0.3)", acFields);
table("repeat subfields (v0.3)", repFields);
table("studyDesign subfields (v0.3)", sdFields);
table("compliance subfields (v0.3)", compFields);
dist("parameter.type distribution", paramTypes);
dist("material.role distribution", matRoles);
dist("sample.role distribution", sampRoles);
dist("source.kind distribution", srcKinds);

console.log("\n=== TRIM CANDIDATES (0 files or RARE) ===");
const allFields = { ...paramFields };
for (const k of ["precision","length","area"]) {
  console.log("  parameter." + k + ": " + (paramFields[k] || 0) + "/" + N + " files, " + (paramTypes[k] || 0) + " instances");
}
console.log("  step.decisionPoint: " + (stepFields.decisionPoint || 0) + "/" + N + " files");
console.log("  step.media: " + (stepFields.media || 0) + "/" + N + " files");
