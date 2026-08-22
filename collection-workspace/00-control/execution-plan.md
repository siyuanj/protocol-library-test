# Phase 1 Execution Plan

The 142 category entries are a coverage checklist, not a recommendation to create 142 chats. A category can contain multiple public protocol records, source families, and meaningful variants. The current session queue in `../../collection-session-batches.js` creates 43 chat-ready packets and assigns every category exactly once. Each new conversation is an independent crawler that writes directly to its own `../../data/sessions/<session-id>/result.json` path; the management conversation does not collect pasted JSON.

## Recommended operating model

- Use a dedicated collection run for broad or high-variation categories, such as PCR, qPCR, Western blot, mammalian cell culture, transfection, flow cytometry, RNA extraction, NGS library preparation, ChIP-seq, ATAC-seq, ELISA, microscopy, and animal tissue work.
- Batch only two or three narrow, closely related categories that share the same source ecosystem. Keep their `session-result.json` outputs separate even if one conversation performs the work.
- Do not create one task for every source protocol. A single category run should find multiple candidates, select one strongest representative, and retain the rest as screened alternatives or variants.
- When a category proves too broad, do not silently mix incompatible variants. Write a `coverageGaps` item with a suggested child category, then the coordinator can schedule a focused follow-up run.
- A crawler's final chat response is only a handoff note with packet status and its written data path. The static pages read local result files directly after refresh.

## Suggested waves

1. **Source calibration, 1-2 runs**: define priority public repositories, publisher record pages, DOI checks, and license-evidence practices. This improves consistency across all later runs.
2. **Core high-variation methods, about 12-18 runs**: handle the major wet-lab and sequencing workflows individually because variant boundaries materially affect the representative choice.
3. **Remaining core coverage, about 15-25 runs**: batch small compatible categories into focused domain runs while retaining one JSON result per category.
4. **Common and extended coverage, demand-driven**: schedule only after core screening reveals gaps, software-import needs, or user demand.

The current practical workload is 43 focused collection packets, not 142. Expand it only where the returned evidence shows that a packet contains incompatible variants or insufficient source coverage.
