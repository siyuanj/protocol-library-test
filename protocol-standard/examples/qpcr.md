# RT-qPCR — Relative Gene Expression (MIQE-aligned)

**Protocol ID:** lr-example-qpcr · **Version:** 0.1 · **Format:** LabRecord Protocol Format v0.1

**Purpose:** Measure the relative expression of a target gene by reverse
transcription of RNA to cDNA followed by real-time quantitative PCR (qPCR),
quantified against one or more validated reference genes.

**Scope / Applicability:** SYBR-Green (dye-based) or hydrolysis-probe RT-qPCR on
purified total RNA from cells or tissue, using the ΔΔCq relative-quantification
method. Reporting follows the MIQE guidelines (Minimum Information for
Publication of Quantitative Real-Time PCR Experiments). Absolute quantification
and one-step RT-qPCR are out of scope here.

**Estimated time:** ~4–6 h (RNA QC ~1 h; reverse transcription ~1.5 h; qPCR setup
+ cycling ~1.5–2 h; analysis ~1 h).

**Before You Begin:**
- Work RNase-free: dedicated pipettes/tips, gloves, nuclease-free tubes and water.
- Validate primer amplification efficiency (90–110%, standard-curve slope ≈ −3.1
  to −3.6) and single-product specificity before running experimental samples.
- Choose and validate reference gene(s) stable under your conditions (MIQE requires
  justification of the normaliser).

## Materials and Reagents

| ID | Name | Amount / Working conc. | Specification / Grade | Vendor / Cat# |
|---|---|---|---|---|
| m1 | Total RNA sample | 10 ng–1 µg per RT reaction | DNase-treated; RIN/quality recorded | prepared / needsReview |
| m2 | DNase I (+ buffer) | per manufacturer | RNase-free | needsReview |
| m3 | Reverse transcription kit | per manufacturer | Reverse transcriptase, RT buffer, dNTPs, RNase inhibitor, primers (oligo-dT / random hexamers) | needsReview |
| m4 | cDNA (RT product) | typically 1–2 µL per qPCR well | Diluted per optimization | product of Phase 2 |
| m5 | qPCR master mix | 1× final | SYBR-Green or probe master mix (polymerase, dNTPs, MgCl₂, dye/ROX) | needsReview |
| m6 | Target primers (fwd + rev) | 200–500 nM each (final) | Validated efficiency 90–110% | needsReview |
| m7 | Reference-gene primers (fwd + rev) | 200–500 nM each (final) | Validated, stable normaliser | needsReview |
| m8 | Hydrolysis probe (if probe-based) | 100–250 nM (final) | e.g. FAM/TAMRA | needsReview |
| m9 | Nuclease-free water | to final volume | Molecular-biology grade | — |

## Equipment and Settings

| ID | Name | Model | Settings |
|---|---|---|---|
| e1 | Spectrophotometer / fluorometer | needsReview | RNA concentration + purity (A260/A280, A260/A230) |
| e2 | (Optional) capillary electrophoresis | needsReview | RNA integrity (RIN) |
| e3 | Thermal cycler (for RT) | needsReview | Per RT-kit program |
| e4 | Real-time PCR instrument | needsReview | See cycling parameters in Procedure |

## Procedure

### Phase 1 — RNA QC

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 1 | Quantify RNA and check purity (e1) | Record ng/µL, A260/A280 (~2.0), A260/A230 | RNA pure and sufficient | Record values as MIQE metadata |
| 2 | Assess RNA integrity (e2, if available) | RIN / rRNA ratio | Intact RNA (RIN reported) | Degraded RNA biases Cq |
| 3 | DNase-treat RNA if not already done (m2) | Per manufacturer | Genomic-DNA carryover removed | Confirm with a no-RT control (Step 10) |

### Phase 2 — Reverse Transcription

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 4 | Assemble RT reaction (m1, m3) | Fixed RNA input across samples | Homogeneous mix | Keep reagents on ice; same input mass per sample |
| 5 | Run reverse transcription (e3) | Per kit (e.g. 25 °C prime → 42–50 °C extend → 85 °C inactivate) | cDNA (m4) synthesized | Record exact temps/times used (needsReview) |
| 6 | Dilute cDNA as optimized (m4, m9) | e.g. 1:5–1:20 | Working cDNA stock | Use identical dilution for all samples |

### Phase 3 — qPCR Setup & Cycling

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 7 | Prepare qPCR reaction mix (m5, m6/m7, ±m8, m9) | 10–20 µL total per well | Homogeneous mix | Prepare a master mix; pipette on ice/cold block |
| 8 | Add template (m4) and load plate | Technical replicates (≥2–3) per sample | Plate loaded, sealed | Include NTC and no-RT wells (see Controls) |
| 9 | Run qPCR (e4) | Denat 95 °C; 40 cycles [95 °C denat / annealing-extension at primer Tm]; then melt curve (dye-based) | Amplification curves + single melt peak | Report exact cycling program (needsReview) |

### Phase 4 — Analysis

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 10 | Inspect controls | NTC negative; no-RT negative | No amplification in controls | Contamination/gDNA carryover if positive |
| 11 | Set threshold, extract Cq | Consistent threshold across runs | Cq per well | Report baseline/threshold method |
| 12 | Normalise and compute relative expression | ΔΔCq vs reference gene(s) + calibrator | Fold-change per target | State the quantification model and efficiency correction |

## Controls
- **NTC (no-template control):** master mix + water instead of cDNA — detects contamination.
- **No-RT control (−reverse transcriptase):** detects genomic-DNA amplification.
- **Reference gene(s):** validated stable normaliser(s) run on the same plate.
- **Inter-run calibrator:** a common sample across plates for run-to-run comparison.
- **Technical + biological replicates:** report both (MIQE).

## Expected Outputs
- Cq values per well; a single specific product (single melt peak or single band).
- Negative NTC and no-RT controls.
- Normalised relative expression (fold-change) with amplification efficiency and
  the quantification method reported.

## Troubleshooting

| Problem | Likely cause | Solution |
|---|---|---|
| Amplification in NTC | Contamination or primer-dimer | Fresh reagents; redesign/optimize primers; clean workspace |
| Amplification in no-RT control | Genomic-DNA carryover | Repeat DNase treatment; design intron-spanning primers |
| Multiple melt peaks | Non-specific product / primer-dimer | Optimize annealing temp/primer conc.; validate primers |
| Late/absent Cq | Low RNA/cDNA input; degraded RNA; inhibitors | Increase input; check RIN; clean up RNA; dilute to reduce inhibitors |
| High replicate variability | Pipetting error; low copy number | Use master mix; increase replicates/input |

## Safety
- Standard molecular-biology hygiene; some intercalating dyes are mutagenic —
  handle and dispose per institutional rules.
- Biosafety level depends on the source of the RNA sample (needsReview).

## Sources and License
- **Reporting standard:** Bustin SA, et al. *The MIQE Guidelines: Minimum
  Information for Publication of Quantitative Real-Time PCR Experiments.* Clin
  Chem. 2009;55(4):611–622. DOI: 10.1373/clinchem.2008.112797.
- This example is a representative RT-qPCR workflow structured to capture MIQE-required
  metadata; kit-, primer-, and instrument-specific values are marked **needsReview**
  and must be set from the actual reagents/instrument used.
- **License:** Example content authored for LabRecord; MIQE checklist items are
  cited, not reproduced.
