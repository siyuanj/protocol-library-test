import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import * as z from "zod/v4";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createProtocolInputSchema, protocolDraftSchema, publicSchemaDescription } from "./protocol-schema.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(here, "data");
const draftFile = path.join(dataDirectory, "protocol-drafts.json");
const demoLab = { id: "demo-wang-lab", name: "Wang Lab (Demo)" };
const transports = new Map();

async function readDrafts() {
  try {
    return JSON.parse(await readFile(draftFile, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function writeDrafts(drafts) {
  await mkdir(dataDirectory, { recursive: true });
  const tempFile = `${draftFile}.${randomUUID()}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(drafts, null, 2)}\n`, "utf8");
  await rename(tempFile, draftFile);
}

function summarize(draft) {
  return {
    id: draft.id,
    lab: demoLab,
    title: draft.protocol.title,
    category: draft.protocol.category,
    stepCount: draft.protocol.steps.length,
    status: draft.status,
    createdAt: draft.createdAt,
    needsReview: draft.protocol.needsReview.length + draft.protocol.steps.reduce((total, step) => total + step.needsReview.length, 0)
  };
}

async function createDraft(input) {
  const parsed = createProtocolInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) };
  }
  const drafts = await readDrafts();
  const draft = {
    id: `protocol_${randomUUID()}`,
    labId: demoLab.id,
    status: "draft",
    createdAt: new Date().toISOString(),
    importNote: parsed.data.importNote ?? "",
    protocol: parsed.data.protocol
  };
  drafts.unshift(draft);
  await writeDrafts(drafts);
  return { ok: true, draft };
}

function toolText(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

function createMcpServer() {
  const server = new McpServer(
    { name: "labrecord-protocol-import", version: "0.1.0" },
    { instructions: "Create reviewable LabRecord protocol drafts only. Never invent experimental conditions and never publish automatically." }
  );

  server.registerTool("get_protocol_import_schema", {
    title: "Get LabRecord Protocol Import Schema",
    description: "Get the target JSON shape and safety rules before converting PDF, image, text, or voice input into a LabRecord protocol draft."
  }, async () => toolText(publicSchemaDescription()));

  server.registerTool("create_protocol_draft", {
    title: "Create LabRecord Protocol Draft",
    description: "Create a validated review draft in the current Lab. The agent must transcribe source material into structured steps and materials; unknown facts must go in needsReview. This tool cannot publish.",
    inputSchema: {
      protocol: z.unknown().describe("A LabRecord protocol draft matching the structure returned by get_protocol_import_schema."),
      importNote: z.string().max(1000).optional().describe("Short note describing the import request or intended use.")
    }
  }, async (input) => {
    const result = await createDraft(input);
    if (!result.ok) return toolText({ created: false, validationErrors: result.errors });
    return toolText({ created: true, draft: summarize(result.draft), reviewUrl: `http://127.0.0.1:${port}/#${result.draft.id}` });
  });

  server.registerTool("list_protocol_drafts", {
    title: "List LabRecord Protocol Drafts",
    description: "List drafts and published protocols visible to the current Lab."
  }, async () => {
    const drafts = (await readDrafts()).filter(draft => draft.labId === demoLab.id);
    return toolText({ lab: demoLab, protocols: drafts.map(summarize) });
  });

  server.registerTool("publish_protocol_draft", {
    title: "Publish a Reviewed Protocol Draft",
    description: "Publish one existing draft after a human reviewer has confirmed its content. Do not call this without explicit user approval.",
    inputSchema: {
      protocolId: z.string().min(1).describe("The identifier returned by create_protocol_draft or list_protocol_drafts."),
      reviewerConfirmation: z.literal(true).describe("Must be true only after a Lab member has reviewed the source and draft.")
    }
  }, async ({ protocolId }) => {
    const drafts = await readDrafts();
    const draft = drafts.find(candidate => candidate.id === protocolId && candidate.labId === demoLab.id);
    if (!draft) return toolText({ published: false, error: "Protocol draft not found in the current Lab." });
    if (draft.status === "published") return toolText({ published: true, draft: summarize(draft), alreadyPublished: true });
    draft.status = "published";
    draft.publishedAt = new Date().toISOString();
    await writeDrafts(drafts);
    return toolText({ published: true, draft: summarize(draft) });
  });
  return server;
}

const app = createMcpExpressApp({ host: "127.0.0.1" });
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = new Set(["http://127.0.0.1:3333", "http://localhost:3333"]);
  if (origin && !allowedOrigins.has(origin)) return res.status(403).json({ error: "Untrusted origin" });
  next();
});

app.post("/mcp", async (req, res) => {
  try {
    const requestedSession = req.headers["mcp-session-id"];
    let transport = requestedSession ? transports.get(requestedSession) : undefined;
    if (!transport && !requestedSession && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
        onsessioninitialized: sessionId => transports.set(sessionId, transport)
      });
      transport.onclose = () => {
        if (transport.sessionId) transports.delete(transport.sessionId);
      };
      await createMcpServer().connect(transport);
    }
    if (!transport) {
      return res.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "Initialize a new MCP session first." }, id: null });
    }
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed", error);
    if (!res.headersSent) res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
  }
});

app.get("/mcp", (_req, res) => res.status(405).set("Allow", "POST").send("Method Not Allowed"));

app.get("/api/drafts", async (_req, res, next) => {
  try {
    const drafts = (await readDrafts()).filter(draft => draft.labId === demoLab.id);
    res.json({ lab: demoLab, drafts });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(here, "public")));

const port = Number(process.env.PORT ?? 3333);
app.listen(port, "127.0.0.1", () => {
  console.log(`LabRecord Protocol MCP demo: http://127.0.0.1:${port}`);
  console.log(`MCP endpoint: http://127.0.0.1:${port}/mcp`);
});
