# Prototype confidence and clustering rules

## Confidence means metadata match confidence

Do not present the current score as scientific validity, reproducibility, safety,
or permission to reuse. It only estimates how confidently a catalog record
represents the named assay/operation.

Suggested score:

- 30% record specificity: individual protocol/DOI beats a search or collection page.
- 25% provenance: publisher/institution and stable source identifiers.
- 20% metadata completeness: title, assay, operation, author/ID, dates, and license evidence.
- 15% corroboration: agreement with independent sources or known canonical taxonomy.
- 10% freshness: recent source verification, not merely a recent publication date.

Labels: `High` (>= 0.90), `Moderate` (0.75-0.89), `Low` (< 0.75), plus
`Unverified metadata` whenever dates or license were not checked at record level.

Keep reuse rights separate: `Reuse verified`, `Verify record license`, or
`Permission required`. Never infer reuse permission from confidence.

## Clustering

Use a canonical key built from normalized assay + operation + specimen/organism +
method/chemistry + platform. Cluster only when the first two match and no known
variant facet conflicts. For example, heat-shock and electroporation, or column
and phenol RNA extraction, should be separate variants/subclusters.

Select one representative per cluster by: individual source record > collection
or search page; then provenance, metadata completeness, independent corroboration,
and recency of verification. Show `Representative` and `N alternatives`; expand
alternatives on demand. Use a deterministic tie-breaker such as newest verified
date, then source title.

## Current dataset caveats

The file is metadata-only and reproduces no instructions, source prose, images,
tables, or protocol steps. However, most Bio-protocol, protocols.io, PMC, and
Springer URLs are search pages rather than individual records. Their displayed
publication/update dates and record-level licenses are therefore not attributable
to a specific protocol and must be treated as provisional. Repeated Addgene dates
also need record-level verification. Current numeric confidence values appear
manually assigned and should be labeled `Prototype confidence` until the scoring
components are stored.

Production records should add `sourceRecordId`, `doi`, `authors`, `licenseCode`,
`licenseUrl`, `licenseVerifiedAt`, `metadataVerifiedAt`, `scoreBreakdown`,
`specimen`, `organism`, `platform`, `methodVariant`, and `safetyLevel`.
