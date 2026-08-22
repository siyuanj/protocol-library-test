# Deploying the demo

## What deploys where

- **`website.mjs`** (backend + REST API + library page) → a real server. This is the part
  that gets a public URL.
- **`mcp-server.mjs`** (stdio MCP adapter) → **runs on each user's own machine**, launched by
  their agent client. It is not "hosted"; it just needs to reach the website's API. Point it at
  the deployed URL with `LABRECORD_API`.

GitHub stores the code (and is how other machines get it). It does **not** run the server.

## Option A — test on another computer, no server needed

On the other machine:

```bash
git clone <your-repo-url> labrecord-mcp-demo
cd labrecord-mcp-demo
npm install
cp labrecord.env.example labrecord.env
# Edit labrecord.env with the token map, then:
npm run start:local           # website on http://127.0.0.1:4100
```

Then register the MCP server (uses that machine's local website):

```bash
claude mcp add labrecord --env LABRECORD_TOKEN=<lab-token> -- node "<abs-path>/mcp-server.mjs"
```

Everything runs locally on that machine — fully proves the flow, nothing shared.

## Option B — one shared, always-on server (Google Cloud Run)

Matches your existing staging infra. From inside `mcp-demo/` with `gcloud` installed:

Supply `LABRECORD_LABS_JSON` from a secret/environment configuration and set
`MCP_ALLOWED_HOSTS` to the final public hostname before starting the service. For example,
the relevant Cloud Run variables are `HOST=0.0.0.0`,
`MCP_ALLOWED_HOSTS=labrecord.example.com`, and the secret `LABRECORD_LABS_JSON`.

```bash
gcloud run deploy labrecord-mcp-demo --source . --region us-west1 --allow-unauthenticated --max-instances 1 --set-env-vars HOST=0.0.0.0,MCP_ALLOWED_HOSTS=labrecord.example.com
```

Cloud Run injects `PORT`; the Dockerfile already binds `0.0.0.0`. `--max-instances 1` keeps the
demo's JSON store on one instance so reads stay consistent. You get a URL like
`https://labrecord-mcp-demo-xxxx-uw.a.run.app`.

Then each user connects their own agent **by URL — no clone, no install** (the page's
"Connect your agent" panel prints this with the deployed URL already filled in):

```bash
claude mcp add --transport http labrecord https://<your-cloud-run-url>/mcp --header "Authorization: Bearer <lab-token>"
```

### Why not an A100 / HPC node
This app uses no GPU, and cluster compute nodes normally have no public inbound network (they
sit behind login nodes / VPN), so they can't serve a public URL. Use Cloud Run (or any small VM).

## Before this is more than a demo

- **Persistence:** Cloud Run's container filesystem is ephemeral — the JSON store resets on
  redeploy/scale. Replace `data/protocols.json` with a real database.
- **`/api/connect` exposes the token** so the page can show it. That's fine for a demo but in
  production it must be gated behind login and issue a real per-user, revocable token.
- **Wrap the real backend:** eventually `mcp-server.mjs` should call the real LabRecord API, and
  `website.mjs` goes away. Only `LABRECORD_API` + the token check change; the MCP tools stay.
- **Remote MCP is built in:** the website serves a Streamable-HTTP MCP endpoint at `/mcp`, so a
  user connects with the deployed URL directly — no clone. For a fixed production domain, set the
  transport's `allowedHosts` (DNS-rebinding protection) instead of leaving it disabled.
