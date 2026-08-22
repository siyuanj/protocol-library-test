# Protocol Atlas Data Directory

This is the authoritative local data root for independent crawler sessions. The static prompt copier knows every session ID in `../collection-session-batches.js` and reads exactly one deterministic file per session:

```text
data/sessions/<session-id>/result.json
```

For example, the PCR core crawler owns only:

```text
data/sessions/molecular-pcr-core/result.json
```

## Ownership and concurrency

- A crawler session owns one complete packet and writes only its own `data/sessions/<session-id>/` directory.
- Do not edit `data/sessions/` directories owned by another crawler, the session-plan JavaScript, or the static website.
- Do not create or edit a central index file. The website derives expected paths from the fixed session queue, so independent workers never contend for shared metadata.
- A crawler must finish all categories in its packet before marking `packetStatus` as `complete`. If evidence is incomplete, write a valid `partial` or `blocked` result with explicit gaps; do not silently omit a category.

## Result contract

Use `session-result.schema.json` as the contract. A result must include:

- `sessionId`, matching its directory name exactly.
- `packetStatus`: `complete`, `partial`, `blocked`, or `in-progress`.
- `categoryResults`, with exactly one entry for every category assigned to the packet.
- `verification`, proving expected IDs, actual IDs, missing IDs, duplicate IDs, and the worker's self-check outcome.
- Metadata, source URLs, DOI/source identifiers, license evidence, short evidence notes, screened alternatives, and coverage gaps only.
- Screened alternatives may include optional publication/update dates, confidence, license fields, metadata verification time, and evidence status so the catalog can show candidate quality without copying source content.

Do not store copied protocol steps, long source passages, figures, videos, or source PDFs here unless a separate rights review explicitly permits it.

## Static-site behavior

- `../process-manager.html` fetches all fixed expected `result.json` paths, shows packet status and coverage, and supplies copy-ready prompts for unstarted packets.
- `../index.html` fetches the same paths and turns completed category results into the delivery catalog. A category's representative is displayed first; its screened records are counted and hidden until requested.
- Neither page scans the filesystem or writes a central index. They derive all paths from `../collection-session-batches.js`, so simultaneous crawler sessions never contend for shared metadata.

Open either page through a local HTTP server, such as `http://127.0.0.1:4176/process-manager.html`; opening the HTML with `file://` prevents reliable local JSON fetching in browsers. Refresh the page after a crawler writes or updates its result file.

## Coordinator check

Run this after one or more crawlers have written results:

```powershell
node data/validate-session-results.mjs
```

Missing files are reported as not started. Invalid files produce a nonzero exit code. The check verifies assignment order, packet/category status, self-check fields, representative metadata, HTTP(S) source URLs, and screened-record basics; partial and blocked files remain visible as legitimate states that need follow-up.

## Ad-hoc exception work

The 43 packet directories under `data/sessions/` are the dashboard's primary work surface. A coordinator-approved single-category follow-up may write to `data/ad-hoc/<category-id>/result.json` using the same schema, but it is intentionally not merged into a packet automatically. The coordinator must review and assign it before promotion.
