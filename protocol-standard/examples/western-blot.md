# Western Blot (SDS-PAGE → Transfer → Immunoblotting)

**Protocol ID:** lr-example-western-blot · **Version:** 0.1 · **Format:** LabRecord Protocol Format v0.1

**Purpose:** Separate proteins by SDS-PAGE, transfer them onto a membrane, and
detect a target protein with a specific primary antibody and an enzyme-conjugated
secondary antibody. Written here for a Strep-tag / T7-tag pull-down readout, but
the workflow is generic.

**Scope / Applicability:** Denaturing (SDS) western blot of soluble protein
samples on a nitrocellulose membrane, developed by alkaline-phosphatase (AP) or
horseradish-peroxidase (HRP) chromogenic/ECL detection. Not validated here for
native PAGE, PVDF membranes, or quantitative (fluorescent) western blot.

**Estimated time:** ~2 days (Day 1: casting/running gel, transfer, overnight
block; Day 2: antibody incubations, washes, development). Blocking may instead be
done at room temperature in 1–2 h.

**Before You Begin:**
- Design the blot before starting: decide which lanes report each tag, which lane
  is the input control, how the protein–protein interaction is read out, and what
  negative/positive controls are loaded (see **Controls**).
- Mix every sample with 2× SDS sample (loading) buffer at 1:1 (v/v) and denature
  before loading.
- Prepare all buffers in the **Materials and Reagents** table.

## Materials and Reagents

| ID | Name | Amount / Working conc. | Specification / Grade | Vendor / Cat# |
|---|---|---|---|---|
| m1 | 2× SDS sample (loading) buffer | 1:1 (v/v) with sample | Reducing, SDS-PAGE grade | needsReview |
| m2 | SDS-polyacrylamide resolving gel | 12% | Cast in-house | — |
| m3 | Nitrocellulose (NC) membrane | 1 × gel size | Blotting grade | needsReview |
| m4 | Filter paper | 8 sheets × gel size | Blotting grade | — |
| m5 | Transfer buffer | see recipe | 25 mM Tris, 200 mM glycine, 20% methanol, 0.1% SDS, pH 8.5 | in-house |
| m6 | TBS | see recipe | 20 mM Tris-HCl, 150 mM NaCl, pH 7.5 | in-house |
| m7 | TBST | see recipe | TBS + 0.05% (v/v) Tween-20 | in-house |
| m8 | Block solution | 2–3% (w/v) | Non-fat dry milk in TBST | in-house |
| m9 | Primary antibody — mouse α-Strep | 1:5000 (1:8000–1:5000 range) | Monoclonal | provided / needsReview |
| m10 | Primary antibody — mouse α-T7 | 1:5000 | Monoclonal | provided / needsReview |
| m11 | Secondary antibody — Goat-anti-mouse IgG(H/L)-AP or -HRP | 1:5000 | Enzyme-conjugated | provided / needsReview |
| m12 | AP substrate (BCIP-T + NBT) | 35 µL BCIP-T (50 mg/mL in DMF) + 45 µL NBT (50 mg/mL in DMF) per 10 mL AP buffer | AP buffer: 100 mM Tris-HCl, 100 mM NaCl, 5 mM MgCl₂, pH 9.5 | in-house |
| m13 | HRP substrate (CN/DAB, chromogenic) | 30 mg CN + 10 mg DAB, PBS to 50 mL; add 10 µL 30% H₂O₂ per 10 mL just before use | Sigma reagents | Sigma |
| m14 | HRP substrate (ECL) | per kit | Chemiluminescent | needsReview |
| m15 | Coomassie Brilliant Blue R-250 | staining / destaining | For optional total-protein gel | in-house |
| m16 | ddH₂O | as needed | — | — |

> Coomassie staining of a parallel/duplicate gel (m2 + m15) is optional and used
> only for total-protein analysis; run two gels, or cut one gel, if both Coomassie
> and transfer are needed.

## Equipment and Settings

| ID | Name | Model | Settings |
|---|---|---|---|
| e1 | Vertical SDS-PAGE electrophoresis cell + power supply | needsReview | Run until dye front resolves target range |
| e2 | Wet (tank) transfer apparatus | needsReview | Constant current I (mA) = gel surface area (cm²) × 0.8 mA/cm²; 40–60 min |
| e3 | Orbital shaker / rocking platform | needsReview | Room temperature, gentle |
| e4 | 4 °C incubator/cold room | — | Overnight blocking (optional) |

## Procedure

### Phase 1 — SDS-PAGE

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 1 | Treat all samples with 2× SDS sample buffer (m1) and denature | 1:1 (v/v) | Samples ready to load | Prepare/confirm the pull-down samples (tubes AB, CB) and the input sample |
| 2 | Cast a 12% SDS-polyacrylamide gel (m2) | 12% resolving | Even, bubble-free gel | — |
| 3 | Load samples per the blot design (e1) | — | Ladder + all lanes loaded | Reserve a lane for MW ladder and for controls |
| 4 | Run the gel to separate proteins (e1) | Until adequate separation | Dye front migrates; bands resolved | — |
| 5 | Remove the gel from the cassette; cut per design if needed | — | Intact gel | Handle gel gently to avoid tearing |
| 6 | *(Optional)* Stain a portion/duplicate gel with Coomassie R-250 (m15), destain later | Stain overnight | Total-protein pattern visible | Use a second gel or cut the gel if both Coomassie and transfer are required |

### Phase 2 — Transfer

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 7 | Soak 8 filter papers (m4) in transfer buffer (m5); rinse the NC membrane (m3) | ≥5–10 min soak | Papers/membrane wetted, no trapped air | Drive off all bubbles between layers |
| 8 | Assemble the stack in the tank: cathode(−) → filter paper → gel → NC membrane → filter paper → anode(+) | — | Stack in correct polarity order | Protein migrates from gel (−) toward membrane (+) |
| 9 | Run constant-current transfer (e2) | I (mA) = area (cm²) × 0.8; 40–60 min | Proteins transferred to membrane | After transfer, rinse membrane with TBS (m6) 3–5 s |
| 10 | Block the membrane in block solution (m8) | 2–3% milk/TBST; 4 °C overnight, or RT 1–2 h | Non-specific sites blocked | Choose overnight vs RT per optimized protocol |

### Phase 3 — Immunoblotting

| Step | Action | Parameters | Expected Result / QC | Critical Notes |
|---|---|---|---|---|
| 11 | Wash membrane with fresh TBST (m7); keep wet | — | Membrane never dries | Drying causes high background |
| 12 | Incubate with primary antibody (m9/m10) | ~5 mL, 1:8000–1:5000 in TBST; RT, 1.5 h, shaking (e3) | Antibody bound to target | Match antibody to the tag being probed |
| 13 | Wash with fresh TBST (m7) | 3 × 5 min | Unbound primary removed | — |
| 14 | Incubate with secondary antibody (m11) | ~5 mL, 1:5000 in TBST; RT, 30 min, shaking (e3) | Enzyme-conjugate bound | Use AP- or HRP-conjugate matching your substrate |
| 15 | Wash with TBST (m7) | 3 × 5 min | Unbound secondary removed | — |
| 16 | Wash with TBS (m6) | 5 s | Tween-20 removed | Required before AP/chromogenic development |
| 17 | Develop in substrate (m12 for AP; m13 or m14 for HRP) | 10 mL substrate | Specific bands appear | For HRP/DAB add H₂O₂ immediately before use |
| 18 | Stop development in ddH₂O (m16); dry membrane on filter paper | — | Reaction stopped; membrane dried | Chromogenic band color fades over a few days — image promptly |

## Controls
- **Input control:** load the input (T7-tag-B) sample to confirm expression/loading.
- **Tag-specificity controls:** probe Strep-tag lanes (A, C) with α-Strep and the input with α-T7.
- **Interaction readout:** compare pull-down lanes (AB vs CB) to test protein–protein interaction.
- **Recommended additional controls:** no-primary-antibody control (secondary-only), a
  positive lysate lane, and a MW ladder in every gel.

## Expected Outputs
- Discrete immunoreactive band(s) at the expected molecular weight for each tag.
- Optional Coomassie gel showing total-protein loading.
- A recorded image of the developed membrane (bands fade, so capture promptly).

## Troubleshooting

| Problem | Likely cause | Solution |
|---|---|---|
| High background | Membrane dried; insufficient blocking; antibody too concentrated | Keep membrane wet; extend blocking; dilute antibody / add washes |
| No / weak signal | Poor transfer; antibody too dilute; substrate exhausted | Verify transfer (Ponceau/Coomassie); increase antibody; use fresh substrate |
| Bands at wrong size | Degradation; incomplete denaturation; wrong antibody | Add protease inhibitors; ensure full denaturation; confirm antibody specificity |
| Uneven / patchy bands | Air bubbles in transfer stack | Re-roll stack to remove bubbles before transfer |

## Safety
- Acrylamide (unpolymerized) is a neurotoxin — wear gloves; handle gels and stock solutions with care.
- Methanol (transfer buffer) and DMF (substrate stocks) are flammable/toxic — use in a fume hood.
- DAB is a suspected carcinogen; NBT/BCIP and H₂O₂ are irritants — follow institutional disposal rules.
- Biosafety level depends on the source material of the samples (needsReview).

## Sources and License
- **Source file:** `test_protocol/9-Westernblotting-2026.pdf` ("The protocol of Western blotting", 2026 teaching protocol). Parameters (12% gel, transfer current formula, buffer recipes, antibody dilutions, incubation times) transcribed from this source.
- **License:** Institutional teaching material; reuse terms not specified (needsReview).
- Items marked **needsReview** were not specified in the source and must be confirmed before execution.
