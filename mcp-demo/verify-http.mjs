// End-to-end proof of the REMOTE HTTP MCP endpoint. Spawns the website, then drives
// /mcp through a real Streamable-HTTP MCP client exactly like a remote user's agent
// would (URL + Bearer token). Run: npm run verify:http
import { spawn } from "node:child_process";
import { once } from "node:events";
import { rm } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4124; // isolated test port
const BASE = `http://127.0.0.1:${PORT}`;
const MCP_URL = new URL(`${BASE}/mcp`);
const LABS = { verify_wang_token: { id: "wang-lab", name: "Wang Lab" }, verify_lee_token: { id: "lee-lab", name: "Lee Lab" } };
const TOKEN = "verify_wang_token";
const STORE = path.join(here, "data", ".verify-http-store.json");

let allOk = true;
const check = (condition, label) => {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}`);
  if (!condition) allOk = false;
};
const parse = (result) => JSON.parse(result.content?.find((part) => part.type === "text")?.text ?? "{}");

const sample = {
  title: "Heat-shock transformation of DH5α competent E. coli",
  summary: "Imported over the remote MCP endpoint for verification. Heat-shock time needs confirmation.",
  category: "Molecular biology",
  tags: ["transformation", "DH5α"],
  source: { kind: "pdf", files: [{ name: "transformation.pdf", reference: "verify", pages: [1] }], userInstruction: "Import as a review draft." },
  steps: [
    { instruction: "Thaw competent cells on ice.", duration: "10 min", materials: [{ name: "DH5α competent cells", amount: "50", unit: "µL" }], needsReview: [] },
    { instruction: "Heat shock at 42 C.", temperature: "42 °C", materials: [], needsReview: ["Confirm heat-shock time (30 s vs 45 s by lot)."] }
  ],
  needsReview: ["Confirm SOC recovery volume and shaking time."]
};

await rm(STORE, { force: true });
const website = spawn(process.execPath, [path.join(here, "website.mjs")], {
  env: {
    ...process.env,
    PORT: String(PORT),
    LABRECORD_STORE: STORE,
    LABRECORD_LABS_JSON: JSON.stringify(LABS),
    MCP_ALLOWED_HOSTS: `127.0.0.1:${PORT}`
  },
  stdio: ["ignore", "pipe", "pipe"]
});
website.stderr.on("data", (chunk) => process.stderr.write(`[website] ${chunk}`));

let ready = false;
for (let i = 0; i < 40; i += 1) {
  try {
    if ((await fetch(`${BASE}/api/schema`)).ok) {
      ready = true;
      break;
    }
  } catch {
    /* not up yet */
  }
  await delay(300);
}
check(ready, "website is listening");

// 1) A tokenless connect must be rejected.
let unauthorizedRejected = false;
try {
  const noAuth = new StreamableHTTPClientTransport(MCP_URL);
  const client = new Client({ name: "verify-noauth", version: "1.0.0" });
  await client.connect(noAuth);
  await client.close();
} catch {
  unauthorizedRejected = true;
}
check(unauthorizedRejected, "MCP connect WITHOUT a token is rejected (401)");

// 2) Authorized flow over HTTP.
const transport = new StreamableHTTPClientTransport(MCP_URL, { requestInit: { headers: { Authorization: `Bearer ${TOKEN}` } } });
const client = new Client({ name: "verify-http", version: "1.0.0" });
try {
  await client.connect(transport);

  const tools = (await client.listTools()).tools.map((tool) => tool.name).sort();
  check(tools.join(",") === "create_protocol,get_import_schema,list_protocols,publish_protocol", `remote MCP exposes the 4 tools (${tools.join(", ")})`);

  const schema = parse(await client.callTool({ name: "get_import_schema", arguments: {} }));
  check(Array.isArray(schema.rules) && schema.rules.length > 0, "get_import_schema returns rules over HTTP");

  const created = parse(await client.callTool({ name: "create_protocol", arguments: { protocol: sample, importNote: "verify-http" } }));
  check(created.created === true && created.protocol?.status === "draft", "create_protocol wrote a draft over HTTP");
  const newId = created.protocol?.id;

  const list = parse(await client.callTool({ name: "list_protocols", arguments: {} }));
  check(Array.isArray(list.protocols) && list.protocols.some((item) => item.id === newId), "created draft appears in list_protocols");

  const otherLab = await (await fetch(`${BASE}/api/protocols?lab=lee-lab`)).json();
  check(!otherLab.protocols.some((item) => item.id === newId), "Wang Lab draft NOT visible to Lee Lab (isolation)");
} catch (error) {
  check(false, `unexpected exception: ${error.message}`);
} finally {
  website.stderr.removeAllListeners("data");
  try {
    await client.close();
  } catch {
    /* ignore */
  }
  if (website.exitCode === null) {
    website.kill();
    await once(website, "close").catch(() => {});
  }
  await rm(STORE, { force: true }).catch(() => {});
}

console.log(allOk ? "\n✅ ALL HTTP CHECKS PASSED — the remote MCP endpoint works end to end." : "\n❌ SOME HTTP CHECKS FAILED.");
process.exitCode = allOk ? 0 : 1;
