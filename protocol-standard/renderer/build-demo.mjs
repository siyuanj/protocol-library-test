/*
 * Bundles the renderer, styles, canonical schema, and all example JSON into a single
 * self-contained demo.html (opens from file:// or over HTTP). Single source of truth:
 * edit the JSON / renderer.js / styles.css, then re-run `node renderer/build-demo.mjs`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const css = readFileSync(join(__dirname, "styles.css"), "utf8");
const rendererJs = readFileSync(join(__dirname, "renderer.js"), "utf8");
const schemaObj = JSON.parse(readFileSync(join(root, "canonical-schema.json"), "utf8"));

const list = [
  { id: "western-blot", label: "Western Blot", group: "Section 1 examples" },
  { id: "qpcr", label: "RT-qPCR (MIQE)", group: "Section 1 examples" },
  { id: "cell-culture", label: "Cell Culture (subculture)", group: "Section 1 examples" },
  { id: "gel-filtration", label: "Gel Filtration", group: "Real PDF test data" },
  { id: "protein-concentration", label: "Protein Concentration", group: "Real PDF test data" },
  { id: "elisa-sandwich", label: "Sandwich ELISA (tables/plate)", group: "Test set (v0.2)", sub: "test-set" },
  { id: "standard-pcr", label: "Standard PCR (samples)", group: "Test set (v0.2)", sub: "test-set" },
  { id: "rnaseq-pipeline", label: "RNA-seq pipeline (computational)", group: "v0.3 cross-discipline", sub: "v03-demos" },
  { id: "organic-synthesis", label: "Organic synthesis (chemistry)", group: "v0.3 cross-discipline", sub: "v03-demos" },
  { id: "pk-animal-study", label: "PK animal study (in-vivo)", group: "v0.3 cross-discipline", sub: "v03-demos" },
  { id: "patch-clamp", label: "Patch-clamp (physics)", group: "v0.3 cross-discipline", sub: "v03-demos" },
];
const protocols = [];
for (const x of list) {
  const f = join(root, "examples", x.sub || "", x.id + ".json");
  try { protocols.push({ id: x.id, label: x.label, group: x.group, data: JSON.parse(readFileSync(f, "utf8")) }); }
  catch (e) { console.log("skip (not found yet): " + x.id); }
}

// embed safely inside <script>
const embed = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");
const schemaText = JSON.stringify(schemaObj, null, 2);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LabRecord Protocol Standard — Demo</title>
<style>
${css}
</style>
</head>
<body>
<div class="app">
  <aside class="side">
    <div class="brand">LabRecord<br><small>Protocol Standard &amp; Schema v0.1</small></div>
    <nav id="nav"></nav>
    <div class="side-foot">Each view is rendered live: <b>example JSON → renderer.js → this document</b>. No server needed.</div>
  </aside>
  <main class="main"><div id="view"></div></main>
</div>

<script>
${rendererJs}
</script>
<script>
const PROTOCOLS = ${embed(protocols)};
const SCHEMA_TEXT = ${embed(schemaText)};
const nav = document.getElementById('nav');
const view = document.getElementById('view');
function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

const groups = {};
PROTOCOLS.forEach((p,i)=>{ (groups[p.group]=groups[p.group]||[]).push(Object.assign({idx:i},p)); });
let navHtml='';
for(const g in groups){
  navHtml+='<h4>'+escapeHtml(g)+'</h4>';
  groups[g].forEach(p=>{ navHtml+='<button class="nav-item" data-idx="'+p.idx+'">'+escapeHtml(p.label)+'<small>'+escapeHtml((p.data.metadata.family||''))+'</small></button>'; });
}
navHtml+='<h4>Reference</h4>';
navHtml+='<button class="nav-item" data-view="schema">Canonical JSON Schema</button>';
navHtml+='<button class="nav-item" data-view="about">About this demo</button>';
nav.innerHTML=navHtml;

function showProtocol(idx){
  const p=PROTOCOLS[idx];
  const rendered=window.renderProtocolHTML(p.data);
  const json=JSON.stringify(p.data,null,2);
  view.innerHTML='<div class="doc-note">Rendered live from <code>examples/'+p.id+'.json</code> by <code>renderer.js</code> — the same JSON produces this human-readable document.</div>'
    +rendered
    +'<details class="jsonbox"><summary>Show JSON source ('+ (p.data.steps||[]).length +' steps)</summary><pre>'+escapeHtml(json)+'</pre></details>';
  window.scrollTo(0,0);
}
function showSchema(){ view.innerHTML='<h1>Canonical JSON Schema (v0.1)</h1><p class="doc-note">Every protocol is validated against this schema before it is saved. See <code>renderer/validate.mjs</code>.</p><pre class="schema-pre">'+escapeHtml(SCHEMA_TEXT)+'</pre>'; window.scrollTo(0,0); }
function showAbout(){
  view.innerHTML='<article class="protocol"><h1>About this demo</h1>'
    +'<p>This page demonstrates deliverables for <b>Sections 1 &amp; 2</b> of the Protocol Library plan:</p>'
    +'<ul>'
    +'<li><b>Section 1 — Format Standard:</b> a fixed section layout (Purpose, Scope, Before You Begin, Materials, Equipment, Procedure table, Controls, Expected Outputs, Troubleshooting, Safety, Sources &amp; License).</li>'
    +'<li><b>Section 2 — Canonical Schema + renderer:</b> a JSON Schema (<code>canonical-schema.json</code>), example JSON instances, and this JSON→document renderer (<code>renderer.js</code>).</li>'
    +'</ul>'
    +'<p><b>Section 1 examples:</b> Western blot (from a real teaching PDF), RT-qPCR (MIQE-aligned), cell-culture subculture.</p>'
    +'<p><b>Real PDF test data (generated):</b> Gel Filtration and Protein Concentration, transcribed from the source PDFs into the canonical format.</p>'
    +'<p>Orange <span class="review">needs review</span> marks values that were not stated in the source and must be human-verified — the schema forbids fabricating them.</p>'
    +'<p>The <code>provenance</code> block (library / owner / status) is a forward-compatible hook for the Library &amp; Version design (Section 3).</p>'
    +'</article>';
  window.scrollTo(0,0);
}
nav.addEventListener('click',function(e){
  const b=e.target.closest('.nav-item'); if(!b)return;
  Array.prototype.forEach.call(nav.querySelectorAll('.nav-item'),x=>x.classList.remove('active'));
  b.classList.add('active');
  if(b.dataset.view==='schema') showSchema();
  else if(b.dataset.view==='about') showAbout();
  else showProtocol(+b.dataset.idx);
});
nav.querySelector('.nav-item').click();
</script>
</body>
</html>`;

const out = join(__dirname, "demo.html");
writeFileSync(out, html, "utf8");
console.log("Wrote " + out + " (" + protocols.length + " protocols, " + html.length + " bytes)");
