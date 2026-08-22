/*
 * Alternative front-end presentations of the SAME canonical protocol JSON.
 * window.renderVariant(protocol, style) -> HTML string. Styles:
 *   "document" (journal layout, via renderer.js), "checklist" (bench run-mode cards),
 *   "timeline" (vertical stepper), "compact" (two-column print/reference).
 * Same data, different presentation — for design review.
 * Supports v0.1/v0.2/v0.3 fields.
 */
(function (global) {
  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtParam(p) {
    var t = p.rawText;
    if (!t) {
      if (p.valueText) t = p.valueText;
      else if (p.value !== null && p.value !== undefined) {
        var pre = p.comparator === "min" ? "≥ " : p.comparator === "max" ? "≤ " : p.comparator === "approx" ? "~ " : "";
        t = pre + p.value;
        if (p.valueMax !== null && p.valueMax !== undefined && p.valueMax !== p.value) t += "–" + p.valueMax;
        if (p.unit) t += " " + p.unit;
        if (p.perUnit) t += " /" + p.perUnit;
      } else t = p.unit || p.type || "";
    }
    return '<span class="v-pill' + (p.needsReview ? " v-pill-review" : "") + '"><i>' + esc(p.type) + "</i>" + esc(t) + "</span>";
  }
  function lookups(p) {
    var m = {}, e = {}, sw = {}, sp = {}, tbl = {};
    (p.materials || []).forEach(function (x) { m[x.id] = x; });
    (p.equipment || []).forEach(function (x) { e[x.id] = x; });
    (p.software || []).forEach(function (x) { sw[x.id] = x; });
    (p.samples || []).forEach(function (x) { sp[x.id] = x; });
    (p.tables || []).forEach(function (x) { tbl[x.id] = x; });
    return { m: m, e: e, sw: sw, sp: sp, tbl: tbl };
  }
  function nmeOf(id, L) {
    return (L.m[id] && L.m[id].name) || (L.sp[id] && L.sp[id].name) || id;
  }
  function refChips(s, L) {
    var out = [];
    // materialUses (v0.3) or plain materialIds
    if (s.materialUses && s.materialUses.length) {
      s.materialUses.forEach(function (u) {
        var lbl = (L.m[u.materialId] ? L.m[u.materialId].name : u.materialId);
        var q = (u.amount !== null && u.amount !== undefined) ? (u.amount + (u.unit ? " " + u.unit : "")) : "";
        if (u.equivalents) q += (q ? ", " : "") + u.equivalents + " equiv";
        if (u.limitingReagent) q += (q ? ", " : "") + "limiting";
        out.push('<span class="v-chip' + (u.needsReview ? " v-chip-review" : "") + '">' + esc(lbl + (q ? " (" + q + ")" : "")) + "</span>");
      });
    } else {
      (s.materialIds || []).forEach(function (id) { if (L.m[id]) out.push('<span class="v-chip' + (L.m[id].needsReview ? " v-chip-review" : "") + '">' + esc(L.m[id].name) + "</span>"); });
    }
    (s.equipmentIds || []).forEach(function (id) { if (L.e[id]) out.push('<span class="v-chip v-chip-eq">' + esc(L.e[id].name) + "</span>"); });
    (s.softwareIds || []).forEach(function (id) { if (L.sw[id]) out.push('<span class="v-chip v-chip-sw">' + esc(L.sw[id].name) + "</span>"); });
    (s.containerIds || []).forEach(function (id) { out.push('<span class="v-chip v-chip-eq">' + esc(id) + "</span>"); });
    (s.tableIds || []).forEach(function (id) { out.push('<span class="v-chip v-chip-tbl">' + esc((L.tbl[id] && L.tbl[id].title) || id) + "</span>"); });
    return out.join(" ");
  }
  function byPhase(p) {
    var order = [], g = {};
    (p.steps || []).forEach(function (s) { var k = s.phase || ""; if (!(k in g)) { g[k] = []; order.push(k); } g[k].push(s); });
    return { order: order, g: g };
  }
  function head(p, sub) {
    var m = p.metadata;
    var badges = [];
    if (m.discipline) badges.push('<span class="v-badge v-badge-disc">' + esc(m.discipline) + "</span>");
    if (m.family) badges.push('<span class="v-badge">' + esc(m.family) + "</span>");
    if (m.estimatedTime) badges.push('<span class="v-badge v-badge-time">⏱ ' + esc(m.estimatedTime) + "</span>");
    return '<div class="v-head"><h1>' + esc(m.title) + '</h1><div class="v-badges">' + badges.join("") +
      '</div><p class="v-purpose">' + esc(m.purpose) + "</p>" + (sub || "") + "</div>";
  }

  // render input->output flow line
  function flowLine(s, L) {
    if ((!s.inputIds || !s.inputIds.length) && (!s.outputIds || !s.outputIds.length)) return "";
    var fl = '<div class="v-flow">';
    if (s.inputIds && s.inputIds.length) fl += s.inputIds.map(function (id) { return '<span class="v-chip v-chip-in">' + esc(nmeOf(id, L)) + "</span>"; }).join(" ");
    fl += ' <span class="v-arrow">→</span> ';
    if (s.outputIds && s.outputIds.length) fl += s.outputIds.map(function (id) { return '<span class="v-chip v-chip-out">' + esc(nmeOf(id, L)) + "</span>"; }).join(" ");
    return fl + "</div>";
  }

  // render repeat badge
  function repeatBadge(s) {
    if (!s.repeat) return "";
    var r = s.repeat.count ? "↺×" + s.repeat.count : (s.repeat.untilCondition ? "↺ until " + s.repeat.untilCondition : "↺ repeat");
    if (s.repeat.over) r += " (" + s.repeat.over + ")";
    return '<span class="v-repeat">' + esc(r) + "</span>";
  }

  // render command block
  function cmdBlock(s) {
    if (!s.command) return "";
    return '<div class="v-cmd"><code>' + esc(s.command) + "</code></div>";
  }

  // render acceptance criteria
  function acceptBlock(s) {
    if (!s.acceptanceCriteria || !s.acceptanceCriteria.length) return "";
    var out = [];
    s.acceptanceCriteria.forEach(function (a) {
      var line = "✓ " + esc(a.parameter || a.description || "acceptance");
      if (a.value !== undefined && a.value !== null) {
        var pre = a.comparator === "min" ? "≥ " : a.comparator === "max" ? "≤ " : "";
        line += ": " + pre + a.value + (a.unit ? " " + a.unit : "");
      }
      if (a.classification) line += " (" + esc(a.classification) + ")";
      out.push('<div class="v-accept">' + line + "</div>");
    });
    return out.join("");
  }

  // render branch conditions
  function branchLines(s) {
    if (!s.branches || !s.branches.length) return "";
    var out = [];
    s.branches.forEach(function (b) {
      out.push('<div class="v-branch">⎋ ' + esc(b.condition) + (b.targetStepId ? " → " + esc(b.targetStepId) : "") + (b.action ? ": " + esc(b.action) : "") + "</div>");
    });
    return out.join("");
  }

  // render study design section
  function studyDesignSection(p) {
    var sd = p.studyDesign;
    if (!sd || (!sd.groups && !sd.randomization && !sd.blinding && !sd.statisticalPlan && !(sd.timepoints && sd.timepoints.length))) return "";
    var h = [];
    h.push('<div class="v-section"><div class="v-section-title">Study Design</div>');
    if (sd.groups && sd.groups.length) {
      h.push('<table class="v-tbl"><thead><tr><th>Group</th><th>N</th><th>Treatment</th></tr></thead><tbody>');
      sd.groups.forEach(function (g) { h.push("<tr><td>" + esc(g.name) + "</td><td>" + esc(g.n !== undefined && g.n !== null ? g.n : "") + "</td><td>" + esc(g.treatment || g.description || "") + "</td></tr>"); });
      h.push("</tbody></table>");
    }
    if (sd.randomization) h.push('<div class="v-detail"><b>Randomization:</b> ' + esc(sd.randomization) + "</div>");
    if (sd.blinding) h.push('<div class="v-detail"><b>Blinding:</b> ' + esc(sd.blinding) + "</div>");
    if (sd.timepoints && sd.timepoints.length) h.push('<div class="v-detail"><b>Timepoints:</b> ' + esc(sd.timepoints.join(", ")) + "</div>");
    if (sd.statisticalPlan) h.push('<div class="v-detail"><b>Statistical plan:</b> ' + esc(sd.statisticalPlan) + "</div>");
    h.push("</div>");
    return h.join("");
  }

  // render compliance section
  function complianceSection(p) {
    var cp = p.compliance;
    if (!cp || (!cp.iacuc && !cp.irb && !cp.approvalId && !cp.consent && !cp.wasteDisposal)) return "";
    var h = [];
    h.push('<div class="v-section"><div class="v-section-title">Compliance & Ethics</div>');
    if (cp.iacuc) h.push('<div class="v-detail"><b>IACUC:</b> ' + esc(cp.iacuc) + "</div>");
    if (cp.irb) h.push('<div class="v-detail"><b>IRB:</b> ' + esc(cp.irb) + "</div>");
    if (cp.approvalId) h.push('<div class="v-detail"><b>Approval:</b> ' + esc(cp.approvalId) + "</div>");
    if (cp.consent) h.push('<div class="v-detail"><b>Consent:</b> ' + esc(cp.consent) + "</div>");
    if (cp.wasteDisposal) h.push('<div class="v-detail"><b>Waste disposal:</b> ' + esc(cp.wasteDisposal) + "</div>");
    h.push("</div>");
    return h.join("");
  }

  // ---- checklist / bench run-mode ----
  function renderChecklist(p) {
    var L = lookups(p), ph = byPhase(p), h = [];
    h.push('<div class="v-checklist">');
    h.push(head(p));
    h.push(studyDesignSection(p));
    h.push(complianceSection(p));
    ph.order.forEach(function (key) {
      if (key) h.push('<div class="v-phase-bar">' + esc(key) + "</div>");
      ph.g[key].forEach(function (s) {
        var params = (s.parameters || []).map(fmtParam).join(" ");
        var refs = refChips(s, L);
        h.push('<label class="v-card' + (s.needsReview ? " v-card-review" : "") + '">');
        h.push('<input type="checkbox" class="v-check">');
        h.push('<div class="v-card-body">');
        h.push('<div class="v-card-top"><span class="v-num">' + esc(s.number || "") + "</span>" +
          (s.optional ? '<span class="v-opt">optional</span> ' : "") + esc(s.action) +
          repeatBadge(s) + "</div>");
        if (params) h.push('<div class="v-row">' + params + "</div>");
        if (refs) h.push('<div class="v-row">' + refs + "</div>");
        h.push(flowLine(s, L));
        h.push(cmdBlock(s));
        h.push(branchLines(s));
        if (s.expectedResult) h.push('<div class="v-expect">✓ ' + esc(s.expectedResult) + "</div>");
        h.push(acceptBlock(s));
        if (s.criticalNotes) h.push('<div class="v-note">! ' + esc(s.criticalNotes) + "</div>");
        h.push("</div></label>");
      });
    });
    h.push("</div>");
    return h.join("");
  }

  // ---- timeline / vertical stepper ----
  function renderTimeline(p) {
    var L = lookups(p), ph = byPhase(p), h = [];
    h.push('<div class="v-timeline">');
    h.push(head(p));
    h.push(studyDesignSection(p));
    h.push(complianceSection(p));
    h.push('<div class="v-tl">');
    ph.order.forEach(function (key) {
      if (key) h.push('<div class="v-tl-phase"><span>' + esc(key) + "</span></div>");
      ph.g[key].forEach(function (s) {
        var params = (s.parameters || []).map(fmtParam).join(" ");
        var refs = refChips(s, L);
        h.push('<div class="v-tl-item' + (s.needsReview ? " v-tl-review" : "") + '">');
        h.push('<div class="v-tl-dot">' + esc(s.number || "") + "</div>");
        h.push('<div class="v-tl-content"><div class="v-tl-action">' +
          (s.optional ? '<span class="v-opt">optional</span> ' : "") + esc(s.action) +
          repeatBadge(s) + "</div>");
        if (params) h.push('<div class="v-row">' + params + "</div>");
        if (refs) h.push('<div class="v-row v-row-dim">' + refs + "</div>");
        h.push(flowLine(s, L));
        h.push(cmdBlock(s));
        h.push(branchLines(s));
        if (s.expectedResult) h.push('<div class="v-expect">✓ ' + esc(s.expectedResult) + "</div>");
        h.push(acceptBlock(s));
        if (s.criticalNotes) h.push('<div class="v-note">! ' + esc(s.criticalNotes) + "</div>");
        h.push("</div></div>");
      });
    });
    h.push("</div></div>");
    return h.join("");
  }

  // ---- compact / two-column print reference ----
  function renderCompact(p) {
    var L = lookups(p), ph = byPhase(p), h = [];
    h.push('<div class="v-compact">');
    h.push(head(p));
    h.push('<div class="v-cols">');
    // sidebar
    h.push('<aside class="v-side">');
    // study design in sidebar for compact
    var sd = p.studyDesign;
    if (sd && (sd.groups || sd.randomization || sd.blinding || sd.statisticalPlan)) {
      h.push("<h4>Study Design</h4>");
      if (sd.groups && sd.groups.length) {
        h.push('<ul class="v-mini">');
        sd.groups.forEach(function (g) {
          h.push("<li><b>" + esc(g.name) + "</b>" + (g.n !== undefined && g.n !== null ? " (n=" + esc(g.n) + ")" : "") + (g.treatment ? ": " + esc(g.treatment) : "") + "</li>");
        });
        h.push("</ul>");
      }
      if (sd.randomization) h.push('<div class="v-detail">' + esc(sd.randomization) + "</div>");
      if (sd.statisticalPlan) h.push('<div class="v-detail">' + esc(sd.statisticalPlan) + "</div>");
    }
    if (p.materials && p.materials.length) {
      h.push("<h4>Materials</h4><ul class=\"v-mini\">");
      p.materials.forEach(function (x) {
        var amt = (x.amount != null ? x.amount + (x.unit ? " " + x.unit : "") : (x.workingConcentration || ""));
        h.push("<li>" + esc(x.name) + (amt ? ' <b>' + esc(amt) + "</b>" : "") + (x.needsReview ? ' <span class="v-flag">review</span>' : "") + "</li>");
      });
      h.push("</ul>");
    }
    if (p.equipment && p.equipment.length) {
      h.push("<h4>Equipment</h4><ul class=\"v-mini\">");
      p.equipment.forEach(function (x) { h.push("<li>" + esc(x.name) + (x.model ? " (" + esc(x.model) + ")" : "") + "</li>"); });
      h.push("</ul>");
    }
    if (p.software && p.software.length) {
      h.push("<h4>Software</h4><ul class=\"v-mini\">");
      p.software.forEach(function (x) { h.push("<li>" + esc(x.name) + (x.version ? " v" + esc(x.version) : "") + "</li>"); });
      h.push("</ul>");
    }
    if (p.samples && p.samples.length) {
      h.push("<h4>Samples</h4><ul class=\"v-mini\">");
      p.samples.forEach(function (x) { h.push("<li>" + esc(x.name) + ' <span class="v-flag">' + esc(x.role) + "</span>" + (x.kind ? " " + esc(x.kind) : "") + "</li>"); });
      h.push("</ul>");
    }
    if (p.controls && p.controls.length) {
      h.push("<h4>Controls</h4><ul class=\"v-mini\">");
      p.controls.forEach(function (c) { h.push("<li>" + esc(c.name) + "</li>"); });
      h.push("</ul>");
    }
    // compliance in sidebar for compact
    var cp = p.compliance;
    if (cp && (cp.iacuc || cp.irb || cp.approvalId || cp.consent || cp.wasteDisposal)) {
      h.push("<h4>Compliance</h4><ul class=\"v-mini\">");
      if (cp.iacuc) h.push("<li><b>IACUC:</b> " + esc(cp.iacuc) + "</li>");
      if (cp.irb) h.push("<li><b>IRB:</b> " + esc(cp.irb) + "</li>");
      if (cp.approvalId) h.push("<li><b>Approval:</b> " + esc(cp.approvalId) + "</li>");
      if (cp.consent) h.push("<li><b>Consent:</b> " + esc(cp.consent) + "</li>");
      if (cp.wasteDisposal) h.push("<li><b>Waste:</b> " + esc(cp.wasteDisposal) + "</li>");
      h.push("</ul>");
    }
    h.push("</aside>");
    // main steps
    h.push('<main class="v-main">');
    ph.order.forEach(function (key) {
      if (key) h.push('<h4 class="v-cphase">' + esc(key) + "</h4>");
      h.push('<ol class="v-steps">');
      ph.g[key].forEach(function (s) {
        var params = (s.parameters || []).map(function (pr) { return fmtParam(pr); }).join(" ");
        var extra = "";
        extra += repeatBadge(s);
        if (s.command) extra += ' <code class="v-cmd-inline">' + esc(s.command) + "</code>";
        // inline flow
        if ((s.inputIds && s.inputIds.length) || (s.outputIds && s.outputIds.length)) {
          var fl = ' <span class="v-flow-inline">';
          if (s.inputIds && s.inputIds.length) fl += s.inputIds.map(function (id) { return '<span class="v-chip v-chip-in">' + esc(nmeOf(id, L)) + "</span>"; }).join(" ");
          fl += ' → ';
          if (s.outputIds && s.outputIds.length) fl += s.outputIds.map(function (id) { return '<span class="v-chip v-chip-out">' + esc(nmeOf(id, L)) + "</span>"; }).join(" ");
          extra += fl + "</span>";
        }
        // inline acceptance
        var acc = "";
        (s.acceptanceCriteria || []).forEach(function (a) {
          var pre = a.comparator === "min" ? "≥ " : a.comparator === "max" ? "≤ " : "";
          acc += ' <span class="v-accept-inline">✓ ' + esc(a.parameter || a.description || "") +
            (a.value !== undefined && a.value !== null ? ": " + pre + a.value + (a.unit ? " " + a.unit : "") : "") + "</span>";
        });
        h.push('<li value="' + esc(s.number || "") + '"' + (s.needsReview ? ' class="v-li-review"' : "") + ">" +
          (s.optional ? '<span class="v-opt">optional</span> ' : "") + esc(s.action) + extra +
          (params ? ' ' + params : "") +
          (s.expectedResult ? ' <span class="v-expect-inline">→ ' + esc(s.expectedResult) + "</span>" : "") +
          acc +
          "</li>");
      });
      h.push("</ol>");
    });
    h.push("</main></div></div>");
    return h.join("");
  }

  function renderVariant(protocol, style) {
    if (!protocol || !protocol.metadata) return '<p class="error">Invalid protocol.</p>';
    if (style === "checklist") return renderChecklist(protocol);
    if (style === "timeline") return renderTimeline(protocol);
    if (style === "compact") return renderCompact(protocol);
    // default: reuse the document renderer
    if (typeof global.renderProtocolHTML === "function") return global.renderProtocolHTML(protocol);
    return '<p class="error">document renderer not loaded.</p>';
  }

  global.renderVariant = renderVariant;
  if (typeof module !== "undefined" && module.exports) module.exports = { renderVariant: renderVariant };
})(typeof window !== "undefined" ? window : globalThis);
