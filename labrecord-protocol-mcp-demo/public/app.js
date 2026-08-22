const protocolVersion = "2025-11-25";
const byId = id => document.getElementById(id);
const elements = {
  files: byId("sourceFiles"), fileList: byId("fileList"), instruction: byId("instruction"), title: byId("title"),
  category: byId("category"), sourceText: byId("sourceText"), import: byId("importButton"), status: byId("importStatus"),
  sample: byId("sampleButton"), refresh: byId("refreshButton"), empty: byId("emptyState"), list: byId("draftList"), template: byId("draftTemplate")
};

function selectedFiles() { return [...elements.files.files]; }
function renderFiles() {
  elements.fileList.replaceChildren(...selectedFiles().map(file => {
    const chip = document.createElement("span"); chip.className = "file-chip"; chip.textContent = file.name; return chip;
  }));
}

function parseTextIntoSteps(text) {
  const steps = []; let current;
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    const isMaterial = /^\s+-\s+/.test(rawLine);
    if (isMaterial && current) {
      const [name, amount, unit, gradeOrLot] = rawLine.replace(/^\s+-\s+/, "").split("|").map(value => value.trim());
      if (name) current.materials.push({ name, ...(amount ? { amount } : {}), ...(unit ? { unit } : {}), ...(gradeOrLot ? { gradeOrLot } : {}) });
      if (gradeOrLot && /confirm|unknown|unspecified|tbd/i.test(gradeOrLot)) current.needsReview.push(`Confirm ${name}'s ${gradeOrLot}.`);
      continue;
    }
    current = { instruction: rawLine.trim(), materials: [], needsReview: [] };
    steps.push(current);
  }
  return steps;
}

function makeProtocol() {
  const files = selectedFiles();
  const kind = files.length ? (files.some(file => file.type.startsWith("image/")) ? "mixed" : "pdf") : "text";
  const steps = parseTextIntoSteps(elements.sourceText.value);
  if (!steps.length) throw new Error("Add at least one unindented protocol step, or use “Load demo source”.");
  const review = [];
  if (files.length) review.push("Demo note: confirm the extracted fields against the attached source before publishing.");
  return {
    title: elements.title.value.trim() || "Untitled protocol draft",
    summary: "Structured import draft. A Lab member must review all source-derived values before publication.",
    category: elements.category.value.trim() || "Uncategorized",
    tags: [],
    source: { kind, files: files.map(file => ({ name: file.name, reference: `browser-local/${file.name}` })), userInstruction: elements.instruction.value.trim() },
    steps,
    needsReview: review
  };
}

async function mcpRequest(body, sessionId) {
  const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
  if (sessionId) { headers["Mcp-Session-Id"] = sessionId; headers["MCP-Protocol-Version"] = protocolVersion; }
  const response = await fetch("/mcp", { method: "POST", headers, body: JSON.stringify(body) });
  const responseText = await response.text();
  let payload; try { payload = responseText ? JSON.parse(responseText) : {}; } catch { throw new Error(`Unexpected MCP response: ${responseText.slice(0, 120)}`); }
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `MCP request failed (${response.status})`);
  return { payload, sessionId: response.headers.get("mcp-session-id") || sessionId };
}

async function createThroughMcp(protocol) {
  const initialized = await mcpRequest({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion, capabilities: {}, clientInfo: { name: "LabRecord browser demo agent", version: "0.1.0" } } });
  const sessionId = initialized.sessionId;
  if (!sessionId) throw new Error("The MCP server did not return a session ID.");
  await mcpRequest({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }, sessionId);
  const created = await mcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "create_protocol_draft", arguments: { protocol, importNote: "Created by the local browser demo through MCP." } } }, sessionId);
  const text = created.payload.result?.content?.find(item => item.type === "text")?.text;
  if (!text) throw new Error("The MCP tool returned no result.");
  const result = JSON.parse(text);
  if (!result.created) throw new Error(result.validationErrors?.map(item => `${item.path}: ${item.message}`).join("; ") || "The protocol failed validation.");
  return result.draft;
}

function setStatus(message, type = "") { elements.status.textContent = message; elements.status.className = `status ${type}`; }
async function handleImport() {
  try {
    const protocol = makeProtocol();
    elements.import.disabled = true; setStatus("Agent is calling create_protocol_draft through MCP…");
    const draft = await createThroughMcp(protocol);
    setStatus(`Draft created: ${draft.title}. It is awaiting human review.`, "success");
    await loadDrafts();
  } catch (error) { setStatus(error.message, "error"); }
  finally { elements.import.disabled = false; }
}

function cardFor(draft) {
  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector(".protocol-card"); card.id = draft.id;
  const state = card.querySelector(".state"); state.textContent = draft.status; state.classList.toggle("published", draft.status === "published");
  card.querySelector(".category").textContent = draft.protocol.category;
  card.querySelector("time").textContent = new Date(draft.createdAt).toLocaleString();
  card.querySelector("h3").textContent = draft.protocol.title;
  card.querySelector(".summary").textContent = draft.protocol.summary || "No summary supplied.";
  const reviewCount = draft.protocol.needsReview.length + draft.protocol.steps.reduce((count, step) => count + step.needsReview.length, 0);
  card.querySelector(".protocol-stats").innerHTML = `<span>${draft.protocol.steps.length} steps</span><span>${reviewCount} review flags</span>`;
  const steps = card.querySelector(".steps");
  for (const step of draft.protocol.steps) {
    const item = document.createElement("li"); item.textContent = step.instruction;
    for (const material of step.materials) { const info = document.createElement("span"); info.className = "material"; info.textContent = `↳ ${material.name}${material.amount ? ` · ${material.amount}` : ""}${material.unit ? ` ${material.unit}` : ""}${material.gradeOrLot ? ` · ${material.gradeOrLot}` : ""}`; item.append(info); }
    steps.append(item);
  }
  return fragment;
}
async function loadDrafts() {
  const response = await fetch("/api/drafts"); if (!response.ok) throw new Error("Could not load saved drafts.");
  const { drafts } = await response.json(); elements.list.replaceChildren(...drafts.map(cardFor)); elements.empty.hidden = drafts.length > 0;
}
function loadSample() {
  elements.title.value = "Chemical transformation of DH5α competent cells";
  elements.category.value = "Molecular biology";
  elements.instruction.value = "Import this vendor protocol as a review draft for Wang Lab. Flag any condition that cannot be confirmed.";
  elements.sourceText.value = "Thaw competent cells on ice\n  - DH5α competent cells | 50 | µL | lot to confirm\nAdd plasmid DNA and mix gently\n  - Plasmid DNA | 1 | ng | concentration to confirm\nRecover transformed cells before plating";
  setStatus("Demo source loaded. Click “Create review draft via MCP”.");
}
elements.files.addEventListener("change", renderFiles); elements.import.addEventListener("click", handleImport); elements.refresh.addEventListener("click", () => loadDrafts().catch(error => setStatus(error.message, "error"))); elements.sample.addEventListener("click", loadSample);
loadDrafts().catch(error => setStatus(error.message, "error"));
