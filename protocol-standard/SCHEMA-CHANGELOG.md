# Canonical schema — changelog & versioning policy

**Policy (contract):** changes *within* nothing — every change is **additive and backward-compatible**;
older documents stay valid. Adding a *required* field, renaming, or removing a field requires a
**version bump + a migrator**. `MAX_SUPPORTED_VERSION = 0.3`. All versions validate with
`renderer/validate.mjs` (referential integrity) + `renderer/validate-schema.mjs` (full JSON Schema, ajv).

## v0.1 — content baseline
Protocol *content* (not catalog metadata): `metadata` (title/purpose/family/category/scope/estimatedTime/beforeYouBegin/tags), `materials`, `equipment`, `steps` (action + typed `parameters` + expectedResult + criticalNotes + phase), `controls`, `expectedOutputs`, `troubleshooting`, `safety`, `biosafetyLevel`, `limitations`, `sources`, `provenance`. Core idea: typed parameters (value/valueMax/unit/rawText), `needsReview` (never fabricate), id references (m#/e#/s#/src#).

## v0.2 — structure & FAIR (additive)
Added (all optional): `samples` + step `inputIds`/`outputIds` (input→output flow); `containers` (+wells); `tables` (dilution series/programs/layouts); material `role`/`casNumber`/`rrid`/`lot`/`storage`/`hazard`; metadata `authors`/`license`/`doi`/`createdAt`/`modifiedAt`; parameter `precision`; step `branches`/`pausePoint`/`media`. → v0.1 files remain valid.
*Test:* 15 classic bio protocols encoded; 20/20 valid. Validated that samples/containers/tables/inputs/outputs are heavily used; `precision`/`media` unused → both removed in v0.3 trim pass.

## v0.3 — cross-discipline (additive)
Motivated by a break-the-schema stress test (chemistry / physics / computational / in-vivo). Added (all optional):
- **Computational:** `software[]` (+step `softwareIds`, `command`); `sample.kind`=dataset/digital + `dataType`; `parameter.type` `config` + `parameter.valueText` (flags/qualitative).
- **Chemistry:** step `materialUses[]` (bind a per-step amount to a material; `equivalents`, `limitingReagent`); material `smiles`/`molecularWeight`; `parameter.type` `amountOfSubstance`; `parameter.perUnit`/`formula` (e.g. `min/kb`, `pmol=(ng*1000)/(bp*650)`); `comparator` (min/max/approx…).
- **Physics/instrument:** `parameter.type` `resistance`/`capacitance`/`conductance`/`power`/`flowRate`/`titer`; `step.repeat` (cycles/sweeps/until) for stimulus programs & iteration.
- **In-vivo / studies:** `studyDesign` (groups/N/randomization/blinding/timepoints/statisticalPlan); `compliance` (IACUC/IRB/consent/wasteDisposal) — fixes the "biosafetyLevel misused as ethics" gap.
- **QC & geometry:** step `acceptanceCriteria[]` (parameter/comparator/value/classification/onFailStepId); `container.layout[]` (per-well sample/material + factorial axis/level); `table.kind` + `table.needsReview`.
- **Parity:** `equipment.rawText`; `parameter.sourceReferences`; `metadata.discipline`.
→ all 26 prior files remain valid (27/27 with the v0.3 computational demo).

## v0.3 trim pass — minimization (subtractive)

Data-driven cleanup using `renderer/analyze-all.mjs` across all 30 files.
Migration script: `renderer/migrate-trim.mjs`. See `core-extension-spec.md` for full classification.

**Removed:**
- `parameter.precision` (4 instances in 1 file → rawText already carries ± info)
- `parameter.type: length` (0 instances)
- `parameter.type: area` (0 instances)
- `step.decisionPoint` (6 files → migrated text into `branches[0].condition`)
- `step.media` + `$defs/media` (0/30 files)

**Result:** parameter.type enum reduced 28 → 26. Schema leaner by 5 properties + 1 $def.
All 30 files pass both validators after migration (30/30 PASS).

**Formalized:** Core / Extension / Rare three-tier classification in `core-extension-spec.md`.
- CORE (≥60% of files): 11/13 top-level sections, all metadata basics, most step fields
- EXT (20–59%): storage, hazard, vendor, pausePoint, branches, comparator, formula
- RARE (<20%): studyDesign, compliance, software, smiles, dependsOn, materialUses

### Deferred trims (next audit)
- `parameter.type: titer/power/energy` (0 instances, but expected in future discipline-specific protocols)
- `material.rrid/smiles/molecularWeight` (1/30 each, but essential when present)
