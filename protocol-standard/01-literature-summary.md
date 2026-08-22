# Section 1.1 — Literature & Standards Summary: How Lab Protocols Are Reported and Represented

**Goal.** Survey the papers and standards for reporting and representing experimental
laboratory protocols, so LabRecord can *adopt, adapt, or design* a format (Section 1.2)
on an informed basis. All citations below were verified against primary sources (DOIs / official pages).

**The key distinction that organizes the field.** Existing work falls on a spectrum from
*human disclosure* to *machine execution*:

1. **Minimum-information reporting checklists** — what facts you must *disclose in a paper* (MIQE, MIAME, ARRIVE, CONSORT, STRENDA). Descriptive/retrospective; usually prose.
2. **Protocol publishing formats** — the section layout journals use (Nature Protocols, STAR, Bio-protocol, Current Protocols, JoVE). Human-readable articles; structure only from headings.
3. **Machine-readable / ontology representations** — formal models of protocols (schema.org HowTo, Bioschemas LabProtocol, SMART Protocols, EXACT, ISA, OBI, PROV-O). Findable/interoperable; not executable.
4. **Executable protocol languages** — actually runnable (protocols.io typed steps, Autoprotocol, Aquarium/Krill, LabOP; CWL for computation).

No single standard covers *readable + typed-structured + executable + FAIR-provenance* at once — that gap is exactly what LabRecord's format targets.

---

## A. Minimum-information reporting guidelines

| Standard | Domain | Structure | Machine-readable? | Relevance to us |
|---|---|---|---|---|
| **MIQE** (Bustin 2009; MIQE 2.0 2025) | qPCR/RT-qPCR | 9-section checklist, each item **E**ssential / **D**esirable; companion **RDML** XML | RDML: **yes** | Directly drives our **qPCR example**; the **E/D tiering** inspires our `needsReview` idea |
| **MIAME** (Brazma 2001) | Microarrays | 6 components; realized via MAGE-TAB / ISA-Tab | via ISA-Tab | Protocol is a single free-text slot — the failure mode we avoid |
| **MIBBI → FAIRsharing** (Taylor 2008; Sansone 2019) | Meta-registry | Catalog of MI checklists | registry | Where to *find* the right guideline; no protocol content |
| **ARRIVE 2.0** (Percie du Sert 2020) | Animal in-vivo | 21 items, "Essential 10" + recommended | no | Design/stats disclosure; not a bench procedure |
| **CONSORT 2010** (Schulz 2010) | Clinical RCTs | 25-item checklist + flow diagram | no | Peripheral; the exemplar "reporting checklist" genre |
| **STRENDA** (Tipton 2014; STRENDA DB 2018) | Enzymology | Level 1A conditions + 1B kinetics; validated DB | DB: **yes** | Conditions+results model; not ordered steps |

- **MIQE** — Bustin SA *et al.*, *Clin Chem* 55(4):611–622, 2009, DOI [10.1373/clinchem.2008.112797](https://doi.org/10.1373/clinchem.2008.112797); MIQE 2.0, *Clin Chem* 2025, DOI [10.1093/clinchem/hvaf043](https://doi.org/10.1093/clinchem/hvaf043). The **qPCR protocol** section requires reaction conditions, volumes, primer/probe/Mg²⁺/dNTP concentrations, polymerase identity, thermocycling parameters, instrument; **validation** requires efficiency, standard-curve slope, r², LOD; **data analysis** requires Cq method, NTC results, reference-gene justification.
- **RDML** — Lefever S *et al.*, *NAR* 37(7):2065–2069, 2009, DOI [10.1093/nar/gkp056](https://doi.org/10.1093/nar/gkp056). XML with sample/target/thermal-cycling as first-class objects — a rare machine-readable companion to a reporting checklist.
- **Takeaway:** these define *what a finished protocol must expose for reporting compliance*, not *how to perform it stepwise*. Even MIQE's "protocol" section lists parameters to disclose, not an ordered action sequence.

---

## B. Protocol publishing formats (the shared section skeleton)

Verified section structures converge on a **common skeleton**. This is the strongest evidence for our human-readable layout:

| Common section | Nature Protocols | STAR Protocols | Bio-protocol | protocols.io | Current Protocols | JoVE |
|---|---|---|---|---|---|---|
| Purpose / Abstract | Abstract + Intro | (abstract) + Before you begin | Abstract + Key Features + Background | Description tab | Introduction | Abstract |
| Materials / Reagents | Reagents + Reagent Setup | **Key Resources Table** + Materials | Materials and Reagents | Reagent components → Materials | Materials + Reagents and Solutions | Table of Materials |
| Equipment | Equipment + Setup | Materials and equipment | Equipment | Equipment component | Materials (special equipment) | Table of Materials |
| Procedure / Steps | Procedure (numbered, staged) | Step-by-step method details | Procedure | **Steps + Sections + typed components** | Numbered steps | Protocol (1 / 1.1 / 1.1.1) |
| Timing | TIMING per stage | timing per step | (in steps) | Duration/Timer components | Time Considerations | (in steps) |
| Troubleshooting | table (Step/Problem/Reason/Solution) | Problem / Potential solution | Notes & Troubleshooting | Troubleshooting tab | Troubleshooting | (in Discussion) |
| Expected results | Anticipated Results | Expected outcomes | Validation + Data Analysis | (in steps) | Anticipated Results | Representative Results |
| Safety | CAUTION flags | (in steps/KRT) | Caution labels | Safety component | CAUTION / IMPORTANT | CAUTION |

Shared conventions: **step-level alert flags** (CRITICAL STEP / CAUTION / PAUSE POINT), **persistent IDs** (DOIs; STAR's **RRIDs**), and **hierarchical numbered steps**.

- **Nature Protocols** — <https://www.nature.com/nprot/>. Richest human context (Development / Applications / Comparison / Experimental design / Limitations); prose-first, no JSON export.
- **STAR Protocols** (Cell Press) — <https://www.cell.com/star-protocols/home>; STAR Methods editorial [PMC8100894](https://pmc.ncbi.nlm.nih.gov/articles/PMC8100894/). The **Key Resources Table** with RRID + Source + Catalog# is a semi-structured, parseable materials model.
- **Bio-protocol** — <https://bio-protocol.org/en>. Distinctive **"Validation of Protocol"** section (evidence the method works).
- **protocols.io** ⭐ — Teytelman L *et al.*, *PLOS Biol* 14(8):e1002538, 2016, DOI [10.1371/journal.pbio.1002538](https://doi.org/10.1371/journal.pbio.1002538). See §C/§D — the only publishing platform with a genuine step data model, API, forking, versioning, and DOIs. Acquired by Springer Nature (2023); **replaced Protocol Exchange in 2024**.
- **Current Protocols** (Wiley) — <https://currentprotocols.onlinelibrary.wiley.com/>. Notable **Basic / Alternate / Support** protocol typing — models variants and dependencies between procedures.
- **JoVE** — <https://www.jove.com>. Video + strict hierarchical numbering + mandatory Table of Materials.

---

## C. Machine-readable / ontology-based & executable representations

| Model | Layer | Materials+amounts | Typed step params | Deps/branching | Per-step QC | Provenance/versioning | Runnable |
|---|---|---|---|---|---|---|---|
| **schema.org HowTo** | discovery | supply/tool (free text) | no | no | no | CreativeWork meta | no |
| **Bioschemas LabProtocol** (0.9-DRAFT) | discovery | reagent/labEquipment | `parameter` (loose) | no | protocolOutcome | license/isBasedOn | no |
| **SMART Protocols** (Giraldo 2017) | ontology | SIRO (Sample/Instrument/Reagent/Objective) | SP-Workflow | precedes/preceded-by | via outputs | provenance class | no |
| **EXACT / EXACT2** (Soldatova 2008/2014) | ontology | via descriptors | **action verbs + typed descriptors** | partial | — | — | no |
| **ISA (ISA-JSON)** (Rocca-Serra 2010) | metadata | Material/Sample | ProtocolParameter/ParameterValue | study graph | — | strong (sample→data) | no |
| **OBI** (Bandrowski 2016) | ontology | planned process | plan specification | — | **plan vs execution** | qualified relations | no |
| **protocols.io** (v3 JSON) | executable-ish | Reagent + Amount + Concentration components | **typed components** (temp/duration/g-force…) | **Case** (conditional) | images/expected | **fork + version + DOI** | human "run" mode |
| **Autoprotocol** (Strateos) | executable | refs + typed units | **typed instructions** | limited | — | — | **robotic** |
| **Aquarium / Krill** (Vrana 2021) | executable | Sample/Item inventory | typed op inputs/outputs | conditionals/loops | data capture | full run records | **human-in-loop** |
| **LabOP** (Bartley 2023) | executable | samples/collections | **typed params (UML+PROV)** | control/data flow | — | PROV traces | human+robot |
| **CWL** (Crusoe 2022) | computational | — | typed I/O | DAG (no loops) | — | container prov | **software** |
| **PROV-O** (W3C 2013) | provenance | Entity | — | — | — | **who/what/when/derived-from** | n/a |

Key references: schema.org HowTo <https://schema.org/HowTo> (core; Google *rich-result* support removed Aug 2023, vocabulary unchanged). **Bioschemas LabProtocol** <https://bioschemas.org/profiles/LabProtocol/0.9-DRAFT> (note: `schema.org/LabProtocol` returns 404 — it lives **only in Bioschemas**, subclassing HowTo). SMART Protocols DOI [10.1186/s13326-017-0160-y](https://doi.org/10.1186/s13326-017-0160-y). EXACT DOI [10.1093/bioinformatics/btn156](https://doi.org/10.1093/bioinformatics/btn156); EXACT2 DOI [10.1186/1471-2105-15-S14-S5](https://doi.org/10.1186/1471-2105-15-S14-S5). ISA DOI [10.1093/bioinformatics/btq415](https://doi.org/10.1093/bioinformatics/btq415). OBI DOI [10.1371/journal.pone.0154556](https://doi.org/10.1371/journal.pone.0154556). Autoprotocol <http://autoprotocol.org>. Aquarium DOI [10.1093/synbio/ysab006](https://doi.org/10.1093/synbio/ysab006). LabOP DOI [10.1145/3604568](https://doi.org/10.1145/3604568). CWL DOI [10.1145/3486897](https://doi.org/10.1145/3486897). PROV-O <https://www.w3.org/TR/prov-o/>.

**protocols.io data model (our closest reference).** A Protocol has ordered **Steps**, optionally in **Sections**; each Step carries **StepComponents** typed as Reagent / Amount / Concentration / Temperature / Duration / Centrifugation (g-force) / Equipment / Software / Dataset / Citation / Command / Safety. A **Case** object attaches conditional branching. Platform gives forking, version history, DOIs, CC-BY, and a bench "run" mode (community JSON schema: <https://github.com/ethanwillis/protocolsio_schemas>; REST API v3).

---

## D. FAIR & the "what fields does a protocol need" question

- **FAIR** — Wilkinson MD *et al.*, *Sci Data* 3:160018, 2016, DOI [10.1038/sdata.2016.18](https://doi.org/10.1038/sdata.2016.18). For protocols → persistent IDs/DOIs, machine-readable schema + controlled vocabularies, explicit **license** (R1.1), and **provenance** (R1.2). Separate the *protocol-as-plan* from the *protocol-as-execution* (OBI/PROV).
- **PRO-MaP** — Batista Leite S *et al.*, *PLOS Biol* 22(9):e3002835, 2024, DOI [10.1371/journal.pbio.3002835](https://doi.org/10.1371/journal.pbio.3002835). Policy push to move methods out of prose into reusable structured protocols.
- **The single most useful precedent for our field list** — Giraldo O *et al.*, *"A guideline for reporting experimental protocols in life sciences,"* *PeerJ* 6:e4795, 2018, DOI [10.7717/peerj.4795](https://doi.org/10.7717/peerj.4795). From 500+ protocols + 9 journals' guidelines it proposes **17 data elements** in four groups: **Bibliographic** (title, authors+IDs, version, license, provenance, DOI), **Discourse** (objective, applications/advantages, limitations), **Materials** (samples/organism, equipment w/ model+catalog#, consumables, reagents/kits, recipes, software+version), **Procedure** (numbered steps, alternative/optional/parallel steps, critical steps & pause points, timing, troubleshooting). It documents the chronic gaps: limitations present in only ~20–40% of protocols, consumables almost never listed, "room temperature"/centrifugation chronically under-specified.

---

## E. Conclusion → what LabRecord should do

- **Adopt** the convergent **section skeleton** (§B) as the human-readable layout.
- **Adopt** the **typed step-component idea** from protocols.io (§C) and **typed action descriptors** from EXACT, but as a strict JSON Schema with **units and ranges** (directly fixing the under-specification gap Giraldo found).
- **Adopt** the Giraldo **17 data elements** as the field checklist (§D).
- **Adopt** FAIR mechanisms: DOIs/version IDs, explicit machine-readable **license**, and a **provenance** block separating plan vs execution (OBI/PROV) — this is also the hook for the Library/Version design (Section 3).
- **Design new**: a first-class **`needsReview`** flag (generalizing MIQE's E/D tiering) so an LLM parser or human can mark unstated values instead of fabricating them — essential for the Section 5 parser.
- **Do not** adopt a heavyweight OWL/BFO ontology (SMART/OBI/EXACT) as the primary store, nor a robot-execution language (Autoprotocol/LabOP) — both are too heavy for a v0.1 human+web library; but keep the schema *mappable* to them later.

This is the basis for the format defined in [`02-format-standard.md`](02-format-standard.md).
