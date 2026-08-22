// Self-contained end-to-end proof. Spawns the website, then drives the stdio MCP
// server through a REAL MCP client exactly like a live agent would.
// Run: npm run verify   (nothing else needs to be running)
import { spawn } from "node:child_process";
import { once } from "node:events";
import { rm } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4123; // isolated test port
const API = `http://127.0.0.1:${PORT}`;
const LABS = { verify_wang_token: { id: "wang-lab", name: "Wang Lab" }, verify_lee_token: { id: "lee-lab", name: "Lee Lab" } };
const TOKEN = "verify_wang_token";
const STORE = path.join(here, "data", ".verify-store.json"); // isolated test store, never the demo library

let allOk = true;
const check = (condition, label) => {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}`);
  if (!condition) allOk = false;
};
const parse = (result) => JSON.parse(result.content?.find((part) => part.type === "text")?.text ?? "{}");

const sample = {
  title: "Heat-shock transformation of DH5α competent E. coli",
  summary: "Imported from a vendor insert for verification. Heat-shock time and DNA amount need confirmation.",
  category: "Molecular biology",
  tags: ["transformation", "DH5α"],
  source: { kind: "pdf", files: [{ name: "transformation.pdf", reference: "verify-file", pages: [1] }], userInstruction: "Import as a review draft." },
  steps: [
    { instruction: "Thaw competent cells on ice.", duration: "10 min", materials: [{ name: "DH5α competent cells", amount: "50", unit: "µL", sourceReference: "p.1" }], needsReview: [] },
    {
      instruction: "Add plasmid DNA and heat shock at 42 C.",
      temperature: "42 °C",
      materials: [{ name: "Plasmid DNA", amount: "1-5", unit: "µL", sourceReference: "p.1" }],
      needsReview: ["Confirm exact DNA amount (source gives a 1-5 µL range).", "Confirm heat-shock time (30 s vs 45 s by lot)."]
    }
  ],
  needsReview: ["Confirm SOC recovery volume and shaking time against the source."]
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
    const response = await fetch(`${API}/api/schema`);
    if (response.ok) {
      ready = true;
      break;
    }
  } catch {
    /* not up yet */
  }
  await delay(300);
}
check(ready, "website is listening");

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(here, "mcp-server.mjs")],
  env: { ...process.env, LABRECORD_API: API, LABRECORD_TOKEN: TOKEN }
});
const client = new Client({ name: "verify-agent", version: "1.0.0" });

try {
  await client.connect(transport);

  const tools = (await client.listTools()).tools.map((tool) => tool.name).sort();
  check(
    tools.join(",") === "create_protocol,get_import_schema,list_protocols,publish_protocol",
    `MCP exposes the 4 tools (${tools.join(", ")})`
  );

  const schema = parse(await client.callTool({ name: "get_import_schema", arguments: {} }));
  check(Array.isArray(schema.rules) && schema.rules.length > 0, "get_import_schema returns import rules");

  const created = parse(await client.callTool({ name: "create_protocol", arguments: { protocol: sample, importNote: "verify.mjs" } }));
  check(created.created === true, "create_protocol wrote a draft");
  check(created.protocol?.status === "draft", "new protocol status is 'draft' (not auto-published)");
  check(created.protocol?.reviewFlags === 3, `review flags preserved (${created.protocol?.reviewFlags} expected 3)`);
  const newId = created.protocol?.id;

  const rejected = parse(
    await client.callTool({ name: "create_protocol", arguments: { protocol: { title: "x", category: "y", source: { kind: "text" }, steps: [] } } })
  );
  check(rejected.created === false, "invalid protocol (no steps) is rejected by validation");

  const list = parse(await client.callTool({ name: "list_protocols", arguments: {} }));
  check(Array.isArray(list.protocols) && list.protocols.some((item) => item.id === newId), "created draft appears in list_protocols");

  const otherLab = await (await fetch(`${API}/api/protocols?lab=lee-lab`)).json();
  check(!otherLab.protocols.some((item) => item.id === newId), "Wang Lab draft is NOT visible to Lee Lab (data isolation)");

  const published = parse(await client.callTool({ name: "publish_protocol", arguments: { protocolId: newId, reviewerConfirmation: true } }));
  check(published.published === true && published.protocol?.status === "published", "publish_protocol promotes draft to published");
} catch (error) {
  check(false, `unexpected exception: ${error.message}`);
} finally {
  // Graceful teardown: avoids a libuv handle-close assertion on Windows when
  // process.exit races with child-process pipe shutdown.
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

console.log(allOk ? "\n✅ ALL CHECKS PASSED — the MCP import flow works end to end." : "\n❌ SOME CHECKS FAILED.");
process.exitCode = allOk ? 0 : 1;
