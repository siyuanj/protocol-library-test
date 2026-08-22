# Measurement of Protein Concentration (A280 / BCA / Bradford)

**Protocol ID:** lr-test-protein-concentration · **Version:** 0.1 · **Format:** LabRecord Protocol Format v0.1
**Generated from:** `test_protocol/2-Measurement of Protein Concentration2025.pdf` (2025 teaching protocol) — test-data generation into the LabRecord format.

**Purpose:** Determine the concentration of an unknown protein solution by three
independent methods — UV absorbance at 280 nm, the bicinchoninic acid (BCA) assay,
and the Bradford assay — each calibrated against a standard protein, and compare the results.

**Scope / Applicability:** Colorimetric/UV protein quantitation of soluble samples
against a BSA standard curve, in test tubes/cuvettes (A280, Bradford) and a 96-well
plate (BCA). No single assay suits all proteins (amino-acid-composition dependence),
so results are compared. Bradford here is included for reference (also used in the CK activity assay).

**Estimated time:** ~2–3 h for the three assays (BCA incubation 15–20 min; Bradford color stable ~1 h).

**Before You Begin:**
- Run standard samples in duplicate (or triplicate).
- Use the 0 mg/mL tube (sample 1) as the blank for spectrophotometer zeroing.
- Because the same volume is examined in each assay, plot absorbance directly against standard concentration.
- When computing the unknown concentration, multiply by the dilution factor.

## Materials and Reagents

| ID | Name | Amount / Working conc. | Specification / Grade | Vendor / Cat# |
|---|---|---|---|---|
| m1 | Standard protein (BSA) | 1.0 mg/mL stock | Known-concentration standard | needsReview |
| m2 | Unknown protein solution | — | Sample to quantify | — |
| m3 | Deionized water | as needed | — | — |
| m4 | PBS | as needed | Diluent for BCA | needsReview |
| m5 | BCA Reagent A (BCA solution) | 4 mL per working-solution batch | — | needsReview |
| m6 | BCA Reagent B (Cu²⁺) | 80 µL per working-solution batch | — | needsReview |
| m7 | Bradford working buffer | 3 mL per tube | Acidic Coomassie Brilliant Blue G-250 | needsReview |

## Equipment and Settings

| ID | Name | Model | Settings |
|---|---|---|---|
| e1 | Vortex mixer | needsReview | Mix each sample |
| e2 | UV/Vis spectrophotometer + 1 mL plastic cuvette | needsReview | Read A280 |
| e3 | Microplate reader + 96-well plate | needsReview | Read A562 |
| e4 | 37 °C incubator | needsReview | BCA color development |
| e5 | Vis spectrophotometer + 3 mL plastic cuvette | needsReview | Read A595 (380–780 nm) |
| e6 | Test tubes (10 mL / 5 mL / 1.5 mL) | — | Sample preparation |

## Procedure

### Phase 1 — A280 (UV) assay

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 1 | Prepare 14 test tubes with standards, unknown, and deionized water per Table 1; mix on vortex (e1) | see Table 1 (0–1.0 mg/mL series; unknown 2.0 mL) | Standard series + unknown ready | Total volume 2.0 mL per tube |
| 2 | Read A280 in a 1 mL cuvette (e2); zero with sample 1 (0 mg/mL) | 280 nm | A280 per tube | Sample 1 is the blank |
| 3 | Plot A280 vs mg/mL standard; estimate unknown; calculate A(1%, 1cm) at 280 nm | — | Calibration curve + unknown conc. | — |

> **Table 1 (A280).** Standard protein 1.0 mg/mL (mL): 0 / 0.4 / 0.8 / 1.2 / 1.6 / 2.0; Deionized water (mL): 2.0 / 1.6 / 1.2 / 0.8 / 0.4 / 0; → 0 / 0.2 / 0.4 / 0.6 / 0.8 / 1.0 mg/mL. Tube 7 = 2.0 mL unknown.

### Phase 2 — BCA assay (96-well plate)

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 4 | Prepare BCA working solution: 4 mL Reagent A + 80 µL Reagent B in a 5-mL tube (e6) | 4 mL : 80 µL | Working solution ready | Cu²⁺ + BCA → colored complex |
| 5 | Dilute standard BSA to 0.5 mg/mL (500 µL + 500 µL PBS); serial-dilute per Table 2 (duplicate) | 0–0.25 mg/mL series | Standard series ready | Repeat for duplicate |
| 6 | Load standards to wells B–G (two columns); load experimental sample: 20 µL, 10 µL+10 µL PBS (1/2), 5 µL+15 µL PBS (1/4) | see Figure 1 layout | Plate loaded | Dilutions may be pre-made in 1.5-mL tubes |
| 7 | Add 200 µL BCA working solution to each well; incubate; read A562 (e3, e4) | 200 µL; 37 °C; 15–20 min; 562 nm | A562 per well | — |
| 8 | Plot standard curve (A562 vs mg/mL); calculate unknown | — | Unknown conc. | Multiply by the dilution factor |

> **Table 2 (BCA).** Standard 0.5 mg/mL (µL): 0 / 50 / 100 / 150 / 200 / 250; PBS (µL): 500 / 450 / 400 / 350 / 300 / 250; → 0 / 0.05 / 0.10 / 0.15 / 0.20 / 0.25 mg/mL.

### Phase 3 — Bradford microassay *(reference)*

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 9 | Dilute standard protein to 0.1 mg/mL (~10 mL) | 0.1 mg/mL | Working standard | — |
| 10 | Prepare 17 test tubes per Table 3 (standards/unknown/water) + 3 mL Bradford buffer each; mix on vortex (e1) | 3 mL dye per tube | Color develops | Dye shift 465 → 595 nm |
| 11 | Read A595 in a 3 mL cuvette (e5); read low→high protein | 595 nm; color complete 2 min, stable ~1 h | A595 per tube | Read sequentially to limit dye carryover |
| 12 | Plot µg standard vs A595; estimate unknown | — | Calibration curve + unknown conc. | — |

> **Table 3 (Bradford).** Standard 0.1 mg/mL (mL): 0 / 0.1 / 0.2 / 0.4 / 0.6 / 0.8 / 1.0 → 0 / 10 / 20 / 40 / 60 / 80 / 100 µg; unknown (mL): 0.05 / 0.1 / 0.2; deionized water to 1.0 mL; Bradford buffer 3 mL each.

## Controls
- **Blank / zero:** 0 mg/mL tube (sample 1) for spectrophotometer zeroing in each assay.
- **Standard curve:** BSA dilution series in each assay (run in duplicate/triplicate).
- **Dilution-factor correction:** apply to diluted unknown wells (BCA 1/2, 1/4).
- **Method comparison:** compare A280 vs BCA vs Bradford results and discuss discrepancies.

## Expected Outputs
- Three standard curves (A280, A562, A595) and the estimated unknown concentration from each.
- A(1%, 1cm) at 280 nm for the unknown.
- A comparison/discussion of the three methods.

## Troubleshooting

| Problem | Likely cause | Solution |
|---|---|---|
| Nonlinear standard curve | Out-of-range concentrations; pipetting error | Keep within the series range; re-pipette; use duplicates |
| Bradford dye carryover between reads | Incomplete cuvette rinsing | Read low→high protein content; rinse cuvette |
| Method results disagree | Amino-acid-composition dependence of each assay | Choose a suitable standard; report the method; discuss |
| BCA under/over-reads | Wrong dilution factor applied | Multiply diluted wells by the correct dilution factor |

## Safety
- BCA Reagent B (Cu²⁺) and Coomassie dye (acidic) are irritants — wear gloves; follow disposal rules.
- Standard laboratory PPE.

## Sources and License
- **Source file:** `test_protocol/2-Measurement of Protein Concentration2025.pdf` ("Measurement of Protein Concentration", 2025). Reagent volumes, dilution tables, wavelengths (280/562/595 nm), and incubation (37 °C, 15–20 min) transcribed from this source.
- **License:** Institutional teaching material; reuse terms not specified (needsReview).
- Items marked **needsReview** were not specified in the source and must be confirmed before execution.
