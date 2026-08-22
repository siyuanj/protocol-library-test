# Section 1.2–1.3 — The LabRecord Protocol Format v0.1

## Decision: adapt (not adopt wholesale, not design from scratch)

No existing standard is *readable + typed-structured + executable-ready + FAIR* at once
(see [`01-literature-summary.md`](01-literature-summary.md)). So LabRecord **adapts**:

- the **human-readable section skeleton** shared by Nature Protocols / STAR / Bio-protocol / Current Protocols,
- the **typed step-component model** of protocols.io (plus EXACT-style action+parameter thinking),
- the **17 required data elements** of the Giraldo *et al.* 2018 reporting guideline (PeerJ, DOI 10.7717/peerj.4795),
- **FAIR** mechanisms (DOIs/version IDs, machine-readable license, plan-vs-execution provenance à la OBI/PROV),

and **adds** one new first-class idea — a **`needsReview`** flag on any value — generalizing MIQE's Essential/Desirable tiering so unstated values are marked, never fabricated.

## The format (fixed section layout)

Every LabRecord protocol has this order. Sections with no content are omitted in the rendered view; **bold** sections are required.

```
# <Protocol Title>
metadata badges: family · category · version · estimated time · needsReview count · status

**Purpose:**            one–two sentences: what it accomplishes
Scope / Applicability:  what it covers and explicit out-of-scope conditions
Estimated time:         human-readable duration
Before You Begin:       prerequisites / preparation bullets

## **Materials and Reagents**   table: Name | Amount / Working conc. | Specification / Grade | Vendor / Cat#
## Equipment and Settings       table: Name | Model | Settings
## **Procedure**                grouped by Phase; table: Step | Action | Parameters | Expected Result / QC | Critical Notes
## Controls
## Expected Outputs
## Troubleshooting               table: Problem | Likely cause | Solution
## Safety                        (+ biosafety level badge)
## Limitations
## **Sources and License**       file / DOI / URL + license (+ verified flag)
```

**The Procedure table is the core.** Its five columns map 1:1 to the canonical schema:

| Column | Schema field | Notes |
|---|---|---|
| Step | `step.number` | continuous across phases |
| Action | `step.action` (+ `materialIds`/`equipmentIds` chips, `optional`, `decisionPoint`) | imperative; references resolve to Materials/Equipment |
| Parameters | `step.parameters[]` (typed: time/temperature/volume/speed/concentration/…) | each has a value (or range via `valueMax`), unit, and verbatim `rawText` |
| Expected Result / QC | `step.expectedResult` | the per-step check (Nature "Anticipated Results" / STAR "Expected outcomes") |
| Critical Notes | `step.criticalNotes` (+ `safetyNotes`) | CRITICAL STEP / CAUTION / PAUSE POINT equivalent |

**Cross-cutting conventions**
- **Phases** group steps (e.g. SDS-PAGE → Transfer → Immunoblotting) — like protocols.io Sections / HowToSection / Nature "stages".
- **`needsReview`** on any material, equipment, step, or parameter renders an orange flag; the schema forbids inventing values, so an unstated dose/time/lot is flagged, not guessed.
- **Ranges** are first-class (`value` + `valueMax`), directly fixing the "room temperature / 3–5 min" under-specification gap Giraldo documented.
- **Provenance** (`library` / `owner` / `status` / version links) is carried but not shown as procedure content — it is the hook for the Library & Version design (Section 3).
- **Sources + license** are required and machine-readable (FAIR R1.1/R1.2).

## Justification paragraph (Section 1.3 deliverable)

> **Why this format, and its limits.** We adapt rather than adopt because the surveyed standards
> split cleanly into human-readable article formats that are easy to author but not machine-usable
> (Nature Protocols, STAR, Bio-protocol, JoVE), and machine-readable models that are rigorous but too
> heavy or too execution-specific for a v0.1 human+web library (SMART Protocols/OBI/EXACT ontologies;
> Autoprotocol/LabOP robot languages). Our format keeps the **convergent section skeleton** those journals
> already share — so it reads like a protocol scientists trust — while backing every step with a **typed,
> unit-bearing, range-aware JSON model** inspired by protocols.io's step-components and validated against a
> strict schema. It encodes the **17 reporting elements** shown to matter for reproducibility (Giraldo 2018),
> carries **FAIR** provenance and license as first-class fields, and introduces a **`needsReview`** flag so an
> LLM parser or curator marks unstated values instead of fabricating them. **Limitations:** v0.1 has no
> first-class object for embedded data tables (e.g. standard-curve dilution series are captured compactly in
> step notes), no controlled-vocabulary/ontology binding yet (reagent and action names are free text, not
> ChEBI/EXACT terms), no unit *ontology* enforcing dimensional correctness, and only lightweight
> dependency/branching (`dependsOn`, `decisionPoint`) rather than a full workflow/control-flow language.
> It is deliberately mappable to those richer standards later, but does not yet interoperate with them or
> drive lab automation.

## Deliverables produced against this format

- **Three required examples** rewritten in the format: [Western blot](examples/western-blot.md) (from the real teaching PDF), [RT-qPCR](examples/qpcr.md) (MIQE-aligned), [cell-culture subculture](examples/cell-culture.md).
- **Two real-PDF test cases** generated into the format: [Gel Filtration](examples/gel-filtration.md), [Protein Concentration](examples/protein-concentration.md).
- The machine-readable counterpart (schema + JSON + renderer) is Section 2: [`canonical-schema.json`](canonical-schema.json), the JSON in [`examples/`](examples/), and the renderer in [`renderer/`](renderer/).

## Field-to-source rationale (summary)

| Format element | Adapted from | Reference |
|---|---|---|
| Section skeleton (Purpose→Sources) | Nature Protocols / STAR / Bio-protocol / Current Protocols | §B of literature summary |
| Materials with amount + spec + vendor/cat# | Giraldo 17-element; STAR Key Resources Table | DOI 10.7717/peerj.4795 |
| Equipment with model + settings | Bioschemas `labEquipment`; Giraldo | — |
| Typed step parameters (+ ranges, rawText) | protocols.io step components; EXACT descriptors | DOI 10.1186/1471-2105-15-S14-S5 |
| Per-step Expected Result / QC | Nature "Anticipated Results"; STAR "Expected outcomes" | §B |
| Phases | protocols.io Sections; HowToSection | schema.org/HowToSection |
| Controls / Troubleshooting / Safety | universal skeleton | §B |
| `needsReview` | MIQE Essential/Desirable tiering (generalized) | DOI 10.1373/clinchem.2008.112797 |
| Provenance (plan vs execution, version links) | OBI planned-process; PROV-O; protocols.io fork/version/DOI | DOI 10.1371/journal.pone.0154556 |
| License (machine-readable, verified flag) | FAIR R1.1 | DOI 10.1038/sdata.2016.18 |
