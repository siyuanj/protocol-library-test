# LabRecord Protocol MCP Demo

Proves the full flow: **an AI agent reads a protocol (PDF / image / notes) and writes it
into a website through a standard MCP server** — as a review draft, with uncertain values
flagged, scoped to the caller's lab by an API token.

## Architecture

```
  A user's own agent (Claude Code / Claude Desktop)
        │  MCP over HTTP   (URL + "Authorization: Bearer <token>")
        ▼
  website.mjs  ──►  data/protocols.json   ("LabRecord": backend + REST API + /mcp endpoint)
        ▲
        │  browser reads /api/protocols
  public/index.html   (live library page + "Connect your agent" panel)
```

The website hosts the MCP endpoint natively at **`/mcp`**, so a remote user connects by URL —
no clone, no install, just one `claude mcp add` line. `mcp-server.mjs` is an optional **stdio**
adapter (identical tools) for local/offline use that calls the same REST API.

In production you replace **website.mjs** with the real LabRecord API and drop the local JSON
store. The tools do not change — only the base URL and the token check.

## Prove it works (no agent needed)

```bash
npm install
npm run verify        # stdio MCP path, end to end (10 checks)
npm run verify:http   # remote HTTP MCP path (incl. tokenless connect rejected)
```

Each spawns the website and drives the MCP server through a **real MCP client**, then checks:
4 tools exposed, schema returned, draft created as `draft`, review flags kept, invalid input
rejected, draft listed, **not visible to another lab**, and publish gated.

## Run the live demo

**1. Configure and start the website** (this is "LabRecord"). Copy the example
environment file, replace both placeholder values with long random tokens, and keep
the resulting `labrecord.env` out of source control:

```bash
cp labrecord.env.example labrecord.env
# Edit labrecord.env, then:
npm run start:local
```

Open `http://127.0.0.1:4100` — the library page auto-refreshes every 2 s.

**2. Connect your agent by URL.** Copy this from the page's "Connect your agent" panel
(it fills in the correct URL for wherever the site is hosted). For Claude Code:

```bash
claude mcp add --transport http labrecord http://127.0.0.1:4100/mcp --header "Authorization: Bearer <wang-lab-token>"
```

Then start a **new** Claude Code session so the tools load. (No clone or install needed — this
is why a remote user can connect straight from the deployed site.)

**3. In the agent, say:**

> Read `sample-protocol.md` and import it into LabRecord as a review draft. Flag anything you can't confirm.

The agent calls `get_import_schema` → `create_protocol`; the new **draft** pops into the web
page within ~2 s with its review flags. Approve it, then say "publish it" to see
`publish_protocol` promote it to **published**.

## Tokens = identity + data isolation

The server reads the token-to-lab map from `LABRECORD_LABS_JSON`; it must never be committed.
`MCP_ALLOWED_HOSTS` is also required and must list the public Host header values allowed to use
`/mcp` (comma-separated when there is more than one). The token is set once in the client config
and travels as an HTTP header. Switch the Lab dropdown in the UI to see that one lab cannot see
another lab's protocols.

## Tools

| Tool | Purpose |
|------|---------|
| `get_import_schema` | Return the required draft shape + rules (call first) |
| `create_protocol` | Validate and write a review **draft** (cannot publish) |
| `list_protocols` | List the current lab's protocols |
| `publish_protocol` | Promote a draft to published — human-approval gated |

## Not in this demo (the ask for the real backend)

- Real LabRecord write API, DB, and field names (swap `website.mjs`).
- Real auth: derive `lab_id` from a real session token, not a hard-coded map.
- File upload / OCR: here the agent transcribes; production wants signed uploads + page refs.
