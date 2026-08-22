# Protocol Collection Workspace

This directory contains coordinator planning and later review references only. Independent crawler sessions write their authoritative metadata-only outputs directly to `../data/sessions/<session-id>/result.json`; see `../data/README.md` for the live crawler contract. Do not store copied protocol steps, source PDFs, figures, videos, or long source passages here unless a separate rights review explicitly permits it.

## Directory layout

```text
collection-workspace/
  00-control/                         Coordinator-owned rules and manifests
  01-inbox/                          Reserved for coordinator-imported legacy data
  02-screened/                        Reviewed candidate lists and clusters
  03-normalized/                      Validated records for the master catalog
  04-review/                          License, metadata, and conflict queues
  05-delivery/                        Versioned app imports and release reports
  99-archive/                         Superseded or withdrawn work packages
```

## Parallel-session workflow

1. Copy one session packet from `../process-manager.html`. The current queue contains 43 packets that cover all 142 category entries exactly once.
2. Treat the new conversation as an independent crawler. It searches public sources, verifies its own metadata, and writes one `../data/sessions/<session-id>/result.json` file. Its `categoryResults` array contains one separate result per assigned category.
3. The crawler re-reads and validates its own file, then returns only a short final summary and the written path in chat. It does not paste JSON back to the coordinator and does not write a central manifest.
4. The static management page and delivery catalog fetch the fixed paths directly. The coordinator reviews only files that are partial, blocked, invalid, or flagged by the data dashboard.
5. Optional later review exports may be placed under `02-screened/`, `03-normalized/`, `04-review/`, or `05-delivery/`; those folders are not part of the initial crawler handoff.

Only the coordinator may write to `00-control/`, `02-screened/`, `03-normalized/`, `04-review/`, `05-delivery/`, and `99-archive/`. A collection session writes only to its own `../data/sessions/<session-id>/` directory. This avoids concurrent overwrite conflicts.

## Optional review package

```text
02-screened/<review-id>/
  session-result.json       A reviewed copy of a crawler result, when needed
  review-notes.md           Optional short decision record; no copied source text
```

Use `../protocol-schema.json` as the target record schema after a result has passed screening and normalization. `00-control/collection-config.json` points to the authoritative local category list and current prompt version.
