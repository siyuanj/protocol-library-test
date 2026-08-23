# Protocol Conversion Specification

Rules for converting protocol source material (PDF, web page, kit insert) into canonical JSON (schema v0.3).
Applies to both human and AI conversion. Violations produce incomplete SOPs that cannot be safely followed at the bench.

## Core Principle: Preserve Original Text

**Use verbatim source text. Do not paraphrase, summarize, or "improve" wording.**

Rationale: protocol language is precise. "Mix gently by inverting 4-6 times" and "mix thoroughly" are different instructions. "Do not vortex after adding P2" is a critical warning that disappears when you rewrite the step as "add Buffer P2 and mix." Information lost during conversion cannot be recovered without re-reading the source.

## Mandatory Sections

Every conversion MUST populate ALL of the following. If the source does not provide content for a section, mark it `"needsReview": true` with a note — do NOT leave it as an empty array `[]`.

| JSON field | Source section (typical) | Never skip because... |
|---|---|---|
| `metadata.beforeYouBegin` | "Before You Start", "General Setup Rules" | Pre-experiment checks prevent wasted runs |
| `materials` | "Materials", "Reagents", "Components" | Missing reagents = experiment cannot start |
| `equipment` | "Equipment", "Instruments" | Missing equipment = experiment cannot start |
| `tables` | Reaction setup, cycling program, recipe | Tables carry the quantitative core of many protocols |
| `steps` | "Procedure", "Directions", "Protocol" | The procedure itself |
| `controls` | "Controls", "Controls and Acceptance" | No controls = no way to validate results |
| `expectedOutputs` | "Expected Results", "QC and Acceptance" | Operator needs to know what success looks like |
| `troubleshooting` | "Troubleshooting" | First thing consulted when something goes wrong |
| `safety` | "Safety", "Handling Rules", "Hazards" | Legal and physical safety obligation |
| `sources` | "References", "Source URLs" | Traceability back to authoritative source |

## Action Text Rules

1. **Copy the source sentence.** If the source says "Pellet the recommended culture volume by centrifugation. Remove all supernatant so the pellet is not diluted before resuspension." — that is the `action` value, verbatim.

2. **Do not merge steps.** If the source numbers them separately, keep them separate. One source step = one JSON step. Splitting a dense source step into two JSON steps is acceptable; merging two source steps into one is not.

3. **Do not drop qualifiers.** Phrases like "Do not vortex", "For cloning-scale digests", "if using in-gel stain", "unless the manufacturer explicitly permits" are conditional instructions that change behavior. They go into `action` or `criticalNotes`.

4. **Do not truncate post-procedure steps.** QC analysis, cleanup, documentation, and storage steps are part of the protocol. If the source has steps for gel analysis, purification, or recording results, they must be converted.

## Parameter Rules

1. **Always set `rawText`** to the original text from the source document. Example: `"rawText": "Centrifuge for 10 min at 13,000 rpm (~17,900 × g)"`.

2. **Structured fields (`value`, `unit`, etc.) are extracted FROM `rawText`**, not the other way around. If extraction is ambiguous, set `needsReview: true` and keep `rawText` as the ground truth.

3. **Do not invent values.** If the source says "enzyme-specific temperature", do not fill in `"value": 37`. Set `"valueText": "enzyme-specific"` and `"needsReview": true`.

4. **Every parameter value MUST appear in the step's `action` text.** `parameters[]` is a structured extraction of values already present in `action` — it must never contain information absent from the action text. If the source document provides a quantitative detail (e.g., "10 µL per 50 µL reaction") that is relevant to a step, include that detail in the `action` text first, then extract it into `parameters[]`. A parameter whose `value` cannot be found anywhere in the step's `action` is a conversion defect.

   **Wrong:** `"action": "Stop the reaction by adding stop solution."` + `parameter: volume=10, unit=µL`
   **Right:** `"action": "Stop the reaction by adding 10 µL of stop solution per 50 µL reaction."` + `parameter: volume=10, unit=µL, rawText="10 µL per 50 µL reaction"`

## Critical Notes and Safety Notes

1. **Warnings in the source → `criticalNotes`.** Examples: "Do NOT vortex", "Do not allow lysis to proceed for more than 5 min", "Avoid prolonged boiling".

2. **Hazard statements → `safetyNotes`.** Examples: "Ethidium bromide is a known carcinogen", "UV radiation — use eye protection".

3. **Use original wording.** Do not soften "known carcinogen" to "potentially hazardous".

## Tables

1. **Preserve all columns and rows.** Do not drop columns you consider redundant (e.g., "Purpose" column in a cycling program table).

2. **Set `kind`** to the most specific applicable value: `"recipe"`, `"program"`, `"checklist"`, `"results"`, or `"other"`.

3. **Referenced tables in steps** must use `tableIds` to link step → table.

4. **Each table should be referenced from exactly one step** — the step most directly associated with that table's content. Do not attach the same `tableId` to multiple steps; this causes the viewer to render the same table repeatedly. If two steps both relate to a table, reference it only from the step that introduces or prepares the data, not the step that merely executes it.

## Source References

1. **Every JSON must have at least one `sources` entry** with the URL or file path of the original document.

2. **`sourceReferences` in steps** should map each step back to its source location (page number, step number, section heading).

3. **Set `licenseVerified: false`** unless the license has been explicitly confirmed.

## Controls and Acceptance Criteria

1. **Convert all controls** from the source. Typical controls: NTC (no-template control), positive control, negative control, replicates.

2. **Include acceptance expectations.** "No target-size band in NTC" is an acceptance criterion, not just a control description.

3. **Step-level `acceptanceCriteria`** for QC steps should list each check with its `parameter`, `description`, and `comparator`.

## Troubleshooting

1. **Convert the full troubleshooting table.** Each entry needs `problem`, `cause`, and `solution`.

2. **Use source wording.** "Wrong annealing temperature, missing component, degraded template" is better than "various causes".

## What NOT to Do

| Anti-pattern | Example | Why it's wrong |
|---|---|---|
| Summarize action text | "Thaw and mix reagents" instead of "Thaw buffer, dNTPs, primers, water, and template on ice. Mix compatible reagents gently and briefly spin down." | Loses which reagents, what order, what technique |
| Skip safety section | `"safety": []` | Operator doesn't know about carcinogens or UV hazards |
| Skip troubleshooting | `"troubleshooting": []` | Operator has no recourse when experiment fails |
| Skip controls | `"controls": []` | No way to validate results |
| Merge source steps | Combining "seal tubes" + "centrifuge" + "place in cycler" into one step | Harder to follow, loses granularity for tracking |
| Invent parameters | Adding `"value": 37` when source says "enzyme-specific" | False precision, potentially wrong |
| Drop post-procedure | Skipping gel analysis, purification, documentation steps | Incomplete SOP |
| Parameter not in action | `action` says "add stop solution" but `parameter` has `volume=10 µL` | Viewer shows orphaned parameters; action text is incomplete |
| Duplicate table reference | Steps 7 and 8 both have `tableIds: ["t3"]` | Same table rendered twice in viewer |

## Quality Checklist

Before marking a conversion complete, verify:

- [ ] Every source procedure step has a corresponding JSON step
- [ ] `safety` array is populated (not `[]`)
- [ ] `troubleshooting` array is populated (not `[]`)
- [ ] `controls` array is populated (not `[]`)
- [ ] `expectedOutputs` array is populated (not `[]`)
- [ ] `metadata.beforeYouBegin` is populated
- [ ] All tables from the source are in `tables`
- [ ] All numerical values have `rawText` preserving original wording
- [ ] `sources` has at least one entry with URL or file path
- [ ] No action text was paraphrased — spot-check 3 random steps against source
- [ ] Every `parameter.value` appears in its step's `action` text — no orphaned parameters
- [ ] No table ID appears in more than one step's `tableIds`
