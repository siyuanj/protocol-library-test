# LabRecord Protocol Standard & Schema (Sections 1–2)

This folder delivers **Section 1 (Protocol Format Standard)** and **Section 2 (Canonical
Schema + renderer)** of the Protocol Library plan — the standard for the **protocol content
itself** (materials with amounts, equipment with settings, step-by-step typed parameters,
QC, controls), not the metadata catalog that lives elsewhere in the repo.

## Layout

```
protocol-standard/
├── 01-literature-summary.md     # Section 1.1: standards survey + comparison + citations
├── 02-format-standard.md        # Section 1.2/1.3: chosen format + justification + limitations
├── canonical-schema.json        # Section 2.1/2.2: the fixed JSON Schema (draft 2020-12)
├── examples/                    # Section 1.4 + Section 2.3: same protocols as .md and .json
│   ├── western-blot.{md,json}          # Section 1 example — from real teaching PDF
│   ├── qpcr.{md,json}                  # Section 1 example — MIQE-aligned
│   ├── cell-culture.{md,json}          # Section 1 example — mammalian subculture
│   ├── gel-filtration.{md,json}        # Real PDF test data (test_protocol/1-…pdf)
│   └── protein-concentration.{md,json} # Real PDF test data (test_protocol/2-…pdf)
├── renderer/                    # Section 2.4: JSON → protocol renderer
│   ├── renderer.js                     # framework-agnostic core (renderProtocolHTML)
│   ├── ProtocolRenderer.jsx            # React component for website integration
│   ├── styles.css                      # shared styles
│   ├── validate.mjs                    # schema + referential-integrity validator (0 deps)
│   ├── build-demo.mjs                  # bundles everything into demo.html
│   └── demo.html                       # built, self-contained demo (open directly)
└── serve.mjs                    # tiny static server for the demo over HTTP
```

## Deliverables → plan mapping

| Plan item | Deliverable |
|---|---|
| 1.1 literature summary | `01-literature-summary.md` |
| 1.2 selected format | `02-format-standard.md` |
| 1.3 justification + limitations | `02-format-standard.md` (justification paragraph) |
| 1.4 three examples in the format | `examples/{western-blot,qpcr,cell-culture}.md` |
| 2.1 refine schema | `canonical-schema.json` |
| 2.2 fixed JSON format | `canonical-schema.json` |
| 2.3 three JSON examples | `examples/{western-blot,qpcr,cell-culture}.json` |
| 2.4 JSON→protocol renderer | `renderer/` (all five render in `demo.html`) |
| (extra) real-PDF test data | `examples/{gel-filtration,protein-concentration}.{md,json}` |

## Run it

```bash
# 1. validate all JSON against the schema (structure + referential integrity)
node protocol-standard/renderer/validate.mjs

# 2. rebuild the self-contained demo after editing any JSON / renderer / css
node protocol-standard/renderer/build-demo.mjs

# 3a. open the demo directly: protocol-standard/renderer/demo.html   (works from file://)
# 3b. or serve over HTTP:
node protocol-standard/serve.mjs      # → http://localhost:4173/renderer/demo.html
```

Current status: `validate.mjs` = **5/5 PASS**; `demo.html` renders all five protocols
(verified in-browser, 0 console errors), including the 3-phase Protein Concentration case.

## Design in one paragraph

We **adapt** the human-readable section skeleton shared by Nature Protocols / STAR /
Bio-protocol, back every step with a **typed, unit- and range-aware JSON model** inspired by
the protocols.io step-component model, require the **17 reporting elements** from Giraldo *et al.*
2018 (PeerJ), carry **FAIR** license + provenance as first-class fields, and add a **`needsReview`**
flag so unstated values are marked rather than fabricated. Rationale and citations:
`02-format-standard.md` and `01-literature-summary.md`.

## Next (not in this folder)

- **Section 3** — Library, ownership, version design (Public/Private/Lab; reference/fork/version/lineage; submit→review→approve). The schema's `provenance` block is the forward-compatible hook.
- **Section 4** — Implement in DB + internal API + website (validate on save, migrate existing `{text, materials}`, three library views, runs bound to exact versions).
- **Section 5 / MCP parser** — deferred per current priority.
