// LabRecord Protocol MCP server (stdio transport).
// A thin adapter over the website REST API. The agent's client launches this
// process; it talks MCP over stdin/stdout and calls the website over HTTP.
//
// IMPORTANT: never write to stdout except through the transport. Diagnostics go to stderr.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API = process.env.LABRECORD_API ?? "http://127.0.0.1:4100";
const TOKEN = process.env.LABRECORD_TOKEN;
if (!TOKEN) throw new Error("LABRECORD_TOKEN is required for the stdio MCP adapter.");

async function api(pathname, options = {}) {
  try {
    const response = await fetch(`${API}${pathname}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        ...(options.headers ?? {})
      }
    });
    const raw = await response.text();
    let body;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = { raw };
    }
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    return { ok: false, status: 0, body: { error: `Cannot reach LabRecord API at ${API}. Is the website running? (${error.message})` } };
  }
}

function toolText(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

const server = new McpServer(
  { name: "labrecord-protocol", version: "1.0.0" },
  {
    instructions:
      "Import lab protocols into LabRecord as reviewable drafts. Call get_import_schema first, then create_protocol with the source transcribed into structured steps and materials. Never invent quantities, temperatures, timings, or lot numbers — put anything uncertain or missing into needsReview. Never publish without explicit human approval."
  }
);

server.registerTool(
  "get_import_schema",
  {
    title: "Get LabRecord import schema",
    description: "Return the required protocol draft structure and import rules. Call this before create_protocol."
  },
  async () => {
    const result = await api("/api/schema");
    return toolText(result.body);
  }
);

server.registerTool(
  "create_protocol",
  {
    title: "Create a protocol draft",
    description:
      "Create a validated, review-pending protocol draft in the current lab. Transcribe the source (PDF, image, or notes) into structured steps and materials; put uncertain facts in needsReview. This tool cannot publish.",
    inputSchema: {
      protocol: z.unknown().describe("A protocol draft object matching the shape returned by get_import_schema."),
      importNote: z.string().max(1000).optional().describe("Short note describing this import request.")
    }
  },
  async ({ protocol, importNote }) => {
    const result = await api("/api/protocols", { method: "POST", body: JSON.stringify({ protocol, importNote }) });
    if (result.status === 401) return toolText({ created: false, error: "Unauthorized: the API token is missing or invalid." });
    if (!result.ok || result.body.created === false) {
      return toolText({ created: false, validationErrors: result.body.validationErrors ?? result.body.error ?? `HTTP ${result.status}` });
    }
    return toolText({ created: true, protocol: result.body.protocol, reviewUrl: result.body.reviewUrl });
  }
);

server.registerTool(
  "list_protocols",
  {
    title: "List protocols",
    description: "List the current lab's protocol drafts and published protocols."
  },
  async () => {
    const result = await api("/api/me/protocols");
    if (result.status === 401) return toolText({ error: "Unauthorized: the API token is missing or invalid." });
    return toolText(result.body);
  }
);

server.registerTool(
  "publish_protocol",
  {
    title: "Publish a reviewed protocol",
    description: "Mark one existing draft as published AFTER a human has reviewed it. Do not call without explicit user approval.",
    inputSchema: {
      protocolId: z.string().min(1).describe("The id returned by create_protocol or list_protocols."),
      reviewerConfirmation: z.literal(true).describe("Must be true, and only after a human reviewed the draft.")
    }
  },
  async ({ protocolId }) => {
    const result = await api(`/api/protocols/${encodeURIComponent(protocolId)}/publish`, { method: "POST", body: "{}" });
    if (!result.ok) return toolText({ published: false, error: result.body.error ?? `HTTP ${result.status}` });
    return toolText(result.body);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[labrecord-mcp] ready. API=${API}`);
