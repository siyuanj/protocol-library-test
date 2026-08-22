/*
 * Builds design-options.html: the SAME protocol JSON shown in four front-end designs
 * (Document / Checklist / Timeline / Compact), with a protocol picker + design switcher.
 * For design review with the mentor. Re-run after editing variants.js / variants.css / JSON.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const css = readFileSync(join(__dirname, "styles.css"), "utf8");
const vcss = readFileSync(join(__dirname, "variants.css"), "utf8");
const rendererJs = readFileSync(join(__dirname, "renderer.js"), "utf8");
const variantsJs = readFileSync(join(__dirname, "variants.js"), "utf8");

const list = [
  { id: "western-blot", label: "Western Blot" },
  { id: "qpcr", label: "RT-qPCR (MIQE)" },
  { id: "cell-culture", label: "Cell Culture" },
  { id: "gel-filtration", label: "Gel Filtration" },
  { id: "protein-concentration", label: "Protein Concentration" },
];
const protocols = list.map((x) => ({ id: x.id, label: x.label, data: JSON.parse(readFileSync(join(root, "examples", x.id + ".json"), "utf8")) }));
const embed = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

const designs = [
  { key: "document", label: "Document", hint: "Journal-article layout with tables — closest to Nature Protocols / Bio-protocol. Best for reading & publishing." },
  { key: "checklist", label: "Checklist / Run", hint: "Tickable step cards for use at the bench — like protocols.io run mode. Best for executing a protocol." },
  { key: "timeline", label: "Timeline", hint: "Vertical stepper grouped by phase. Best for grasping flow & structure at a glance." },
  { key: "compact", label: "Compact / Print", hint: "Two-column reference: materials sidebar + dense numbered steps. Best for printing / quick reference." },
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LabRecord — Protocol Front-End Design Options</title>
<style>
${css}
${vcss}
body { background: #f6f7f9; }
</style>
</head>
<body>
<div class="vtoolbar">
  <div class="grp"><strong style="color:#2f6f8f">LabRecord</strong><span style="color:#5b6b7b;font-size:13px">Front-end design options</span></div>
  <div class="grp"><label for="psel">Protocol</label>
    <select id="psel">${protocols.map((p, i) => `<option value="${i}">${p.label}</option>`).join("")}</select>
  </div>
  <div class="grp"><label>Design</label>
    <span class="vseg" id="seg">${designs.map((d, i) => `<button data-key="${d.key}"${i === 0 ? ' class="active"' : ""}>${d.label}</button>`).join("")}</span>
  </div>
</div>
<div class="vwrap">
  <p class="vhint" id="hint"></p>
  <div id="view"></div>
</div>

<script>
${rendererJs}
</script>
<script>
${variantsJs}
</script>
<script>
const PROTOCOLS = ${embed(protocols)};
const DESIGNS = ${embed(designs)};
let curP = 0, curD = "document";
const view = document.getElementById('view');
const hint = document.getElementById('hint');
function draw(){
  const p = PROTOCOLS[curP].data;
  view.innerHTML = window.renderVariant(p, curD);
  const d = DESIGNS.find(x=>x.key===curD);
  hint.textContent = d ? d.hint : "";
}
document.getElementById('psel').addEventListener('change', e=>{ curP=+e.target.value; draw(); });
document.getElementById('seg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b)return;
  Array.prototype.forEach.call(document.querySelectorAll('#seg button'),x=>x.classList.remove('active'));
  b.classList.add('active'); curD=b.dataset.key; draw();
});
draw();
</script>
</body>
</html>`;

const out = join(__dirname, "design-options.html");
writeFileSync(out, html, "utf8");
console.log("Wrote " + out + " (" + protocols.length + " protocols x " + designs.length + " designs, " + html.length + " bytes)");
