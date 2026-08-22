# Schema stress-test report — 6 adversarial edge-case protocols (break-the-schema set)

**Method.** Six deliberately adversarial protocols were encoded into canonical v0.2 JSON to
target discipline classes the 15-protocol coverage set never touched: phage-display biopanning
(loops), checkerboard synergy (2D combinatorial plate), a PK animal study (in-vivo design +
ethics), an nf-core RNA-seq pipeline (pure bioinformatics), a multistep organic synthesis
(stoichiometry + hazards), and whole-cell patch-clamp (instrument physics). Each encoder recorded
where the schema forced a workaround. Findings below are cross-checked against
`schema-coverage-report.md` (the prior 15-protocol result) to separate ALREADY-KNOWN gaps
(its list A, #1–#9) from gaps this stress set exposed for the first time.

---

## 1. Verdict per protocol

| Protocol | couldRepresent | One-line verdict |
|---|---|---|
| phage-display-biopanning | **partial** | Bench chemistry captures fine; the loop is the protocol and had to be faked with a meta-step + tables + back-edge branch. Also surfaced scheduling, variants, and open-bound semantics. |
| checkerboard-synergy | **partial** | Every per-well A×B combination, control lane, and metric→label rubric lives in prose tables; the crossed factorial layout has no machine-readable home. |
| pk-animal-study | **partial** | Treatment arms, N, randomization/blinding, IACUC approval, subject demographics, and the stats plan are all scattered across free text — no in-vivo design layer exists. |
| rnaseq-pipeline | **partial** | The tools ARE the method, but a computational protocol has no software entity, no command field, no dataset input kind, no config flags, and no compute resources. Largest structural miss. |
| organic-synthesis | **partial** | Mass→mmol→equiv, limiting reagent, per-step reused-solvent amounts, GHS, atmosphere, TLC, and product characterization all forced into prose or abused parameter types. |
| patch-clamp | **partial** | No `resistance` in the type enum, and the stimulus/sweep program (the core of the method) has no waveform construct — duplicated into a table plus flat parameters. |

**All six = partial.** None was fully representable; none was outright impossible. In every case the
load-bearing wet-lab quantities survived, but a discipline-defining structure (a loop, a factorial,
a study design, a toolchain, a stoichiometry table, a stimulus program) had no native home.

---

## 2. Consolidated, deduped gap table (all 6)

Severity = max reported across protocols that hit it. "Hits/6" counts distinct protocols in this set.
NEW = beyond coverage-report list A; KNOWN #n = matches that report's gap #n.

### 2a. Already-known gaps re-confirmed by the stress set

| # | Gap | Sev | Hits/6 | Which | Suggested field | Status |
|---|---|---|---|---|---|---|
| K1 | Iteration / repeat / cycle | high | 3 | phage (central), rnaseq (scatter-gather), organic (2×wash) | `step.repeat{count\|until}` / stepGroups | KNOWN #1 — reconfirmed, now the single most-hit high-severity gap |
| K2 | Structured measured outputs/results | high | 4 | phage, rnaseq, organic, checkerboard | `results`/`measurements` object (Run layer) | KNOWN #2 |
| K3 | Derived / per-unit / formula quantities | high | 5 | phage, checkerboard, pk-animal, organic, rnaseq (+patch-clamp LJP adjacent) | `parameter.formula`/`derivedQuantity` object | KNOWN #5 — most pervasive gap in the set |
| K4 | Provenance/settings parity (equipment.rawText, structured settings; parameter.sourceReferences) | low–med | 4 | phage, organic, patch-clamp, rnaseq | `equipment.rawText`+structured settings; `parameter.sourceReferences[]` | KNOWN #6 |
| K5 | Discrete choice vs range | med | 2 | phage (elution options), rnaseq (strandedness/aligner) | `parameter.choices[]`/enum | KNOWN #4 |
| K6 | QC acceptance-criterion object | med | 2 | phage (enrichment/ELISA), rnaseq (min reads/mapped %) | `acceptanceCriterion{metric,comparator,threshold,onFail}` | KNOWN #9 |
| K7 | Gradient / stepped series | low | 2 | phage (Tween ramp per round), organic (rotovap ramp, gradient elution) | `parameter.series[]` | KNOWN #7 |
| K8 | Structured entity/strain attributes | low | 1 | phage (E. coli genotype, M13 library complexity/valency) | typed organism/strain + library attrs | KNOWN #8 |
| K9 | Plate layout: bind sample→well | — | (extended) | checkerboard, — | `container.layout[]` | KNOWN #3 — extended by NEW-U/V/W below |

### 2b. NEW gaps this stress set exposed (not in the coverage report)

| Gap | Sev | Hits/6 | Which | Suggested field |
|---|---|---|---|---|
| **N1. parameter.type enum missing kinds + non-decimal values** — no `resistance`/`capacitance`/`conductance` (patch), no `titer`/`countConcentration` (phage), no `flowRate`/compound-rate unit (patch mL/min), no scientific-notation/exponent for CFU order-of-magnitude (checkerboard) | high | 3 | patch-clamp, phage, checkerboard | add enum kinds; `parameter.exponent`/sci-notation; compound-unit support |
| **N2. Software tool as first-class entity** — version, container image, conda/package, repo/DOI; currently jammed into `equipment.model`/`settings` | high | 1 | rnaseq | top-level `tools[]` or `equipment.kind='software'`+version/container/packageRef |
| **N3. Executable command / code invocation** — CLI/command template trapped in `step.action` prose | high | 1 | rnaseq | `step.command{interpreter,template,args[],workingDir}` |
| **N4. Digital dataset/file input kind** — no `dataset`/`file`/`reference-data` role; no fileFormat/accession/checksum | high | 1 | rnaseq | material.role `dataset` + fileFormat/URI/checksum; `sample.dataType` |
| **N5. Config/settings parameter kind** — boolean/string/enum flags abused as `type:'other'`/`unit:'flag'` | high | 1 | rnaseq | `step.config[]{key,value:bool\|str\|num,default}` (overlaps K5) |
| **N6. Compute-resource block** — RAM/CPU/walltime/executor; RAM abused as `type:'dataSize'` | med | 1 | rnaseq | `step.resources{cpus,memory,walltime,gpu,executor}` |
| **N7. forEach / scatter-gather cardinality** — map-over-collection + fan-in join; `dependsOn` gives only linear order | med | 1 | rnaseq | `step.forEach(collectionId)` + aggregation marker (extends K1) |
| **N8. Study design: arms/groups/N/randomization/blinding** — abused `samples` + tables + beforeYouBegin | high | 1 | pk-animal | top-level `design{arms[],randomization,blinding}`, `groupIds` on steps |
| **N9. Ethics/regulatory approval gate (IACUC/IRB)** — no home; `biosafetyLevel` misused as stand-in | high | 1 | pk-animal | `ethicsApprovals[]{body,protocolNumber,dates}` + `ethicsRequired` gate |
| **N10. Live-subject demographic attributes** — species/strain/sex/age/body-weight drive dose & blood cap; only free-text `sample.organism` | med | 1 | pk-animal | `sample.subject{species,strain,sex,ageRange,bodyWeight}` (distinct from K8) |
| **N11. Statistical analysis plan** — method/summary-stat/n/dispersion only implied in prose | med | 1 | pk-animal | top-level `analysisPlan[]{method,summaryStatistic,n,groupingVar}` |
| **N12. Stoichiometry: equivalents + limiting/excess + multi-unit reagent** — reagent needs mass AND mmol AND equiv AND role simultaneously; `material.amount` holds one scalar | high | 1 | organic | `material.equivalents`+role `limiting`/`excess`, or `material.quantities[]{value,unit,kind}` |
| **N13. Per-step material-amount binding** — amount consumed of a material in a specific step; breaks for reused solvents (DCM at 150 mL/10 mL/500 mL/2 L) | high | 1 | organic | `step.materialUsages[]{materialId,value,unit,role}` |
| **N14. Structured GHS hazards** — signal word/H-codes/P-codes/pictograms collapse into one free-text string | med | 1 | organic | `material.ghs{signalWord,hCodes[],pCodes[],pictograms[]}` |
| **N15. Reaction environment** — inert atmosphere (N2/Ar), anhydrous, flame-dried glassware only in prose | med | 1 | organic | `step.conditions{atmosphere,anhydrous,glassware}` / `material.grade` |
| **N16. Constraint semantics: one-sided/preferred bounds + setpoint vs max/min/endpoint** — "at least 1 h", "no more than", "preferably overnight" (phage); "keep below 30 °C", "heat until dissolved ~90 °C" (organic) stored as bare setpoints | med | 2 | phage, organic | `parameter.comparator`/`constraint{setpoint,max,min,endpoint}`+`preferredValue` |
| **N17. Measurement-gated step endpoint** — "grow to OD600 0.01–0.05", "heat until dissolved"; run-until-measured has no construct | med | 2 | phage, organic | `step.endpointCondition{quantity,targetRange}` (relates K1 `until`) |
| **N18. In-process analytical monitoring** — TLC Rf per species; abused `parameter type:'other' unit:'Rf'` | med | 1 | organic | `step.monitoring[]`/`tlc{eluent,visualization,spots:[{species,rf}]}` |
| **N19. Product/sample physical characterization** — mp, decomposition energy, impact sensitivity, appearance scattered across 5 free-text fields | med | 1 | organic | `sample.properties[]{name,value,unit,condition}` |
| **N20. Mixture / solvent composition** — DCM:acetone 4:1 forced into `type:'ratio' unit:':1'` | low | 1 | organic | `mixture{components:[{material,fraction}]}` |
| **N21. Combinatorial / factorial layout** — crossed factor axes bound to plate dims; every interior well a distinct A(i)×B(j) | high | 1 | checkerboard | `factorialDesign{factors:[{axis,levelSeries,coordBinding}]}` (extends K3) |
| **N22. Control placement binding** — control defined by well/lane; drug-alone lane is the FIC denominator; `control` has only name/description | med | 1 | checkerboard | `control.containerId`+`location/wells`+denominator role |
| **N23. Parallel/mirror container relationship** — twin OD-background plate, per-well subtraction | low | 1 | checkerboard | `container.mirrorOf` / `container.role` |
| **N24. Results-classification rubric** — numeric metric → ordered label bands (FIC ≤0.5 synergy …) | med | 1 | checkerboard | `resultClassification{metric,bands:[{range,label}],selectionRule}` (distinct from K6 QC) |
| **N25. Instrument stimulus program / waveform / sweep-loop + composite pulse** — holding potential + IV step family + inter-sweep loop; amplitude bound to repetition rate | high | 1 | patch-clamp | `step.stimulusProgram{mode,holdingLevel,epochs[],sweeps{start,stop,increment,count}}` |
| **N26. Acquisition / signal-processing settings** — filter type+cutoff, sampling rate, Rs compensation | med | 1 | patch-clamp | `acquisition{samplingRate,filterType,filterCutoff,seriesResistanceCompensation}` |
| **N27. Post-hoc correction / offset transform** — liquid-junction-potential correction applied to recorded voltages | med | 1 | patch-clamp | `corrections[]{name,formula,appliesTo[],corrected}` |
| **N28. Multi-day scheduling / concurrency tracks** — 6-day calendar, parallel host-culture prep; `dependsOn` gives order not calendar | med | 1 | phage | `step.day`/`scheduleOffset` + concurrency/track marker |
| **N29. Protocol variant / format selector** — petri-dish vs microtiter reparametrizes many volumes at once; alt value lost to rawText | med | 1 | phage | `variants[]`/`formats[]` selector or `parameter.alternativeValues` |

---

## 3. The genuinely NEW gaps (the payoff)

The 15-protocol set was all wet-lab molecular biology and converged on 9 gaps dominated by
loops (K1) and results-capture (K2). This adversarial set kept K1/K3 as the most-hit gaps but
surfaced **five clusters of new structure that the earlier set had no protocol to reveal** — mostly
because each new cluster is tied to a discipline the coverage set never sampled. These are the payoff.

**Cluster 1 — a computational protocol is structurally homeless (rnaseq).** This is the single
biggest discovery. Four "high" NEW gaps land on one protocol: no software-tool entity (N2), no
command/code field (N3), no digital-dataset input kind (N4), and no config/flag parameter kind (N5),
plus compute resources (N6) and scatter-gather cardinality (N7). For a pipeline the tools, versions,
commands, and flags *are* the method; the schema forced all of them into `equipment.model`,
`step.action` prose, and free table rows. This is not an edge case — it is an entire missing modality.

**Cluster 2 — in-vivo / animal studies have no design layer (pk-animal).** Treatment arms, N per
group, randomization and blinding (N8), the IACUC ethics gate (N9, a hard regulatory gate with no
field — `biosafetyLevel` was misused as a stand-in), live-subject demographics that drive dosing
(N10), and the statistical analysis plan (N11). The schema is subject-agnostic and per-step; it
cannot say "do this per group" or "N=4 per timepoint."

**Cluster 3 — synthetic chemistry's quantity/hazard model doesn't fit (organic).** Stoichiometry
needs one reagent to carry mass + mmol + equivalents + a limiting/excess role at once (N12);
per-step amounts must bind to a material, which collapses for solvents reused at four different
volumes (N13); GHS hazards need structure (N14); reaction environment/atmosphere (N15), TLC
monitoring (N18), product characterization (N19), and mixture composition (N20) all fell to prose.

**Cluster 4 — instrument-physics protocols need programs and new physical kinds (patch-clamp).**
The `parameter.type` enum has no `resistance` though it is a first-class, repeated quantity (N1),
and there is no stimulus-program/waveform/sweep-loop construct (N25) — the executable relationship
between holding potential, per-step command, and sweep iteration survives only in a table. Plus
acquisition signal settings (N26) and post-hoc corrections like LJP (N27).

**Cluster 5 — plate/assay geometry beyond one-sample-per-well (checkerboard).** The known K3
plate-map gap assumed one entity per well. A checkerboard is two *crossed* factor axes bound to plate
dimensions (N21), with controls defined by lane position (N22, where a lane is literally the
denominator of a computed metric), a parallel mirror plate (N23), and a numeric-metric→categorical-
label interpretation rubric (N24).

**Cross-cutting bonus (multi-hit, therefore high-value-per-field):** constraint semantics —
one-sided/preferred bounds and setpoint-vs-max-vs-endpoint (N16, phage + organic), and
measurement-gated step endpoints (N17, phage + organic). These are cheap `parameter`-level additions
that two unrelated disciplines both needed, so they generalize better than the single-hit cluster gaps.

---

## 4. v0.3 recommendation

### 4a. ADD (promote to core / high-priority, confirmed by ≥2 hits or a whole missing modality)

1. **`step.repeat{count|until}` + `step.forEach(collection)` with a fan-in marker** (K1 + N7) — the
   most-hit high gap; also absorbs N17 measurement-gated endpoints via `until`.
2. **A `results`/`measurements` Run-layer object** (K2) and **`parameter.formula`/`derivedQuantity`**
   (K3) — K3 is the most pervasive gap (5/6); keep formula inputs bindable to samples/parameters.
3. **`parameter.comparator`/`constraint{setpoint,max,min,endpoint}` + `preferredValue`** (N16) —
   two disciplines, tiny surface, high leverage.
4. **`parameter.type` enum additions** where a kind is genuinely absent (N1): `resistance`,
   `capacitance`, `conductance`, `titer`/`countConcentration`, `flowRate`; plus scientific-notation
   value support and compound (quantity/time) units.
5. **Computational modality** (N2–N7): a `tools[]`/software entity with version+container+package,
   `step.command`, a `dataset`/`file` material role with fileFormat/accession/checksum, a
   config/flag parameter kind, and a `step.resources` block. Do this as one coherent extension —
   it unlocks a whole discipline, not one protocol.
6. **In-vivo design layer** (N8–N11): `design{arms,randomization,blinding}`, `ethicsApprovals[]`,
   `sample.subject{...}`, `analysisPlan[]`. Also a new discipline class, so worth the block.
7. **Chemistry quantity model** (N12–N13): `material.quantities[]{value,unit,kind}` +
   `equivalents`/limiting role, and `step.materialUsages[]` to bind per-step amounts (fixes the
   reused-solvent break). These two are high-severity and reusable beyond chemistry.
8. **`container.layout` extended for crossed factors + control placement** (K3 + N21/N22): factorial
   axes bound to coordinates, and `control.containerId`+location so a control lane can be the
   denominator of a metric.
9. **QC + result-classification split** (K6 + N24): keep `acceptanceCriterion` for run-validity;
   add a separate `resultClassification{metric,bands}` for scientific interpretation — the stress set
   showed these are different objects that share a range→label shape.

### 4b. Leave as tables / prose / lower-priority extension (single-hit, niche, or cheaply tabular)

- **N18 TLC monitoring, N19 product characterization, N20 mixture composition, N26 acquisition
  settings, N27 post-hoc corrections, N28 scheduling, N29 variant selector, N23 mirror container,
  N15 reaction environment** — each hit exactly one protocol and is adequately (if awkwardly) served
  by `tables` + `criticalNotes` today. Track them as optional Extension fields; do not block v0.3.
- **N14 GHS** — valuable for FAIR/safety but rarely fillable from method text; keep as an optional
  structured hazard extension alongside the existing free-text `material.hazard`.
- **N25 stimulus program / N26** — high value for electrophysiology but a large, domain-specific
  object; defer to a physics/instrument extension module rather than core v0.3.

### 4c. parameter.type enum: were the previously-unused values exercised?

Coverage report B flagged nine never-used enum values and deferred trimming until this set. Result:

| Enum value | Exercised here? | Evidence |
|---|---|---|
| `dataSize` | **YES** | rnaseq STAR `~38 GB RAM` encoded `type:'dataSize'` (s7) — though as a *misuse* for a resource requirement, not a bench quantity |
| `frequency` | **YES** | patch-clamp 100 Hz test pulse + sampling rate |
| `current` | **YES** | patch-clamp current-clamp injection / pipette current |
| `pressure` | **plausible, unconfirmed** | rotovap mmHg ramps (organic) and patch suction exist, but the findings show these stored with `value:null`+rawText, not clearly as `type:'pressure'` |
| `pH` | **NO** | phage low-pH elution and chem steps never encoded a pH parameter |
| `energy` | **NO** | organic decomposition energy `>600 J/g` went to characterization prose (N19), not `type:'energy'` |
| `force` | **NO** | drop-weight impact test (organic) went to prose, not a force parameter |
| `length`, `area` | **NO** | not needed by any of the 6 |

**Verdict:** keep `dataSize`, `frequency`, `current`, `pressure` — three are now exercised and the
fourth is plausibly imminent. `pH`, `energy`, `force`, `length`, `area` remain unused even by the
disciplines that should use them — but the reason is instructive: those quantities didn't route
through `parameter.type` because the schema lacked a *construct* to attach them to (a characterization
block, a corrections block), not because the enum value was wrong. So the enum members are cheap and
harmless; **the real lesson is the opposite of trimming — the enum is missing kinds** (`resistance`,
`capacitance`, `conductance`, `titer`, `flowRate` per N1) far more urgently than it has surplus ones.
Recommendation: **add the missing kinds; keep pH/energy/force but mark length/area as trim candidates
if a leaner core is wanted** — they are the only two with neither usage nor a near-term use case.
