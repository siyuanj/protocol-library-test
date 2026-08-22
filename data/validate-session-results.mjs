import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const dataRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(dataRoot);
const context = { window:{} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(projectRoot, "common-protocol-categories.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(projectRoot, "collection-session-batches.js"), "utf8"), context);

const sessions = context.window.COLLECTION_SESSION_BATCHES || [];
const summary = { complete:0, partial:0, blocked:0, inProgress:0, missing:0, invalid:0 };
let hasInvalid = false;

const unique = (values) => [...new Set(values)];
const sameSet = (left, right) => left.length === right.length && left.every((value) => right.includes(value));
const sameOrder = (left, right) => left.length === right.length && left.every((value, index) => value === right[index]);
const packetStatuses = new Set(["complete", "partial", "blocked", "in-progress"]);
const categoryStatuses = new Set(["complete", "partial", "blocked", "no-qualified-record"]);
const isHttpUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);
const isTimestamp = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value));

function recordErrors(category, verification) {
  const errors = [];
  if (!category || typeof category !== "object") return ["category result is not an object"];
  if (!category.categoryId || !category.categoryLabel) errors.push("category ID or label is missing");
  if (!categoryStatuses.has(category.status)) errors.push(`${category.categoryId || "unknown"}: invalid category status`);
  if (!Array.isArray(category.sourcesSearched)) errors.push(`${category.categoryId || "unknown"}: sourcesSearched must be an array`);
  if (!Array.isArray(category.screened)) errors.push(`${category.categoryId || "unknown"}: screened must be an array`);
  if (!Array.isArray(category.coverageGaps)) errors.push(`${category.categoryId || "unknown"}: coverageGaps must be an array`);
  if (!Array.isArray(category.nextSearchSuggestions)) errors.push(`${category.categoryId || "unknown"}: nextSearchSuggestions must be an array`);

  const representative = category.representative;
  if (category.status === "complete" && !representative) errors.push(`${category.categoryId}: complete category has no representative`);
  if (representative) {
    for (const field of ["title", "protocolType", "assay", "operation", "source", "sourceUrl", "safetyLevel", "selectionNote"]) {
      if (typeof representative[field] !== "string" || !representative[field].trim()) errors.push(`${category.categoryId}: representative ${field} is missing`);
    }
    if (!isHttpUrl(representative.sourceUrl)) errors.push(`${category.categoryId}: representative sourceUrl is not an HTTP(S) URL`);
    if (!Number.isFinite(representative.confidence) || representative.confidence < 0 || representative.confidence > 1) errors.push(`${category.categoryId}: representative confidence must be 0-1`);
    if (!isTimestamp(representative.metadataVerifiedAt)) errors.push(`${category.categoryId}: representative metadataVerifiedAt is invalid`);
    if (verification?.sourceUrlPass === true && !isHttpUrl(representative.sourceUrl)) errors.push(`${category.categoryId}: sourceUrlPass conflicts with representative URL`);
    if (verification?.licenseEvidencePass === true && !isHttpUrl(representative.licenseEvidenceUrl)) errors.push(`${category.categoryId}: licenseEvidencePass conflicts with missing license evidence URL`);
  }
  for (const screened of category.screened || []) {
    if (!screened || typeof screened !== "object" || !screened.title || !screened.source || !isHttpUrl(screened.sourceUrl) || !screened.screenStatus || !screened.reason) {
      errors.push(`${category.categoryId || "unknown"}: screened record is missing required metadata`);
    }
  }
  return errors;
}

for (const session of sessions) {
  const resultPath = path.join(dataRoot, "sessions", session.id, "result.json");
  if (!fs.existsSync(resultPath)) {
    summary.missing += 1;
    console.log(`MISSING  ${session.id}`);
    continue;
  }

  let result;
  try {
    result = JSON.parse(fs.readFileSync(resultPath, "utf8"));
  } catch (error) {
    summary.invalid += 1;
    hasInvalid = true;
    console.log(`INVALID  ${session.id}  unreadable JSON`);
    continue;
  }

  const expected = session.categoryIds;
  const categoryResults = Array.isArray(result.categoryResults) ? result.categoryResults : [];
  const actual = categoryResults.map((item) => item?.categoryId).filter(Boolean);
  const duplicateActual = actual.filter((id, index) => actual.indexOf(id) !== index);
  const missing = expected.filter((id) => !actual.includes(id));
  const unexpected = actual.filter((id) => !expected.includes(id));
  const verification = result.verification || {};
  const errors = [];
  if (result.schemaVersion !== "1.0") errors.push("schemaVersion must be 1.0");
  if (result.sessionId !== session.id) errors.push("sessionId does not match its assigned directory");
  if (typeof result.sessionTitle !== "string" || !result.sessionTitle.trim()) errors.push("sessionTitle is missing");
  if (!packetStatuses.has(result.packetStatus)) errors.push("packetStatus is invalid");
  if (!isTimestamp(result.writtenAt)) errors.push("writtenAt is invalid");
  if (!sameOrder(expected, actual)) errors.push("category result IDs must match the assigned IDs in order");
  if (duplicateActual.length) errors.push(`duplicate category IDs: ${unique(duplicateActual).join(", ")}`);
  if (missing.length) errors.push(`missing category IDs: ${missing.join(", ")}`);
  if (unexpected.length) errors.push(`unexpected category IDs: ${unexpected.join(", ")}`);
  if (!sameOrder(verification.expectedCategoryIds || [], expected)) errors.push("verification.expectedCategoryIds does not match assignment order");
  if (!sameOrder(verification.actualCategoryIds || [], actual)) errors.push("verification.actualCategoryIds does not match category result order");
  if (!sameSet(unique(verification.missingCategoryIds || []), missing)) errors.push("verification.missingCategoryIds is inconsistent");
  if (!sameSet(unique(verification.duplicateCategoryIds || []), unique(duplicateActual))) errors.push("verification.duplicateCategoryIds is inconsistent");
  if (!Array.isArray(verification.selfCheckNotes) || !isTimestamp(verification.selfVerifiedAt)) errors.push("verification self-check metadata is incomplete");
  if (result.packetStatus === "complete" && verification.coveragePass !== true) errors.push("complete packet requires verification.coveragePass=true");
  categoryResults.forEach((category) => errors.push(...recordErrors(category, verification)));
  const valid = errors.length === 0;

  if (!valid) {
    summary.invalid += 1;
    hasInvalid = true;
    console.log(`INVALID  ${session.id}  ${errors.join("; ")}`);
    continue;
  }

  if (result.packetStatus === "complete") summary.complete += 1;
  else if (result.packetStatus === "partial") summary.partial += 1;
  else if (result.packetStatus === "blocked") summary.blocked += 1;
  else summary.inProgress += 1;
  console.log(`${String(result.packetStatus || "in-progress").toUpperCase().padEnd(8)} ${session.id}  ${actual.length}/${expected.length} categories`);
}

console.log("\nSummary");
console.log(JSON.stringify(summary, null, 2));
if (hasInvalid) process.exitCode = 1;
