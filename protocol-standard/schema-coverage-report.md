# Schema coverage report — 15 classic protocols (v0.2 test set)

**Method.** 15 classic experiments were sourced from real authoritative references and encoded
into the canonical v0.2 JSON by 5 parallel encoders, then checked by two validators:
`renderer/validate.mjs` (referential integrity) and `renderer/validate-schema.mjs` (full JSON
Schema draft 2020-12 via ajv). Field usage was measured by `renderer/analyze-fields.mjs`.

**Headline result.** **20/20 files pass both validators** (15 test + 5 baseline). Every encoder
independently judged that the schema clears the bar you set — *"read the JSON → run the experiment"* —
for all 15: every load-bearing volume/time/temperature/concentration is captured, and unstated values
are flagged `needsReview` rather than fabricated. The schema is **execute-*in* ready**; the main
weakness is it is not yet **capture-*out* ready** (structured results). Full list:

| Discipline | Protocols encoded |
|---|---|
| Cloning | heat-shock transformation · plasmid miniprep · agarose gel electrophoresis |
| Nucleic acid | standard PCR · TRIzol RNA extraction · reverse transcription |
| Protein | Ni-NTA purification · SDS-PAGE · Gibson assembly |
| Immuno/imaging | sandwich ELISA · immunofluorescence · flow cytometry (surface) |
| Cell-based | MTT viability · bacterial growth curve · lipofection |

---

## A. What's MISSING (prioritized — from encoder critiques, all corroborated)

| # | Gap | Evidence (which protocols) | Proposed v0.3 |
|---|---|---|---|
| 1 | **Iteration / repeat / cycle** — no native repeat construct | PCR "30 cycles" (flattened to a table), Ni-NTA "4×0.5 mL elution", phage-panning rounds, growth-curve "every 30 min until plateau" | `step.repeat: { count \| untilCondition }` or a `cycle` block; also covers thermocycling natively |
| 2 | **Structured measured OUTPUTS / results** — `expectedOutputs` is free text only | OD600 time-course, MTT dose-response, per-well OD570−OD630 have "nowhere structured to live" | a `results`/`measurements` object (part of the Run/execution layer): {parameter, container/well, value+unit, timepoint} |
| 3 | **Plate layout: bind sample→well** — `tables` and `containers` are disjoint; no coordinates; `tables` lack `needsReview`/`sourceReferences`/per-cell units | ELISA/flow/MTT plate maps are just string grids | `container.layout: [{well, sampleId/materialId, ...}]`; add table cell metadata |
| 4 | **Discrete choices vs range** — a range was overloaded to mean "two options" | lipofection "0.75 and 1.5 µL"; oligo-dT vs random hexamer | `parameter.choices: []` (distinct from `value`/`valueMax` range) |
| 5 | **Derived / per-unit quantities** — no home for formulas or "per-X" | Gibson `pmol=(ng*1000)/(bp*650)`, "1 min/kb", "5 µL per 25 µL sample", "2 µL/µg DNA" | `parameter.perUnit` / `parameter.formula` (kept alongside `rawText`) |
| 6 | **Provenance parity** — `equipment` has no `rawText`; `parameter` has no `sourceReferences` | "42 °C water bath" lost to paraphrase; SDS-PAGE 200 V from a different source can't be cited at value level | add `equipment.rawText` and `parameter.sourceReferences` |
| 7 | **Gradient / stepped series** | Ni-NTA imidazole 10/20/250 mM (flattened to table, buffer repeated 3×) | a light series representation, or keep in `tables` with typed cells |
| 8 | **Structured entity attributes** — antibody host/target/fluorophore, secondary↔primary link, fluorophore→channel | IF & flow buried these in `name`/`specification` | optional typed attributes on material (esp. antibodies) |
| 9 | **QC / acceptance-criterion object** | A260/A280≈2 encoded via `branches`+param, ad hoc | structured acceptance on `expectedResult` |

**Top 2 to fix first:** #1 (repeat/cycle) and #2 (results capture) — they are the two most-repeated gaps and together turn the format from "a recipe you can read" into "a record you can run and fill in."

---

## B. What's REDUNDANT / under-used (objective, 15-file usage)

Legend: files-using / 15.

**Genuinely unused (0/15) — strong cut candidates:**
- `parameter.precision` — 0/15 (every encoder flagged it).
- `step.media` — 0/15 (still useful for figure-heavy protocols like WB Fig.1 — keep optional, low priority).
- `metadata.license`, `metadata.doi`, `metadata.createdAt`, `metadata.modifiedAt` — 0/15.

**Rarely used (≤4/15) — keep only as "Extension" (library/traceability layer), not core:**
- `material.rrid` 1/15, `material.casNumber` 2/15 — "rarely fillable" from sources (identity/traceability; keep optional).
- `material.amountMax` 4/15, `material.amount`/`unit` 6/15 — most amounts live in **step parameters** + `workingConcentration` (13/15). Material-level scalar amount is largely redundant.
- `metadata.authors` 2/15, `equipment.model` 3/15, `equipment.sourceReferences` 1/15, `sample.derivedFromMaterialId` 4/15.
- `step.decisionPoint` 4/15 overlaps `step.branches` 5/15 → **consolidate to `branches`** in v0.3.

**`parameter.type` enum — usage:** time 75 · volume 65 · temperature 51 · count 19 · concentration 14 · ratio 10 · wavelength 8 · speed 8 · other 5 · voltage 2 · mass 2. **Never used:** `pH, length, area, pressure, frequency, current, force, energy, dataSize`.
→ **Do NOT trim the enum yet** — the unused ones are exactly the cross-discipline types (chem/physics/bioinformatics) that the *break-the-schema* set will exercise. Re-evaluate after that.

**Heavily used → validated as core (keep):** `samples` 15/15, `containers` 15/15, `tables` 13/15, and step `inputIds`/`outputIds`/`containerIds` 15/15, `tableIds` 13/15 — i.e. **every v0.2 addition earned its place** except `precision`/`media`. `parameter.valueMax` 14/15 confirms ranges are essential.

---

## C. "Complete now, minimal later" → the Core / Extension split

The usage data gives a clean, data-driven two-tier design (do the *trimming* after break-the-schema):

- **Core (used ~15/15, required-ish):** schemaVersion; metadata{title, purpose, family, category, scope, estimatedTime, beforeYouBegin, tags}; materials{id, name, role, specification, workingConcentration|(amount+unit), storage, rawText, needsReview}; equipment{id, name, settings}; samples{id, name, role, description}; containers{id, name, type}; steps{id, number, action, phase, materialIds, equipmentIds, inputIds, outputIds, containerIds, tableIds, parameters, expectedResult, criticalNotes}; parameters{type, value, valueMax, unit, rawText}; controls; expectedOutputs; troubleshooting; safety; biosafetyLevel; limitations; sources; provenance.
- **Extension (optional, sparse but valuable):** authors/license/doi/timestamps (FAIR/library); rrid/casNumber/lot/vendor/catalogNumber/hazard (traceability); sourceReferences everywhere; branches/pausePoint/safetyNotes; sample.derivedFromMaterialId; table.note.
- **Cut in v0.3:** `parameter.precision`; fold `decisionPoint`→`branches`; make material-level `amount` clearly optional (prefer step parameters).

---

## D. Proposed v0.3 change list

**Add (executability):** step `repeat{count|until}`; a `results`/`measurements` object (Run layer); `container.layout` (sample→well) + table cell metadata; `parameter.choices`; `parameter.perUnit`/`formula`; `equipment.rawText`; `parameter.sourceReferences`.
**Cut/merge:** drop `parameter.precision`; merge `decisionPoint` into `branches`.
**Defer:** trimming the unused `parameter.type` values until the break-the-schema set (chem/physics/bioinformatics/animal) reports.

> Next: the **break-the-schema** stress set deliberately targets loops, plate-matrices, time-series,
> animal-study design, bioinformatics, and chemistry to force out any remaining gaps before we
> freeze v0.3. Results will be appended here.
