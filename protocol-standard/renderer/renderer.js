/*
 * LabRecord canonical-protocol renderer (framework-agnostic), v0.1/v0.2/v0.3.
 * renderProtocolHTML(protocol) -> HTML string in the LabRecord Protocol Format layout.
 * Works in the browser (sets window.renderProtocolHTML) and Node (module.exports).
 * Pure function: no DOM, no network. Input must conform to canonical-schema.json.
 */
(function (global) {
  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function reviewMark(n) { return n ? ' <span class="review" title="Needs human review">needs review</span>' : ""; }

  function fmtParam(p) {
    var text = p.rawText;
    if (!text) {
      if (p.valueText) text = p.valueText;
      else if (p.value !== null && p.value !== undefined) {
        var pre = p.comparator === "min" ? "≥ " : p.comparator === "max" ? "≤ " : p.comparator === "approx" ? "~ " : "";
        text = pre + p.value;
        if (p.valueMax !== null && p.valueMax !== undefined && p.valueMax !== p.value) text += "–" + p.valueMax;
        if (p.unit) text += " " + p.unit;
        if (p.perUnit) text += " /" + p.perUnit;
      } else text = p.unit || p.type || "";
    }
    var cls = "param" + (p.needsReview ? " param-review" : "");
    var f = p.formula ? ' <span class="param-formula" title="' + esc(p.formula) + '">ƒ</span>' : "";
    return '<span class="' + cls + '"><span class="param-type">' + esc(p.type) + "</span>" + esc(text) + f + "</span>";
  }
  function chip(name, cls) { return '<span class="chip' + (cls ? " " + cls : "") + '">' + esc(name) + "</span>"; }

  function renderProtocolHTML(protocol) {
    if (!protocol || !protocol.metadata) return '<article class="protocol"><p class="error">Invalid protocol object.</p></article>';
    var m = protocol.metadata;
    var matById = {}, eqById = {}, swById = {}, spById = {}, tblById = {};
    (protocol.materials || []).forEach(function (x) { matById[x.id] = x; });
    (protocol.equipment || []).forEach(function (x) { eqById[x.id] = x; });
    (protocol.software || []).forEach(function (x) { swById[x.id] = x; });
    (protocol.samples || []).forEach(function (x) { spById[x.id] = x; });
    (protocol.tables || []).forEach(function (x) { tblById[x.id] = x; });
    var nmeOf = function (id) { return (matById[id] && matById[id].name) || (spById[id] && spById[id].name) || id; };

    var reviewCount = 0;
    (protocol.materials || []).forEach(function (x) { if (x.needsReview) reviewCount++; });
    (protocol.equipment || []).forEach(function (x) { if (x.needsReview) reviewCount++; });
    (protocol.steps || []).forEach(function (x) { if (x.needsReview) reviewCount++; (x.parameters || []).forEach(function (p) { if (p.needsReview) reviewCount++; }); });

    var h = [];
    h.push('<article class="protocol">');

    // header
    h.push('<header class="p-head"><h1>' + esc(m.title) + "</h1>");
    h.push('<div class="badges">');
    if (m.discipline) h.push('<span class="badge badge-disc">' + esc(m.discipline) + "</span>");
    if (m.family) h.push('<span class="badge">' + esc(m.family) + "</span>");
    if (m.category) h.push('<span class="badge">' + esc(m.category) + "</span>");
    if (m.version) h.push('<span class="badge">v' + esc(m.version) + "</span>");
    if (m.estimatedTime) h.push('<span class="badge badge-time">⏱ ' + esc(m.estimatedTime) + "</span>");
    if (reviewCount > 0) h.push('<span class="badge badge-review">' + reviewCount + " need review</span>");
    if (protocol.provenance && protocol.provenance.status) h.push('<span class="badge badge-status">' + esc(protocol.provenance.status) + "</span>");
    h.push("</div>");
    if (m.purpose) h.push("<p><strong>Purpose:</strong> " + esc(m.purpose) + "</p>");
    if (m.scope) h.push("<p><strong>Scope / Applicability:</strong> " + esc(m.scope) + "</p>");
    if (m.beforeYouBegin && m.beforeYouBegin.length) { h.push("<p><strong>Before You Begin:</strong></p><ul>"); m.beforeYouBegin.forEach(function (b) { h.push("<li>" + esc(b) + "</li>"); }); h.push("</ul>"); }
    h.push("</header>");

    // study design (in-vivo/comparative)
    var sd = protocol.studyDesign;
    if (sd && (sd.groups || sd.randomization || sd.blinding || sd.statisticalPlan || (sd.timepoints && sd.timepoints.length))) {
      h.push("<h2>Study Design</h2>");
      if (sd.groups && sd.groups.length) {
        h.push('<table class="tbl"><thead><tr><th>Group</th><th>N</th><th>Treatment</th></tr></thead><tbody>');
        sd.groups.forEach(function (g) { h.push("<tr><td>" + esc(g.name) + "</td><td>" + esc(g.n !== undefined && g.n !== null ? g.n : "") + "</td><td>" + esc(g.treatment || g.description || "") + "</td></tr>"); });
        h.push("</tbody></table>");
      }
      if (sd.randomization) h.push("<p><strong>Randomization:</strong> " + esc(sd.randomization) + "</p>");
      if (sd.blinding) h.push("<p><strong>Blinding:</strong> " + esc(sd.blinding) + "</p>");
      if (sd.timepoints && sd.timepoints.length) h.push("<p><strong>Timepoints:</strong> " + esc(sd.timepoints.join(", ")) + "</p>");
      if (sd.statisticalPlan) h.push("<p><strong>Statistical plan:</strong> " + esc(sd.statisticalPlan) + "</p>");
    }

    // materials
    if (protocol.materials && protocol.materials.length) {
      h.push('<h2>Materials and Reagents</h2><table class="tbl"><thead><tr><th>Name</th><th>Amount / Working conc.</th><th>Specification / Grade</th><th>Vendor / Cat#</th></tr></thead><tbody>');
      protocol.materials.forEach(function (x) {
        var amt = "";
        if (x.amount !== null && x.amount !== undefined) { amt = String(x.amount); if (x.amountMax !== null && x.amountMax !== undefined && x.amountMax !== x.amount) amt += "–" + x.amountMax; if (x.unit) amt += " " + x.unit; }
        else if (x.workingConcentration) amt = x.workingConcentration;
        var vendor = [x.vendor, x.catalogNumber].filter(Boolean).join(" ");
        var spec = x.specification || "";
        if (x.hazard) spec += (spec ? " " : "") + '<span class="haz">⚠ ' + esc(x.hazard) + "</span>";
        h.push("<tr" + (x.needsReview ? ' class="row-review"' : "") + "><td>" + esc(x.name) + reviewMark(x.needsReview) + "</td><td>" + esc(amt) + "</td><td>" + spec + "</td><td>" + esc(vendor) + "</td></tr>");
      });
      h.push("</tbody></table>");
    }

    // equipment
    if (protocol.equipment && protocol.equipment.length) {
      h.push('<h2>Equipment and Settings</h2><table class="tbl"><thead><tr><th>Name</th><th>Model</th><th>Settings</th></tr></thead><tbody>');
      protocol.equipment.forEach(function (x) { h.push("<tr" + (x.needsReview ? ' class="row-review"' : "") + "><td>" + esc(x.name) + reviewMark(x.needsReview) + "</td><td>" + esc(x.model || "") + "</td><td>" + esc(x.settings || "") + "</td></tr>"); });
      h.push("</tbody></table>");
    }

    // software (computational)
    if (protocol.software && protocol.software.length) {
      h.push('<h2>Software and Tools</h2><table class="tbl"><thead><tr><th>Name</th><th>Version</th><th>Command</th><th>Source</th></tr></thead><tbody>');
      protocol.software.forEach(function (x) { h.push("<tr><td>" + esc(x.name) + "</td><td>" + esc(x.version || "") + "</td><td>" + (x.command ? "<code>" + esc(x.command) + "</code>" : "") + "</td><td>" + (x.url ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">link</a>' : "") + "</td></tr>"); });
      h.push("</tbody></table>");
    }

    // samples (inputs/intermediates/outputs)
    if (protocol.samples && protocol.samples.length) {
      h.push('<h2>Samples</h2><table class="tbl"><thead><tr><th>Sample</th><th>Role</th><th>Kind</th></tr></thead><tbody>');
      protocol.samples.forEach(function (x) { h.push("<tr><td>" + esc(x.name) + reviewMark(x.needsReview) + "</td><td>" + esc(x.role) + "</td><td>" + esc([x.kind, x.dataType, x.organism].filter(Boolean).join(" · ")) + "</td></tr>"); });
      h.push("</tbody></table>");
    }

    // procedure
    if (protocol.steps && protocol.steps.length) {
      h.push("<h2>Procedure</h2>");
      var order = [], groups = {};
      protocol.steps.forEach(function (s) { var k = s.phase || ""; if (!(k in groups)) { groups[k] = []; order.push(k); } groups[k].push(s); });
      order.forEach(function (key) {
        if (key) h.push('<h3 class="phase">' + esc(key) + "</h3>");
        h.push('<table class="tbl proc"><thead><tr><th>Step</th><th>Action</th><th>Parameters</th><th>Expected Result / QC</th><th>Critical Notes</th></tr></thead><tbody>');
        groups[key].forEach(function (s) {
          var action = esc(s.action);
          if (s.optional) action = '<span class="opt">[optional]</span> ' + action;
          if (s.repeat) { var r = s.repeat.count ? "×" + s.repeat.count : (s.repeat.untilCondition ? "until " + s.repeat.untilCondition : "repeat"); action += ' <span class="repeat">↺ ' + esc(r) + "</span>"; }
          (s.branches || []).forEach(function (b) { action += '<div class="decision">⎇ ' + esc(b.condition) + (b.targetStepId ? " → " + esc(b.targetStepId) : "") + (b.action ? ": " + esc(b.action) : "") + "</div>"; });
          if (s.command) action += '<div class="cmd"><code>' + esc(s.command) + "</code></div>";
          // input -> output flow
          if ((s.inputIds && s.inputIds.length) || (s.outputIds && s.outputIds.length)) {
            var fl = '<div class="flow">';
            if (s.inputIds && s.inputIds.length) fl += s.inputIds.map(function (id) { return chip(nmeOf(id), "chip-in"); }).join(" ");
            fl += ' <span class="arrow">→</span> ';
            if (s.outputIds && s.outputIds.length) fl += s.outputIds.map(function (id) { return chip(nmeOf(id), "chip-out"); }).join(" ");
            action += fl + "</div>";
          }
          // material uses (with amounts) or plain refs
          var refs = [];
          if (s.materialUses && s.materialUses.length) {
            s.materialUses.forEach(function (u) {
              var lbl = (matById[u.materialId] ? matById[u.materialId].name : u.materialId);
              var q = (u.amount !== null && u.amount !== undefined) ? (u.amount + (u.unit ? " " + u.unit : "")) : "";
              if (u.equivalents) q += (q ? ", " : "") + u.equivalents + " equiv";
              if (u.limitingReagent) q += (q ? ", " : "") + "limiting";
              refs.push(chip(lbl + (q ? " (" + q + ")" : ""), u.needsReview ? "chip-review" : ""));
            });
          } else {
            (s.materialIds || []).forEach(function (id) { if (matById[id]) refs.push(chip(matById[id].name, matById[id].needsReview ? "chip-review" : "")); });
          }
          (s.equipmentIds || []).forEach(function (id) { if (eqById[id]) refs.push(chip(eqById[id].name, "chip-eq")); });
          (s.softwareIds || []).forEach(function (id) { if (swById[id]) refs.push(chip(swById[id].name, "chip-sw")); });
          (s.containerIds || []).forEach(function (id) { refs.push(chip(id, "chip-eq")); });
          (s.tableIds || []).forEach(function (id) { refs.push(chip((tblById[id] && tblById[id].title) || id, "chip-tbl")); });
          if (refs.length) action += '<div class="refs">' + refs.join(" ") + "</div>";

          var params = (s.parameters || []).map(fmtParam).join(" ");
          var expected = esc(s.expectedResult || "");
          (s.acceptanceCriteria || []).forEach(function (a) {
            var line = "✓ " + esc(a.parameter || a.description || "acceptance");
            if (a.value !== undefined && a.value !== null) { var pre = a.comparator === "min" ? "≥ " : a.comparator === "max" ? "≤ " : ""; line += ": " + pre + a.value + (a.unit ? " " + a.unit : ""); }
            if (a.classification) line += " (" + esc(a.classification) + ")";
            expected += '<div class="accept">' + line + "</div>";
          });
          var notes = esc(s.criticalNotes || "");
          if (s.safetyNotes) notes += (notes ? "<br>" : "") + '<span class="safety-inline">⚠ ' + esc(s.safetyNotes) + "</span>";
          h.push("<tr" + (s.needsReview ? ' class="row-review"' : "") + "><td>" + esc(s.number !== undefined && s.number !== null ? s.number : "") + reviewMark(s.needsReview) + "</td><td>" + action + "</td><td>" + params + "</td><td>" + expected + "</td><td>" + notes + "</td></tr>");
        });
        h.push("</tbody></table>");
      });
    }

    // tables
    if (protocol.tables && protocol.tables.length) {
      h.push("<h2>Tables</h2>");
      protocol.tables.forEach(function (t) {
        h.push('<div class="tblwrap"><div class="tblcap">' + esc(t.title || t.id) + (t.kind ? ' <span class="badge">' + esc(t.kind) + "</span>" : "") + reviewMark(t.needsReview) + "</div>");
        h.push('<table class="tbl"><thead><tr>' + (t.columns || []).map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>");
        (t.rows || []).forEach(function (row) { h.push("<tr>" + (row || []).map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"); });
        h.push("</tbody></table>" + (t.note ? '<div class="tblnote">' + esc(t.note) + "</div>" : "") + "</div>");
      });
    }

    // containers with layout
    if (protocol.containers && protocol.containers.length) {
      var anyLayout = protocol.containers.some(function (c) { return c.layout && c.layout.length; });
      h.push('<h2>Containers</h2><table class="tbl"><thead><tr><th>Name</th><th>Type</th><th>Wells</th></tr></thead><tbody>');
      protocol.containers.forEach(function (c) { h.push("<tr><td>" + esc(c.name) + reviewMark(c.needsReview) + "</td><td>" + esc(c.type || "") + "</td><td>" + esc(c.wells !== undefined && c.wells !== null ? c.wells : "") + "</td></tr>"); });
      h.push("</tbody></table>");
      if (anyLayout) {
        protocol.containers.forEach(function (c) {
          if (!c.layout || !c.layout.length) return;
          h.push('<div class="tblcap">' + esc(c.name) + " layout</div>");
          h.push('<table class="tbl"><thead><tr><th>Well</th><th>Sample/Material</th><th>Factor</th><th>Level</th></tr></thead><tbody>');
          c.layout.forEach(function (cell) { h.push("<tr><td>" + esc(cell.well) + "</td><td>" + esc(nmeOrId(cell, matById, spById)) + "</td><td>" + esc(cell.factor || "") + "</td><td>" + esc(cell.level || "") + "</td></tr>"); });
          h.push("</tbody></table>");
        });
      }
    }

    // controls
    if (protocol.controls && protocol.controls.length) { h.push("<h2>Controls</h2><ul>"); protocol.controls.forEach(function (c) { h.push("<li><strong>" + esc(c.name) + "</strong>" + (c.description ? ": " + esc(c.description) : "") + reviewMark(c.needsReview) + "</li>"); }); h.push("</ul>"); }

    // expected outputs
    if (protocol.expectedOutputs && protocol.expectedOutputs.length) { h.push("<h2>Expected Outputs</h2><ul>"); protocol.expectedOutputs.forEach(function (o) { h.push("<li>" + esc(o) + "</li>"); }); h.push("</ul>"); }

    // troubleshooting
    if (protocol.troubleshooting && protocol.troubleshooting.length) {
      h.push('<h2>Troubleshooting</h2><table class="tbl"><thead><tr><th>Problem</th><th>Likely cause</th><th>Solution</th></tr></thead><tbody>');
      protocol.troubleshooting.forEach(function (t) { h.push("<tr><td>" + esc(t.problem) + "</td><td>" + esc(t.cause || "") + "</td><td>" + esc(t.solution || "") + "</td></tr>"); });
      h.push("</tbody></table>");
    }

    // safety + biosafety
    if ((protocol.safety && protocol.safety.length) || (protocol.biosafetyLevel && protocol.biosafetyLevel !== "not specified")) {
      h.push("<h2>Safety</h2>");
      if (protocol.biosafetyLevel && protocol.biosafetyLevel !== "not specified") h.push('<p><span class="badge badge-bsl">' + esc(protocol.biosafetyLevel) + "</span></p>");
      if (protocol.safety && protocol.safety.length) { h.push("<ul>"); protocol.safety.forEach(function (s) { h.push("<li>" + esc(s) + "</li>"); }); h.push("</ul>"); }
    }

    // compliance / ethics
    var cp = protocol.compliance;
    if (cp && (cp.iacuc || cp.irb || cp.approvalId || cp.consent || cp.wasteDisposal)) {
      h.push("<h2>Compliance & Ethics</h2><ul>");
      if (cp.iacuc) h.push("<li><strong>IACUC:</strong> " + esc(cp.iacuc) + "</li>");
      if (cp.irb) h.push("<li><strong>IRB:</strong> " + esc(cp.irb) + "</li>");
      if (cp.approvalId) h.push("<li><strong>Approval:</strong> " + esc(cp.approvalId) + "</li>");
      if (cp.consent) h.push("<li><strong>Consent:</strong> " + esc(cp.consent) + "</li>");
      if (cp.wasteDisposal) h.push("<li><strong>Waste disposal:</strong> " + esc(cp.wasteDisposal) + "</li>");
      h.push("</ul>");
    }

    // limitations
    if (protocol.limitations) h.push("<h2>Limitations</h2><p>" + esc(protocol.limitations) + "</p>");

    // sources
    if (protocol.sources && protocol.sources.length) {
      h.push("<h2>Sources and License</h2><ul>");
      protocol.sources.forEach(function (s) {
        var label = s.title || s.file || s.url || s.doi || s.id;
        var line = "<strong>" + esc(s.kind) + ":</strong> " + esc(label);
        if (s.file) line += " <code>" + esc(s.file) + "</code>";
        if (s.doi) line += ' — DOI: <a href="https://doi.org/' + esc(s.doi) + '" target="_blank" rel="noopener">' + esc(s.doi) + "</a>";
        else if (s.url) line += ' — <a href="' + esc(s.url) + '" target="_blank" rel="noopener">link</a>';
        if (s.license) line += '<br><span class="lic">License: ' + esc(s.license) + (s.licenseVerified ? " (verified)" : " (unverified)") + "</span>";
        h.push("<li>" + line + "</li>");
      });
      h.push("</ul>");
    }

    h.push("</article>");
    return h.join("\n");
  }

  function nmeOrId(cell, matById, spById) {
    if (cell.sampleId) return (spById[cell.sampleId] && spById[cell.sampleId].name) || cell.sampleId;
    if (cell.materialId) return (matById[cell.materialId] && matById[cell.materialId].name) || cell.materialId;
    return "";
  }

  global.renderProtocolHTML = renderProtocolHTML;
  if (typeof module !== "undefined" && module.exports) module.exports = { renderProtocolHTML: renderProtocolHTML };
})(typeof window !== "undefined" ? window : globalThis);
