// The "LabRecord website": a plain HTTP backend + browser UI.
// In production this is your real app; the MCP server (mcp-server.mjs) is a thin
// adapter that calls this same REST API. Swap the base URL and you are done.
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createInputSchema, schemaDescription } from "./schema.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, "data");
const storeFile = process.env.LABRECORD_STORE ?? path.join(dataDir, "protocols.json");
const port = Number(process.env.PORT ?? 4100);
const host = process.env.HOST ?? "127.0.0.1"; // set HOST=0.0.0.0 in a container / on a server

// Demo auth: API token -> lab. Keep the map out of source control by supplying
// LABRECORD_LABS_JSON, e.g. {"token":{"id":"wang-lab","name":"Wang Lab"}}.
// In production, derive identity from a real session/token and never trust a lab
// id supplied by the caller.
function readLabsFromEnvironment() {
  const raw = process.env.LABRECORD_LABS_JSON;
  if (!raw) throw new Error("LABRECORD_LABS_JSON must define the token-to-lab map.");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("LABRECORD_LABS_JSON must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("LABRECORD_LABS_JSON must be an object keyed by token.");
  }

  const labs = Object.fromEntries(
    Object.entries(parsed).map(([token, lab]) => {
      if (!token.trim() || !lab || typeof lab !== "object" || typeof lab.id !== "string" || typeof lab.name !== "string" || !lab.id.trim() || !lab.name.trim()) {
        throw new Error("Each LABRECORD_LABS_JSON entry needs a non-empty token, lab id, and lab name.");
      }
      return [token.trim(), { id: lab.id.trim(), name: lab.name.trim() }];
    })
  );

  if (!Object.keys(labs).length || new Set(Object.values(labs).map((lab) => lab.id)).size !== Object.keys(labs).length) {
    throw new Error("LABRECORD_LABS_JSON must contain at least one lab and unique lab ids.");
  }
  return labs;
}

function readAllowedHosts() {
  const hosts = (process.env.MCP_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
  if (!hosts.length) throw new Error("MCP_ALLOWED_HOSTS must list the allowed Host header value(s).");
  return hosts;
}

const LABS = readLabsFromEnvironment();
const LAB_BY_ID = Object.fromEntries(Object.values(LABS).map((lab) => [lab.id, lab]));
const TOKEN_BY_LAB = Object.fromEntries(Object.entries(LABS).map(([token, lab]) => [lab.id, token]));
const mcpAllowedHosts = readAllowedHosts();

async function readStore() {
  try {
    return JSON.parse(await readFile(storeFile, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function writeStore(items) {
  await mkdir(path.dirname(storeFile), { recursive: true });
  const tempFile = `${storeFile}.${randomUUID()}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  await rename(tempFile, storeFile);
}

function labFromToken(req) {
  const header = req.headers.authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? LABS[match[1].trim()] : undefined;
}

function reviewFlagCount(protocol) {
  return protocol.needsReview.length + protocol.steps.reduce((total, step) => total + step.needsReview.length, 0);
}

function toRecordView(record) {
  return {
    id: record.id,
    lab: LAB_BY_ID[record.labId] ?? { id: record.labId, name: record.labId },
    status: record.status,
    createdAt: record.createdAt,
    publishedAt: record.publishedAt ?? null,
    importNote: record.importNote ?? "",
    reviewFlags: reviewFlagCount(record.protocol),
    protocol: record.protocol
  };
}

// Shared store operations used by BOTH the REST API and the MCP tools, so the two
// can never drift. Each takes a server-derived labId (never client-supplied).
async function createDraft(labId, body) {
  const parsed = createInputSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, validationErrors: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) };
  }
  const record = {
    id: `protocol_${randomUUID()}`,
    labId,
    status: "draft",
    createdAt: new Date().toISOString(),
    importNote: parsed.data.importNote ?? "",
    protocol: parsed.data.protocol
  };
  const items = await readStore();
  items.unshift(record);
  await writeStore(items);
  return { ok: true, record };
}

async function listDrafts(labId) {
  return (await readStore()).filter((record) => record.labId === labId);
}

async function publishDraft(labId, id) {
  const items = await readStore();
  const record = items.find((candidate) => candidate.id === id && candidate.labId === labId);
  if (!record) return { ok: false, status: 404, error: "Protocol not found for this lab." };
  record.status = "published";
  record.publishedAt = new Date().toISOString();
  await writeStore(items);
  return { ok: true, record };
}

const SEED = [
  {
    id: "protocol_seed_wang_1",
    labId: "wang-lab",
    status: "published",
    createdAt: "2026-08-01T09:00:00.000Z",
    publishedAt: "2026-08-01T10:00:00.000Z",
    importNote: "Seed record for the demo library.",
    protocol: {
      title: "Bradford protein assay (microplate)",
      summary: "Standard colorimetric total-protein quantification against a BSA standard curve.",
      category: "Protein biochemistry",
      tags: ["assay", "protein", "Bradford"],
      source: { kind: "text", files: [], userInstruction: "Seed protocol." },
      steps: [
        {
          instruction: "Prepare BSA standards from 0 to 2000 µg/mL.",
          materials: [{ name: "BSA standard", amount: "2000", unit: "µg/mL" }],
          needsReview: []
        },
        {
          instruction: "Add 5 µL sample/standard and 250 µL Bradford reagent per well; incubate 5 min at room temperature.",
          duration: "5 min",
          materials: [{ name: "Bradford reagent", amount: "250", unit: "µL/well" }],
          needsReview: []
        },
        {
          instruction: "Read absorbance at 595 nm and fit the standard curve.",
          materials: [],
          needsReview: []
        }
      ],
      needsReview: []
    }
  }
];

const app = express();
app.set("trust proxy", true); // so req.protocol reflects X-Forwarded-Proto behind Cloud Run
app.use(express.json({ limit: "1mb" }));

// Import rules + target shape (open; the agent reads this first).
app.get("/api/schema", (_req, res) => res.json(schemaDescription()));

// Connection info for the "Connect your agent" panel: the lab's API token and a
// ready-to-paste setup command. In production this is shown only to a logged-in user.
app.get("/api/connect", (req, res) => {
  const labId = String(req.query.lab ?? "wang-lab");
  const lab = LAB_BY_ID[labId];
  const token = TOKEN_BY_LAB[labId];
  if (!lab || !token) return res.status(404).json({ error: "Unknown lab." });
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const mcpUrl = `${baseUrl}/mcp`;
  const command = `claude mcp add --transport http labrecord ${mcpUrl} --header "Authorization: Bearer ${token}"`;
  res.json({ lab, token, baseUrl, mcpUrl, command });
});

// Read-only listing for the browser UI. No auth in this demo so the page can render;
// production would scope reads to the authenticated user.
app.get("/api/protocols", async (req, res, next) => {
  try {
    const labId = String(req.query.lab ?? "wang-lab");
    const items = (await readStore()).filter((record) => record.labId === labId);
    res.json({ lab: LAB_BY_ID[labId] ?? { id: labId, name: labId }, protocols: items.map(toRecordView) });
  } catch (error) {
    next(error);
  }
});

// Authenticated listing for the current lab (used by the stdio MCP adapter).
app.get("/api/me/protocols", async (req, res, next) => {
  try {
    const lab = labFromToken(req);
    if (!lab) return res.status(401).json({ error: "Invalid or missing API token." });
    res.json({ lab, protocols: (await listDrafts(lab.id)).map(toRecordView) });
  } catch (error) {
    next(error);
  }
});

// Authenticated create. Lab is derived from the token, never from the body.
app.post("/api/protocols", async (req, res, next) => {
  try {
    const lab = labFromToken(req);
    if (!lab) return res.status(401).json({ created: false, error: "Invalid or missing API token." });
    const result = await createDraft(lab.id, req.body);
    if (!result.ok) return res.status(result.status).json({ created: false, validationErrors: result.validationErrors });
    res.status(201).json({ created: true, protocol: toRecordView(result.record), reviewUrl: `/?lab=${lab.id}#${result.record.id}` });
  } catch (error) {
    next(error);
  }
});

// Authenticated publish (human-in-the-loop gate).
app.post("/api/protocols/:id/publish", async (req, res, next) => {
  try {
    const lab = labFromToken(req);
    if (!lab) return res.status(401).json({ published: false, error: "Invalid or missing API token." });
    const result = await publishDraft(lab.id, req.params.id);
    if (!result.ok) return res.status(result.status).json({ published: false, error: result.error });
    res.json({ published: true, protocol: toRecordView(result.record) });
  } catch (error) {
    next(error);
  }
});

// ---- Native remote MCP endpoint (Streamable HTTP) ----
// A user's own agent (Claude Code, etc.) connects here by URL + token — no clone, no npm.
// The token identifies the lab; the model never sees it (it rides in the HTTP header).
const toolText = (payload) => ({ content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] });

function buildMcpServer(lab) {
  const server = new McpServer(
    { name: "labrecord-protocol", version: "1.0.0" },
    {
      instructions:
        "Import lab protocols into LabRecord as reviewable drafts. Call get_import_schema first, then create_protocol with the source transcribed into structured steps and materials. Never invent quantities, temperatures, timings, or lot numbers — put anything uncertain or missing into needsReview. Never publish without explicit human approval."
    }
  );
  server.registerTool(
    "get_import_schema",
    { title: "Get LabRecord import schema", description: "Return the required protocol draft structure and import rules. Call this before create_protocol." },
    async () => toolText(schemaDescription())
  );
  server.registerTool(
    "create_protocol",
    {
      title: "Create a protocol draft",
      description:
        "Create a validated, review-pending protocol draft in your lab. Transcribe the source (PDF, image, or notes) into structured steps and materials; put uncertain facts in needsReview. This tool cannot publish.",
      inputSchema: {
        protocol: z.unknown().describe("A protocol draft object matching the shape from get_import_schema."),
        importNote: z.string().max(1000).optional().describe("Short note describing this import request.")
      }
    },
    async ({ protocol, importNote }) => {
      const result = await createDraft(lab.id, { protocol, importNote });
      if (!result.ok) return toolText({ created: false, validationErrors: result.validationErrors });
      return toolText({ created: true, protocol: toRecordView(result.record) });
    }
  );
  server.registerTool(
    "list_protocols",
    { title: "List protocols", description: "List your lab's protocol drafts and published protocols." },
    async () => toolText({ lab, protocols: (await listDrafts(lab.id)).map(toRecordView) })
  );
  server.registerTool(
    "publish_protocol",
    {
      title: "Publish a reviewed protocol",
      description: "Mark one existing draft as published AFTER a human has reviewed it. Do not call without explicit user approval.",
      inputSchema: {
        protocolId: z.string().min(1).describe("The id from create_protocol or list_protocols."),
        reviewerConfirmation: z.literal(true).describe("Must be true, and only after a human reviewed the draft.")
      }
    },
    async ({ protocolId }) => {
      const result = await publishDraft(lab.id, protocolId);
      if (!result.ok) return toolText({ published: false, error: result.error });
      return toolText({ published: true, protocol: toRecordView(result.record) });
    }
  );
  return server;
}

const mcpTransports = new Map();

app.post("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"];
    let transport = sessionId ? mcpTransports.get(sessionId) : undefined;
    if (!transport && !sessionId && isInitializeRequest(req.body)) {
      const lab = labFromToken(req);
      if (!lab) {
        return res
          .status(401)
          .json({ jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized: send 'Authorization: Bearer <LabRecord token>'." }, id: req.body?.id ?? null });
      }
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
        enableDnsRebindingProtection: true,
        allowedHosts: mcpAllowedHosts,
        onsessioninitialized: (id) => mcpTransports.set(id, transport)
      });
      transport.onclose = () => {
        if (transport.sessionId) mcpTransports.delete(transport.sessionId);
      };
      await buildMcpServer(lab).connect(transport);
    }
    if (!transport) {
      return res.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "No valid MCP session. Send an initialize request first." }, id: null });
    }
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed:", error);
    if (!res.headersSent) res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
  }
});

async function mcpSessionRequest(req, res) {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessionId ? mcpTransports.get(sessionId) : undefined;
  if (!transport) return res.status(400).send("No valid MCP session.");
  await transport.handleRequest(req, res);
}
app.get("/mcp", mcpSessionRequest);
app.delete("/mcp", mcpSessionRequest);

app.use(express.static(path.join(here, "public")));

// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  console.error("Website error:", error);
  if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
});

const items = await readStore();
if (items.length === 0) await writeStore(SEED);

app.listen(port, host, () => {
  console.log(`LabRecord website:  http://${host}:${port}`);
  console.log(`REST API base:      http://${host}:${port}/api`);
});
