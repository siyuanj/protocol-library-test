# Section 3 — Library, Ownership & Version Design (universal management system)

**Scope.** This governs *any* protocol in the canonical format (Section 2), regardless of
discipline. Nothing here is specific to a technique — it operates on `ProtocolVersion`
records whose body is the discipline-neutral canonical JSON. The design answers the five
Section-3 questions: ownership/permissions, movement between libraries, reference/fork/
version/lineage rules, lab review workflow, and archival/provenance preservation.

## 0. Principles

1. **Discipline-agnostic.** The system stores/versions/permissions `ProtocolVersion`s; it never inspects assay-specific fields. A physics, chemistry, or bioinformatics protocol is handled identically to a wet-lab one.
2. **Immutability of published versions.** A *draft* is mutable; a *saved/published version* is frozen and content-addressed (`contentHash`). Edits never mutate a version — they create a new one.
3. **Provenance is never lost.** Every version records where it came from (`parentVersionId`, `derivedFromVersionId`) and carries its `sources`/`license` from the canonical body.
4. **Public updates never reach into what others already rely on.** Saved references, forks, lab versions, and past runs are insulated from upstream edits.
5. **Runs are reproducible.** A run binds to an exact `protocolVersionId` and stores an immutable snapshot of the body.

## 1. Entities (data model)

| Entity | Key fields | Notes |
|---|---|---|
| `User` | id, name, orcid | individual owner of a Private library |
| `Lab` | id, name, ownerUserId | a workspace; has members |
| `LabMembership` | labId, userId, role ∈ {viewer, editor, reviewer, owner} | RBAC within a lab |
| `Protocol` | id, library ∈ {public, private, lab}, ownerRef, currentVersionId, family, category, title | the "container"; points at the latest version |
| `ProtocolVersion` | id, protocolId, versionNo, **contentHash**, body(JSON), status, parentVersionId, derivedFromVersionId, createdBy, createdAt, license | immutable once status ≥ published/approved |
| `SavedReference` | id, userOrLabRef, targetVersionId, savedAt | a pointer to an exact public version (no copy) |
| `LabSubmission` | id, labId, sourceVersionId, draftVersionId, submittedBy, state | the review workflow record |
| `Review` | id, submissionId, reviewerId, decision ∈ {approved, changes_requested}, comment, reviewedAt | audit trail |
| `Run` | id, protocolVersionId, snapshot(JSON), operator, startedAt, results | binds an experiment to an exact version |

The `ProtocolVersion.body`, `status`, `parentVersionId`, `derivedFromVersionId`, `license`,
and `contentHash` map 1:1 onto the canonical schema's [`provenance`](canonical-schema.json)
block — so the management layer and the document format share one source of truth.

## 2. The three libraries — ownership & permissions

| Library | Owner | Who can edit | Save behavior |
|---|---|---|---|
| **Public** | LabRecord | LabRecord admins only | A user *saves a reference* to an exact version (no copy) |
| **Private** | Individual user | The owner | Editing a public protocol creates a *private fork* |
| **Lab** | Lab workspace | Editors edit drafts; reviewer/owner approves | Public/private submissions create *lab-owned drafts* |

**Permission matrix** (✓ allowed):

| Action | Public visitor | Private owner | Lab viewer | Lab editor | Lab reviewer/owner | LabRecord admin |
|---|---|---|---|---|---|---|
| View public version | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Save reference to public | ✓ (to own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Fork to private | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit private draft | — | ✓ (own) | — | — | — | — |
| View lab protocol | — | — | ✓ (member) | ✓ | ✓ | ✓ |
| Edit lab draft | — | — | — | ✓ | ✓ | — |
| Approve lab submission | — | — | — | — | ✓ | — |
| Publish/edit public | — | — | — | — | — | ✓ |
| Create run from version | — | ✓ (own) | ✓ | ✓ | ✓ | ✓ |

Access control is enforced at the `Protocol.library` + owner/membership level — **not** by
protocol content, so it is uniform across disciplines. A user must never see another user's
private protocol or an unrelated lab's protocol (final-test item 5).

## 3. Movement between libraries

```
                 save reference (no copy)
   PUBLIC v3  ─────────────────────────────►  a user's / lab's SavedReference → still points at PUBLIC v3
       │
       │ fork (derivedFromVersionId = PUBLIC v3)
       ▼
   PRIVATE fork v1  ──edit──►  PRIVATE v2 ...      (mutable drafts between immutable versions)
       │
       │ submit to lab (derivedFromVersionId = PRIVATE v2)
       ▼
   LAB draft  ──review──►  approved LAB v1  ──run──►  Run #104 + immutable snapshot
```

- **Reference** = a saved pointer to an exact version. Cheap, no duplication, always resolves to the same content.
- **Fork** = a copy into another library with `derivedFromVersionId` set to the exact source; the fork evolves independently.
- **Lab submission** = a fork *into a lab* that enters the review workflow.

## 4. Reference / fork / version / lineage rules

- **Drafts are mutable; saved versions are immutable.** Saving freezes the body and stamps `contentHash`.
- **`parentVersionId`** links successive versions in one lineage (v1 → v2 → v3).
- **`derivedFromVersionId`** records the exact source of a fork or submission (cross-lineage edge).
- **Public updates never overwrite** saved references, private forks, lab versions, or past runs — they create a new public version; existing references keep pointing at the old one, and the UI shows "a newer version exists."
- **Every approval binds to an exact `versionId` + `contentHash`.**
- **Every run binds to an exact `protocolVersionId`** and stores a body snapshot.

**Lineage example**

```
Public qPCR v3
├── Personal saved reference ────────────────► still points to Public v3
└── Private fork v1  (derivedFrom = Public v3)
      └── Lab draft rev 2  (derivedFrom = Private fork v1)
            └── Lab-approved v1  (parent = Lab draft rev 2, contentHash frozen)
                  └── Run #104  (protocolVersionId = Lab-approved v1 + snapshot)
```

## 5. Lab submission → review → approval workflow (state machine)

```
        submit                request changes
draft ─────────► submitted ───────────────────► changes_requested
                    │                                   │
                    │ approve                            │ edit + resubmit
                    ▼                                    ▼
                 approved  ◄──────────────────────── submitted
                    │
                    │ later edit  → requires a NEW version + new review
                    ▼
             approved v(n+1)
```

- Lab status ∈ `draft → submitted → approved | changes_requested`.
- **Approved edits require a new version and a new review** — you cannot silently mutate an approved version.
- Reviewers (role `reviewer`/`owner`) record `approved` or `changes_requested` with a comment; the `Review` rows are an immutable audit trail.
- Approval writes `{versionId, contentHash, reviewerId, timestamp}` — a tamper-evident binding.

## 6. Runs

- A `Run` is created **from an exact `ProtocolVersion`** and stores an immutable `snapshot` of the body plus operator/time/results.
- Creating a **new** lab version does **not** affect existing runs — old runs still resolve to the previous version (final-test item 4).

## 7. Archival & deletion (provenance/license preserved)

- **No hard delete of anything referenced.** A version that has references, forks, lab descendants, or runs is **tombstoned** (`status = archived`), not removed — its `contentHash`, `sources`, and `license` remain resolvable so downstream lineage and citations never break.
- **Unreferenced private drafts** may be hard-deleted by their owner.
- **License travels with the body**: every version keeps the canonical `sources[].license` (+ `licenseVerified`), so a fork/submission cannot strip provenance or reuse terms.
- Archived versions remain visible in **version history** and lineage views, marked `archived`.

## 8. Mapping to the canonical schema

The Section-2 `provenance` block is the on-disk face of this design:

| Section-3 concept | Canonical `provenance` field |
|---|---|
| exact version id | `versionId` |
| version chain | `parentVersionId` |
| fork/submission source | `derivedFromVersionId` |
| immutability binding | `contentHash` |
| which library | `library` ∈ {public, private, lab} |
| owner | `owner` |
| lifecycle | `status` ∈ {draft, submitted, approved, changes_requested, published, archived} |

## 9. API surface (preview of Section 4 implementation)

```
POST /protocols                      validate(body) → create draft (private/lab)
POST /protocols/:id/versions         freeze draft → immutable version (+contentHash)
POST /public/:versionId/save-ref     create SavedReference (no copy)
POST /public/:versionId/fork         create private fork (derivedFrom set)
POST /labs/:labId/submissions        submit version → lab draft (enters review)
POST /submissions/:id/review         approve | request_changes  (reviewer only)
POST /versions/:versionId/runs       create Run (+ body snapshot)
GET  /protocols/:id/history          version chain + lineage graph
```

Every write path first runs the Section-2 validator (`renderer/validate.mjs` logic) so no
malformed or fabricated-value protocol enters a library. This is where Section 4 begins.
