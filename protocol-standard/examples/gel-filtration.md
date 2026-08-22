# Gel Filtration (Size-Exclusion Chromatography) on ÄKTA start

**Protocol ID:** lr-test-gel-filtration · **Version:** 0.1 · **Format:** LabRecord Protocol Format v0.1
**Generated from:** `test_protocol/1-Gel Filtration Procedures.pdf` (2024 teaching protocol) — test-data generation into the LabRecord format.

**Purpose:** Separate proteins by molecular weight (MW) on a cross-linked porous gel
(Sephacryl S-100) and estimate the MW of an unknown protein from a K_av-vs-log(MW)
standard curve.

**Scope / Applicability:** Isocratic size-exclusion chromatography on an ÄKTA start
with a Sephacryl S-100 column, single buffer (PBS, buffer A). Teaching setup; eluted
proteins are not collected in this run. Preparative fractionation and other resins are out of scope.

**Estimated time:** One session for the run (equilibration + sample + elution); column
cleaning/regeneration/storage typically done in a later session.

**Before You Begin:**
- Watch the instrument video and walk through the procedure before starting.
- Filter buffer A (0.45 µm) and the sample (0.45 µm) before use.
- Always know the state of each valve and the tubing contents during a programmed run; avoid air bubbles entering the fractionation tubing.

## Materials and Reagents

| ID | Name | Amount / Working conc. | Specification / Grade | Vendor / Cat# |
|---|---|---|---|---|
| m1 | Buffer A (50 mM PBS) | 400 mL | 0.14 M NaCl, 36 mM Na₂HPO₄, 14 mM NaH₂PO₄, pH 7.2; 0.45 µm filtered | in-house |
| m2 | Sephacryl S-100 column | 1 | Size-exclusion resin | needsReview |
| m3 | 0.45 µm filter | as needed | For buffer and sample | — |
| m4 | Blue dextran 2000 | 5 mg/mL | MW 2000 kDa — void-volume (V₀) marker | — |
| m5 | BSA (bovine albumin) | 6 mg/mL | MW 67 kDa — standard protein 1 | — |
| m6 | Ovalbumin (chicken) | 9 mg/mL | MW 45 kDa — standard protein 2 | — |
| m7 | Ribonuclease A (bovine) | 9 mg/mL | MW 13.7 kDa — standard protein 3 | — |
| m8 | Unknown protein | 8 mg/mL | MW to be determined | — |
| m9 | NaCl (cleaning) | 0.2 M | Column cleaning | in-house |
| m10 | NaCl (regeneration) | 0.5 M | Column regeneration | in-house |
| m11 | Acetic acid (HOAc) | 0.1 M | Regeneration (or 0.2 M NaOH) | in-house |
| m12 | Ethanol | 20% | Column storage | in-house |
| m13 | Water (ddH₂O) | as needed | Cleaning / storage | — |

## Equipment and Settings

| ID | Name | Model | Settings |
|---|---|---|---|
| e1 | Chromatography system + pump + computer | ÄKTA start | Manual run via system control; flow rates set per step |

## Procedure

### Phase 1 — Setup & Equilibration

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 1 | Prepare buffer A; add 400 mL to bottle A; immerse buffer A and buffer B inlet tubing in bottle A | 400 mL; 0.45 µm filtered | Clean, degassed buffer ready | Only buffer A is used in this experiment |
| 2 | Switch on ÄKTA start (e1), install pump tubing, connect computer | — | Instrument ready | — |
| 3 | Manual run: wash buffer A tubing, buffer B tubing, and fractionation tubing; extrude air bubbles | A: 20 mL; B: 20 mL; fractionation: 10 mL; flow 5 mL/min | Tubing primed, no air | May be done by TA/volunteer |
| 4 | Connect Sephacryl S-100 column (m2) | flow 1 mL/min | Column online | — |
| 5 | Equilibrate the column | 0.5–1 CV; flow 1 mL/min | Stable baseline | — |

### Phase 2 — Sample Application & Elution

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 6 | Prepare the sample (m4–m8) and filter (m3) | 0.45 µm | Particle-free sample | Sample mix contains blue dextran + 3 standards + unknown |
| 7 | Wash inlet tubing and sample valve; apply sample | sample valve 0.2–0.5 mL; flow 0.8 mL/min | Sample loaded without air | Switch sample valve to buffer quickly after loading to prevent air entering the column |
| 8 | Elute with buffer A; send outlet to waste; continue after last peak | flow 0.8 mL/min; +15 min after all eluted | All proteins eluted | Eluted proteins are not collected in this run |

### Phase 3 — Analysis

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 9 | Export CSV (or PDF); plot the elution curve; find V₀ and V_e for each protein; compute K_av; plot log(MW) vs K_av; estimate the unknown MW | — | Standard curve + estimated MW | Upload via NOWLab; calculation done in Assignment 1 |

### Phase 4 — Column Cleaning & Storage *(later session / TA)*

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 10 | Column cleaning | 0.2 M NaCl 0.5 CV; water 1 CV; flow 1 mL/min | Column cleaned | — |
| 11 | Column regeneration | 0.5 M NaCl 1 CV; 0.1 M HOAc 1 CV (or 0.2 M NaOH); flow 1 mL/min | Column regenerated | — |
| 12 | Column cleaning + storage | water 1 CV; 20% ethanol 1 CV; flow 1 mL/min | Column stored in 20% ethanol | — |

## Controls
- **Void-volume marker:** Blue dextran 2000 (m4) defines V₀.
- **Calibration standards:** BSA (67 kDa), Ovalbumin (45 kDa), Ribonuclease A (13.7 kDa) build the K_av-vs-log(MW) standard curve.
- **Unknown:** the sample whose MW is estimated from the standard curve.

## Expected Outputs
- An elution curve (CSV) with resolved peaks.
- V₀ and elution volume (V_e) per protein; K_av per protein.
- A log(MW)-vs-K_av standard curve and an estimated MW for the unknown protein.

## Troubleshooting

| Problem | Likely cause | Solution |
|---|---|---|
| Air bubble entering fractionation tubing/column | Valve/tubing state during manual run | Pause the program or switch the wash valve to waste; switch the sample valve to buffer quickly after loading |
| Poorly resolved peaks | Overloaded sample volume; flow too high | Reduce sample volume; keep flow at the specified rate |

## Safety
- 0.1 M acetic acid and 0.2 M NaOH are corrosive — handle with care.
- Standard laboratory PPE; follow instrument SOP for the ÄKTA start.

## Sources and License
- **Source file:** `test_protocol/1-Gel Filtration Procedures.pdf` ("Gel Filtration Procedures", 2024). Parameters (buffer A recipe, flow rates, sample composition/MWs, CV volumes, cleaning/regeneration solutions) transcribed from this source.
- **License:** Institutional teaching material; reuse terms not specified (needsReview).
- Items marked **needsReview** were not specified in the source and must be confirmed before execution.
