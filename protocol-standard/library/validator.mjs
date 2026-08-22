/**
 * Section 4 -- Save-before-store validation.
 *
 * Combines:
 *   1. Referential integrity checks (logic extracted from renderer/validate.mjs)
 *   2. Full JSON Schema validation via ajv (if available in the repo)
 *
 * Export: validateProtocol(body) -> { valid: boolean, errors: string[] }
 *
 * Every write path in the library must call this before storing a protocol.
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = join(__dirname, '..');
const schema    = JSON.parse(readFileSync(join(root, 'canonical-schema.json'), 'utf8'));

// Enums pulled from the canonical schema (same approach as renderer/validate.mjs)
const paramTypes     = schema.$defs.parameter.properties.type.enum;
const provStatus     = schema.$defs.provenance.properties.status.enum;
const provLibrary    = schema.$defs.provenance.properties.library.enum;
const schemaVersions = schema.properties.schemaVersion.enum;

/* ------------------------------------------------------------------ */
/*  Optional: full JSON Schema validation via ajv                      */
/* ------------------------------------------------------------------ */

let ajvValidate = null;
try {
  const require  = createRequire(import.meta.url);
  const repoRoot = join(root, '..');

  function findPkg(name) {
    for (const base of ['labrecord-protocol-mcp-demo', 'mcp-demo']) {
      const p = join(repoRoot, base, 'node_modules', name);
      if (existsSync(p)) return p;
    }
    return name;                       // fall back to normal resolution
  }

  const ajvDir = findPkg('ajv');
  let Ajv = require(join(ajvDir, 'dist', '2020.js'));
  Ajv = Ajv.default || Ajv;
  let addFormats = require(findPkg('ajv-formats'));
  addFormats = addFormats.default || addFormats;

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  ajvValidate = ajv.compile(schema);
  console.log('[validator] JSON Schema validation enabled (ajv loaded)');
} catch {
  console.log('[validator] JSON Schema validation disabled (ajv not found); referential integrity checks active');
}

/* ------------------------------------------------------------------ */
/*  Referential integrity validation                                   */
/*  (logic extracted from renderer/validate.mjs, adapted to work on    */
/*   a protocol object instead of reading from disk)                   */
/* ------------------------------------------------------------------ */

function validateReferentialIntegrity(p) {
  const errors = [];
  const check  = (cond, msg) => { if (!cond) errors.push(msg); };

  // Schema version
  check(schemaVersions.includes(p.schemaVersion),
    `schemaVersion must be one of ${schemaVersions.join('/')}`);

  // Metadata
  check(p.metadata && !!p.metadata.title,   'metadata.title required');
  check(p.metadata && !!p.metadata.purpose,  'metadata.purpose required');

  // ---- collect IDs per entity type ----

  const matIds = new Set();
  (p.materials || []).forEach((x, i) => {
    check(/^m\d+$/.test(x.id || ''), `materials[${i}].id must match m# (got ${x.id})`);
    check(!matIds.has(x.id), `duplicate material id ${x.id}`);
    matIds.add(x.id);
    check(!!x.name, `materials[${i}].name required`);
  });

  const eqIds = new Set();
  (p.equipment || []).forEach((x, i) => {
    check(/^e\d+$/.test(x.id || ''), `equipment[${i}].id must match e# (got ${x.id})`);
    check(!eqIds.has(x.id), `duplicate equipment id ${x.id}`);
    eqIds.add(x.id);
    check(!!x.name, `equipment[${i}].name required`);
  });

  const swIds = new Set();
  (p.software || []).forEach((x, i) => {
    check(/^sw\d+$/.test(x.id || ''), `software[${i}].id must match sw# (got ${x.id})`);
    check(!swIds.has(x.id), `duplicate software id ${x.id}`);
    swIds.add(x.id);
    check(!!x.name, `software[${i}].name required`);
  });

  const sampleIds = new Set();
  (p.samples || []).forEach((x, i) => {
    check(/^sp\d+$/.test(x.id || ''), `samples[${i}].id must match sp# (got ${x.id})`);
    check(!sampleIds.has(x.id), `duplicate sample id ${x.id}`);
    sampleIds.add(x.id);
    check(!!x.name, `samples[${i}].name required`);
    check(!!x.role,  `samples[${i}].role required`);
    if (x.derivedFromMaterialId) {
      check(matIds.has(x.derivedFromMaterialId),
        `sample ${x.id} derivedFromMaterialId missing ${x.derivedFromMaterialId}`);
    }
  });

  const containerIds = new Set();
  (p.containers || []).forEach((x, i) => {
    check(/^c\d+$/.test(x.id || ''), `containers[${i}].id must match c# (got ${x.id})`);
    check(!containerIds.has(x.id), `duplicate container id ${x.id}`);
    containerIds.add(x.id);
    check(!!x.name, `containers[${i}].name required`);
    (x.layout || []).forEach((cell) => {
      if (cell.sampleId) {
        check(sampleIds.has(cell.sampleId),
          `container ${x.id} layout sampleId missing ${cell.sampleId}`);
      }
      if (cell.materialId) {
        check(matIds.has(cell.materialId),
          `container ${x.id} layout materialId missing ${cell.materialId}`);
      }
    });
  });

  const tableIds = new Set();
  (p.tables || []).forEach((x, i) => {
    check(/^t\d+$/.test(x.id || ''), `tables[${i}].id must match t# (got ${x.id})`);
    check(!tableIds.has(x.id), `duplicate table id ${x.id}`);
    tableIds.add(x.id);
    check(Array.isArray(x.columns) && x.columns.length >= 1, `tables[${i}].columns required`);
    check(Array.isArray(x.rows), `tables[${i}].rows required`);
  });

  const srcIds = new Set();
  (p.sources || []).forEach((x, i) => {
    check(/^src\d+$/.test(x.id || ''), `sources[${i}].id must match src# (got ${x.id})`);
    srcIds.add(x.id);
  });
  check((p.sources || []).length >= 1, 'at least one source required');

  // ---- steps: IDs, actions, cross-references ----

  check((p.steps || []).length >= 1, 'at least one step required');

  const stepIds = new Set();
  (p.steps || []).forEach((s) => stepIds.add(s.id));

  (p.steps || []).forEach((s, i) => {
    check(/^s\d+$/.test(s.id || ''), `steps[${i}].id must match s# (got ${s.id})`);
    check(!!s.action, `steps[${i}].action required`);

    (s.materialIds || []).forEach((id) =>
      check(matIds.has(id), `step ${s.id} references missing material ${id}`));
    (s.materialUses || []).forEach((mu) =>
      check(matIds.has(mu.materialId),
        `step ${s.id} materialUses missing material ${mu.materialId}`));
    (s.equipmentIds || []).forEach((id) =>
      check(eqIds.has(id), `step ${s.id} references missing equipment ${id}`));
    (s.softwareIds || []).forEach((id) =>
      check(swIds.has(id), `step ${s.id} softwareIds missing ${id}`));
    (s.acceptanceCriteria || []).forEach((ac) => {
      if (ac.onFailStepId) {
        check(stepIds.has(ac.onFailStepId),
          `step ${s.id} acceptance onFailStepId missing ${ac.onFailStepId}`);
      }
    });
    (s.inputIds || []).forEach((id) =>
      check(matIds.has(id) || sampleIds.has(id),
        `step ${s.id} inputIds missing ${id}`));
    (s.outputIds || []).forEach((id) =>
      check(sampleIds.has(id), `step ${s.id} outputIds missing sample ${id}`));
    (s.containerIds || []).forEach((id) =>
      check(containerIds.has(id), `step ${s.id} containerIds missing ${id}`));
    (s.tableIds || []).forEach((id) =>
      check(tableIds.has(id), `step ${s.id} tableIds missing ${id}`));
    (s.dependsOn || []).forEach((id) =>
      check(stepIds.has(id), `step ${s.id} dependsOn missing ${id}`));
    (s.branches || []).forEach((b) => {
      if (b.targetStepId) {
        check(stepIds.has(b.targetStepId),
          `step ${s.id} branch targetStepId missing ${b.targetStepId}`);
      }
    });
    (s.parameters || []).forEach((pr, j) => {
      check(paramTypes.includes(pr.type),
        `step ${s.id} param[${j}].type invalid: ${pr.type}`);
      check(!!pr.rawText,
        `step ${s.id} param[${j}].rawText required`);
    });
    (s.sourceReferences || []).forEach((r) =>
      check(srcIds.has(r.sourceId),
        `step ${s.id} sourceRef missing ${r.sourceId}`));
  });

  // ---- provenance (optional) ----

  if (p.provenance) {
    if (p.provenance.status) {
      check(provStatus.includes(p.provenance.status),
        `provenance.status invalid: ${p.provenance.status}`);
    }
    if (p.provenance.library) {
      check(provLibrary.includes(p.provenance.library),
        `provenance.library invalid: ${p.provenance.library}`);
    }
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Validate a protocol body before storing.
 *
 * @param  {Object} body - The canonical protocol JSON object
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProtocol(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Protocol body must be a non-null object'] };
  }

  const errors = [];

  // 1. Full JSON Schema validation (if ajv is available)
  if (ajvValidate) {
    if (!ajvValidate(body)) {
      for (const err of (ajvValidate.errors || []).slice(0, 20)) {
        errors.push(`[schema] ${err.instancePath || '(root)'} ${err.message}`);
      }
    }
  }

  // 2. Referential integrity (always runs)
  errors.push(...validateReferentialIntegrity(body));

  return { valid: errors.length === 0, errors };
}
