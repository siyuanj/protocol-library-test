# Lessons from real GitHub issues (for schema v0.2)

Survey of notable, real issues in comparable open-source protocol/schema projects, and how
each lesson maps to our design. Every issue URL was fetched/verified (2026-08-21).

## Notable issues by project

### Bioprotocols/LabOP
- [#11 Commitment to RDF?](https://github.com/Bioprotocols/labop/issues/11) — pick your canonical serialization deliberately; RDF is clumsy for ordered lists/arrays (a point for our JSON-native choice).
- [#13 Implicit fork/join](https://github.com/Bioprotocols/labop/issues/13) — requiring explicit control-flow nodes everywhere is "unnecessarily awkward"; allow implicit ordering, reserve explicit branching for genuine concurrency.
- [#183 Associating measurement data and sample descriptions](https://github.com/Bioprotocols/labop/issues/183) — make sample identity first-class so results trace back to what produced them.
- [#178 Uncertainties](https://github.com/Bioprotocols/labop/issues/178) — measurement uncertainty/tolerance left unresolved; bake ranges/uncertainty in early.

### ISA-tools (isa-api / isa-specs)
- [isa-specs #16 Numeric value forced with units?](https://github.com/ISA-tools/isa-specs/issues/16) — distinguish "not applicable"/absent from a measured zero.
- [isa-api #30 Numeric factor values](https://github.com/ISA-tools/isa-api/issues/30) — a value slot must be a union of {ontology term, numeric+unit, plain numeric}.
- [isa-api #339 Factor values overwritten](https://github.com/ISA-tools/isa-api/issues/339) — same-named value instances silently overwrote each other; isolate identity + validate duplicates.
- [isa-api #432 Type resolution typo](https://github.com/ISA-tools/isa-api/issues/432) — string-keyed type systems fail silently on identifier typos; centralize/validate type tokens.

### Opentrons (protocol schema versioning — the best real migration case)
- [protocol schema README](https://github.com/Opentrons/opentrons/blob/edge/shared-data/protocol/README.md) — a schema is a strict producer/consumer contract; each version bump = new `${v}.json` + TS **and** Python types + executor + fixtures.
- [PR #8271 schema V6](https://github.com/Opentrons/opentrons/pull/8271) — make the step/command object uniform + extensible (`custom` + additionalProperties), and group atomic commands into higher-level steps.
- [PR #18815 additive field on existing version](https://github.com/Opentrons/opentrons/pull/18815) — add backwards-compatible fields without a major bump; reserve bumps for breaking changes.
- [PR #14465 parallelize migration](https://github.com/Opentrons/opentrons/pull/14465) — migrating 88k records took ~625s; migration performance is a first-class concern.

### Open Reaction Database (ord-schema)
- [#156 Ambiguous defaults](https://github.com/open-reaction-database/ord-schema/issues/156) — model "unset vs zero" explicitly; never let a default masquerade as data.
- [#229 Float precision on round-trip](https://github.com/open-reaction-database/ord-schema/issues/229) — enforce precision/sig-figs at the serialization boundary.
- [#511 Internal standards vs products](https://github.com/open-reaction-database/ord-schema/issues/511) — decouple a component's **role** from its **identity** and **amount**.
- [#556 De-nest VesselType](https://github.com/open-reaction-database/ord-schema/issues/556) — every nesting layer must earn its place.

### protocols.io schema mirror
- [ethanwillis/protocolsio_schemas](https://github.com/ethanwillis/protocolsio_schemas) — dormant (0 issues), but its README states only `id, title, uri, created_on` are reliably non-null. **In a real corpus almost everything is absent** → make very few fields required; pin the schema to a stated source version.

### BioSchemas LabProtocol
- [#677 conflates abstract protocol and execution](https://github.com/BioSchemas/specifications/issues/677) — separate the protocol (plan) from a run (execution) and link them (PROV-O/CreateAction).
- [#441 totalTime ambiguous](https://github.com/BioSchemas/specifications/issues/441) — define every duration/typed field precisely (hands-on vs wall-clock).
- [#667 PropertyValue fallback](https://github.com/BioSchemas/specifications/issues/667) — provide a structured value-with-unit type wherever a controlled term may not fit.
- [PR #719 release prep](https://github.com/BioSchemas/specifications/pull/719) — reached release by making **all** mandatory fields "recommended"; minimal-required-fields is release-gating.

### Common Workflow Language (cwl-v1.2)
- [#146 conditional output nullability](https://github.com/common-workflow-language/cwl-v1.2/issues/146) — a `when` step may not run; propagate optionality through the graph.
- [#78 Clarify type system](https://github.com/common-workflow-language/cwl-v1.2/issues/78) — document the type algebra (optional/array/union/record) centrally.
- [#278 strict schema for tooling](https://github.com/common-workflow-language/cwl-v1.2/issues/278) — publish a strict schema (`additionalProperties:false`) for IDE/CI validation.

## Top 10 cross-project lessons → our status

| # | Lesson | Our v0.1 status | v0.2 action |
|---|---|---|---|
| 1 | Never store a bare number — bind value + unit (+ precision); "N/A" ≠ 0 ≠ null | Partial: `value/valueMax/unit/rawText`, value nullable | Add optional `precision`/`tolerance`; keep null = unstated |
| 2 | Separate material **identity / amount / role** | Partial: amount on material + amount in step params | Split into `Material{identity}` + per-step `usage{amount, role}` |
| 3 | Distinguish "unset" vs zero; control float precision | Good: nullable values; strings carry `rawText` | Document precision policy at (de)serialization |
| 4 | Model **protocol (plan) vs run (execution)** separately, linked | Good: `provenance` block + `Run` in [Section 3](03-library-version-design.md) | Add explicit `Run` schema + PROV link |
| 5 | Lightweight control flow by default; explicit branching/loops where needed; propagate optionality | Partial: `dependsOn`, `decisionPoint`, `optional` | Add structured `cases[]`/`repeat`; optional expectedResult `onFail` |
| 6 | Schema versioning is a contract; additive changes; ship migrators; few schema families | Have `schemaVersion:"0.1"` | Write a MIGRATION note + `MAX_SUPPORTED_VERSION` policy before v0.2 |
| 7 | Publish a **strict** schema (`additionalProperties:false`); one canonical format + validated exports | **Good: `additionalProperties:false` everywhere** + `validate.mjs` | Add JSON-LD `@context` export for FAIR |
| 8 | Stable, namespaced, globally-unique IDs; don't rely on names | Local `m#/e#/s#/src#` + `provenance.versionId` | Add optional global `@id`/URI per version |
| 9 | Document the type system (optional/array/union/value-with-unit) centrally | Enum + `other` catch-all; free-text unit | Centralize a `Quantity` value type (value/unit/min/max/precision) |
| 10 | Plan adoption/extensibility; minimal required fields; reference examples | **Good: few required fields; 5 reference examples; `other` escape hatch** | Keep required set minimal as fields grow |

**Two things that would put us ahead of all seven** (both surfaced as unresolved elsewhere): treat
**ranges/tolerance/uncertainty** as first-class in the `Quantity` type (LabOP #178), and make
**almost everything optional by default** (protocols.io: only 4 fields reliably non-null).

Where we already align well: strict `additionalProperties:false`, minimal required fields,
plan-vs-execution separation (provenance + Section-3 runs), and a JSON-native (not RDF) core.
