# Core / Extension field classification

Data-driven classification based on field-usage analysis across all 30 canonical protocol files
(5 baseline v0.1 + 15 test-set v0.2 + 6 stress-set v0.2 + 4 v0.3 cross-discipline exemplars).

**Rule:** CORE = used in ≥60% of files (≥18/30); EXT = 20–59% (6–17/30); RARE = <20% (<6/30).
RARE fields are kept in the schema but expected to be populated only in specialized protocols.
No field is removed from the schema unless it reaches 0% usage across two successive audits.

## Top-level sections

| Field | Usage | Tier | Notes |
|---|---|---|---|
| materials, equipment, steps, sources | 30/30 (required) | CORE | Schema-required |
| expectedOutputs | 30/30 | CORE | |
| troubleshooting | 30/30 | CORE | |
| biosafetyLevel | 30/30 | CORE | |
| limitations | 30/30 | CORE | |
| provenance | 30/30 | CORE | |
| safety | 29/30 | CORE | |
| controls | 26/30 | CORE | |
| samples | 25/30 | CORE | |
| tables | 22/30 | CORE | |
| containers | 21/30 | CORE | |
| studyDesign | 2/30 | RARE | In-vivo / comparative studies only |
| compliance | 2/30 | RARE | Ethics / regulatory (IACUC, IRB) |
| software | 1/30 | RARE | Computational / pipeline protocols only |

## Metadata

| Field | Usage | Tier |
|---|---|---|
| title, purpose | 30/30 (required) | CORE |
| scope, estimatedTime, beforeYouBegin | 30/30 | CORE |
| tags, family, category, version, protocolId | 30/30 | CORE |
| authors | 6/30 | EXT |
| license | 5/30 | RARE |
| discipline | 4/30 | RARE |
| doi | 2/30 | RARE |

## Material fields (beyond id, name)

| Field | Usage | Tier |
|---|---|---|
| specification | 29/30 | CORE |
| workingConcentration | 26/30 | CORE |
| rawText | 26/30 | CORE |
| needsReview | 25/30 | CORE |
| role | 24/30 | CORE |
| storage | 17/30 | EXT |
| hazard | 16/30 | EXT |
| vendor | 13/30 | EXT |
| sourceReferences | 13/30 | EXT |
| amount, unit | 10/30 | EXT |
| catalogNumber | 7/30 | EXT |
| casNumber | 5/30 | RARE |
| amountMax | 4/30 | RARE |
| rrid | 1/30 | RARE |
| smiles | 1/30 | RARE |
| molecularWeight | 1/30 | RARE |

## Step fields (beyond id, action)

| Field | Usage | Tier |
|---|---|---|
| number | 30/30 | CORE |
| equipmentIds | 30/30 | CORE |
| parameters | 30/30 | CORE |
| expectedResult | 29/30 | CORE |
| criticalNotes | 29/30 | CORE |
| phase | 28/30 | CORE |
| materialIds | 28/30 | CORE |
| inputIds | 25/30 | CORE |
| outputIds | 25/30 | CORE |
| tableIds | 22/30 | CORE |
| containerIds | 21/30 | CORE |
| sourceReferences | 16/30 | EXT |
| pausePoint | 15/30 | EXT |
| optional | 12/30 | EXT |
| safetyNotes | 9/30 | EXT |
| needsReview | 8/30 | EXT |
| branches | 7/30 | EXT |
| dependsOn | 4/30 | RARE |
| acceptanceCriteria | 4/30 | RARE |
| repeat | 4/30 | RARE |
| materialUses | 1/30 | RARE |
| softwareIds | 1/30 | RARE |
| command | 1/30 | RARE |

## Parameter fields (beyond type, rawText)

| Field | Instances | Tier |
|---|---|---|
| value | 636 | CORE |
| unit | 636 | CORE |
| valueMax | 82 | CORE |
| needsReview | 64 | CORE |
| comparator | 22 | EXT |
| formula | 19 | EXT |
| sourceReferences | 16 | EXT |
| valueText | 6 | EXT |
| perUnit | 1 | RARE |

## Parameter type distribution (26 active types)

| Type | Instances | Tier |
|---|---|---|
| volume | 159 | CORE |
| time | 147 | CORE |
| temperature | 90 | CORE |
| other | 41 | CORE |
| count | 38 | CORE |
| ratio | 32 | CORE |
| concentration | 26 | CORE |
| mass | 25 | CORE |
| speed | 20 | EXT |
| voltage | 15 | EXT |
| wavelength | 9 | EXT |
| amountOfSubstance | 8 | EXT |
| frequency | 6 | EXT |
| pressure | 4 | EXT |
| resistance | 4 | EXT |
| current | 3 | RARE |
| pH | 3 | RARE |
| capacitance | 3 | RARE |
| config | 3 | RARE |
| force | 2 | RARE |
| dataSize | 2 | RARE |
| flowRate | 1 | RARE |
| conductance | 1 | RARE |
| titer | 0 | RARE |
| power | 0 | RARE |
| energy | 0 | RARE |

## Trimmed in this pass

| Field | Reason | Migration |
|---|---|---|
| `parameter.precision` | 4 instances in 1 file; rawText already carries ± info | Deleted field; rawText preserved |
| `parameter.type: length` | 0 instances across 30 files | Removed from enum |
| `parameter.type: area` | 0 instances across 30 files | Removed from enum |
| `step.decisionPoint` | Redundant with `step.branches` (6/30 files) | Migrated text → `branches[0].condition` |
| `step.media` | 0/30 files | Removed from schema + $defs |

Migration script: `renderer/migrate-trim.mjs` (idempotent, run once).

## Deferred trims (next audit)

- `parameter.type: titer` (0 instances) — keep for now; animal/fermentation protocols may need it
- `parameter.type: power` (0 instances) — keep; physics/laser protocols expected
- `parameter.type: energy` (0 instances) — keep; physics protocols expected
- `material.rrid` (1/30) — keep; important for reproducibility when used
- `material.smiles/molecularWeight` (1/30) — keep; chemistry-specific but essential when present
