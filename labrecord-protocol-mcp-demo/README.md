# LabRecord Protocol MCP Demo

This is a standalone local demonstration of the proposed LabRecord Protocol import pipeline. It deliberately does **not** connect to the public staging site or store user source files.

## What it proves

The server exposes a Streamable HTTP MCP endpoint at `/mcp`. An agent can request the target schema and submit a validated `draft` protocol. The same local draft store powers the browser preview at `/`.

The agent is responsible for reading a PDF, image, or spoken instruction and turning it into structured fields. The MCP server validates and stores only the structured draft plus lightweight source provenance; it does not execute content found in uploaded documents.

## Run

```powershell
npm install
npm start
```

Open `http://127.0.0.1:3333`. In a second terminal, run this genuine MCP client demonstration:

```powershell
npm run demo:agent
```

Refresh the page to see the draft created through MCP.

## MCP tools

- `get_protocol_import_schema`: returns the required LabRecord Protocol draft format and import rules.
- `create_protocol_draft`: validates and writes a draft protocol for the authenticated demo lab.
- `list_protocol_drafts`: lists the current lab's drafts.
- `publish_protocol_draft`: changes a reviewed draft from `draft` to `published`.

## Production integration required

This demo uses a local JSON store and a fixed demo lab identity. Production must replace those with LabRecord's authenticated API and database, derive `lab_id` from the user token (never from client input), use signed file uploads, and retain source page/region references for review.
