# Mammalian Cell Culture — Subculture (Passaging) of Adherent Cells

**Protocol ID:** lr-example-cell-culture · **Version:** 0.1 · **Format:** LabRecord Protocol Format v0.1

**Purpose:** Maintain an adherent mammalian cell line in exponential growth by
detaching cells at sub-confluence with trypsin-EDTA and reseeding at a defined
split ratio or seeding density.

**Scope / Applicability:** Routine subculture of adherent, trypsin-sensitive
mammalian cell lines in a humidified 37 °C / 5% CO₂ incubator using aseptic
technique in a Class II biosafety cabinet. Suspension cells, primary cells with
specialised dissociation, and enzyme-sensitive lines are out of scope.

**Estimated time:** ~30–45 min per passage (excluding incubation/growth).

**Before You Begin:**
- Confirm the cell line identity, passage number, and expected doubling time
  (line-specific; **needsReview**).
- Warm medium, PBS, and trypsin-EDTA to 37 °C before use.
- Work only in a certified, cleaned biosafety cabinet; decontaminate all surfaces
  and reagents entering the cabinet.

## Materials and Reagents

| ID | Name | Amount / Working conc. | Specification / Grade | Vendor / Cat# |
|---|---|---|---|---|
| m1 | Complete growth medium | pre-warmed to 37 °C | Basal medium + serum (e.g. 10% FBS) + supplements ± antibiotics | needsReview (line-specific) |
| m2 | PBS (Ca²⁺/Mg²⁺-free) | wash volume for vessel | Sterile, cell-culture grade | needsReview |
| m3 | Trypsin-EDTA | 0.05–0.25% trypsin / 0.02% EDTA | Sterile | needsReview |
| m4 | Trypan blue | 1:1 with cell suspension | 0.4% | needsReview |
| m5 | Cell line (adherent) | at ~80–90% confluence | Mycoplasma-negative; identity confirmed | needsReview |

## Equipment and Settings

| ID | Name | Model | Settings |
|---|---|---|---|
| e1 | Class II biosafety cabinet | needsReview | Certified airflow; aseptic technique |
| e2 | Humidified CO₂ incubator | needsReview | 37 °C, 5% CO₂, humidified |
| e3 | Inverted phase-contrast microscope | needsReview | Assess confluence/morphology |
| e4 | Benchtop centrifuge | needsReview | 200–300 × g, 3–5 min |
| e5 | Cell counter / hemocytometer | needsReview | Viable-cell count with trypan blue |
| e6 | Water bath | needsReview | 37 °C for reagent warming |

## Procedure

### Phase 1 — Detach

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 1 | Examine cells (e3) | Target ~80–90% confluence | Healthy morphology, no contamination | Do not passage over-confluent cultures |
| 2 | Aspirate spent medium | — | Vessel emptied | Do not let the monolayer dry |
| 3 | Wash monolayer with PBS (m2) | Cover surface; swirl; aspirate | Serum (trypsin inhibitor) removed | Residual serum blocks trypsin |
| 4 | Add trypsin-EDTA (m3); incubate | 37 °C, ~3–5 min (line-specific) | Cells round up and detach | Tap flask; avoid over-trypsinization |

### Phase 2 — Neutralize & Count

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 5 | Add complete medium (m1) to neutralize trypsin | ≥2× the trypsin volume | Trypsin inhibited | Serum inactivates trypsin |
| 6 | Pipette to a single-cell suspension | Gentle trituration | Dispersed single cells | Avoid bubbles/shear |
| 7 | *(Optional)* Centrifuge and resuspend (e4) | 200–300 × g, 3–5 min | Cell pellet; resuspend in fresh medium | Needed to remove trypsin fully |
| 8 | Count viable cells (e5, m4) | Trypan blue 1:1 | Viable cells/mL, % viability | Record count for defined seeding |

### Phase 3 — Reseed

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 9 | Seed new vessel by split ratio or density | e.g. 1:5–1:10, or defined cells/cm² (needsReview) | Even cell distribution | Distribute by gentle rocking, not swirling |
| 10 | Add complete medium (m1); return to incubator (e2) | 37 °C, 5% CO₂ | Cells attach and grow | Label vessel: line, passage #, date |

## Controls
- **Sterility / contamination check:** inspect medium (turbidity, pH color) and
  cells by microscopy each passage; run a cell-free medium vessel if contamination
  is suspected.
- **Mycoplasma testing:** perform periodically (line health control).
- **Passage-number tracking:** record cumulative passage number (identity/senescence control).

## Expected Outputs
- A reseeded culture at the target density that reattaches and resumes exponential growth.
- Recorded viable-cell count, % viability, split ratio/seeding density, and passage number.

## Troubleshooting

| Problem | Likely cause | Solution |
|---|---|---|
| Cells won't detach | Insufficient trypsin/time; residual serum | Wash with PBS first; extend trypsin time; warm reagents |
| Low viability after passage | Over-trypsinization; harsh pipetting | Shorten trypsin exposure; neutralize promptly; pipette gently |
| Contamination (turbid/color change) | Broken aseptic technique | Discard culture; decontaminate cabinet; review technique |
| Slow growth | Seeded too sparsely; medium/supplement issue | Increase seeding density; use fresh complete medium |

## Safety
- Human/primate cell lines are typically handled at **BSL-2**; follow institutional
  biosafety approval (needsReview for the specific line).
- Aseptic technique throughout; decontaminate waste and surfaces.

## Sources and License
- **Reference practice:** standard adherent mammalian-cell subculture (e.g. ATCC
  animal-cell-culture guidelines; Freshney, *Culture of Animal Cells*). General
  method; no proprietary protocol text reproduced.
- This example is a representative subculture workflow; line-specific values
  (medium, serum %, trypsin strength/time, seeding density, BSL) are marked
  **needsReview** and must be set for the actual cell line.
- **License:** Example content authored for LabRecord.
