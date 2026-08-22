/*
 * React component version of the renderer (for LabRecord website integration).
 * Mirrors renderer.js (renderProtocolHTML) but as JSX. Drop into a React app:
 *   import { ProtocolRenderer } from "./ProtocolRenderer.jsx";
 *   <ProtocolRenderer protocol={canonicalProtocolObject} />
 * A matching TypeScript type can be generated from canonical-schema.json (e.g. json-schema-to-typescript).
 */
import React from "react";

function fmtParam(p) {
  let text = p.rawText;
  if (!text) {
    if (p.value !== null && p.value !== undefined) {
      text = String(p.value);
      if (p.valueMax != null && p.valueMax !== p.value) text += "–" + p.valueMax;
      if (p.unit) text += " " + p.unit;
    } else {
      text = p.unit || p.type || "";
    }
  }
  return text;
}

export function ProtocolRenderer({ protocol }) {
  if (!protocol || !protocol.metadata) return <p className="error">Invalid protocol object.</p>;
  const m = protocol.metadata;
  const matById = Object.fromEntries((protocol.materials || []).map((x) => [x.id, x]));
  const eqById = Object.fromEntries((protocol.equipment || []).map((x) => [x.id, x]));

  // group steps by phase, preserving first-appearance order
  const order = [];
  const groups = {};
  (protocol.steps || []).forEach((s) => {
    const k = s.phase || "";
    if (!(k in groups)) { groups[k] = []; order.push(k); }
    groups[k].push(s);
  });

  const Review = ({ on }) => (on ? <span className="review"> needs review</span> : null);

  return (
    <article className="protocol">
      <header className="p-head">
        <h1>{m.title}</h1>
        <div className="badges">
          {m.family && <span className="badge">{m.family}</span>}
          {m.category && <span className="badge">{m.category}</span>}
          {m.version && <span className="badge">v{m.version}</span>}
          {m.estimatedTime && <span className="badge badge-time">⏱ {m.estimatedTime}</span>}
          {protocol.provenance?.status && <span className="badge badge-status">{protocol.provenance.status}</span>}
        </div>
        {m.purpose && <p><strong>Purpose:</strong> {m.purpose}</p>}
        {m.scope && <p><strong>Scope / Applicability:</strong> {m.scope}</p>}
        {m.beforeYouBegin?.length > 0 && (
          <>
            <p><strong>Before You Begin:</strong></p>
            <ul>{m.beforeYouBegin.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </>
        )}
      </header>

      {protocol.materials?.length > 0 && (
        <>
          <h2>Materials and Reagents</h2>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Amount / Working conc.</th><th>Specification / Grade</th><th>Vendor / Cat#</th></tr></thead>
            <tbody>
              {protocol.materials.map((x) => {
                let amt = "";
                if (x.amount != null) { amt = String(x.amount); if (x.amountMax != null && x.amountMax !== x.amount) amt += "–" + x.amountMax; if (x.unit) amt += " " + x.unit; }
                else if (x.workingConcentration) amt = x.workingConcentration;
                const vendor = [x.vendor, x.catalogNumber].filter(Boolean).join(" ");
                return (
                  <tr key={x.id} className={x.needsReview ? "row-review" : undefined}>
                    <td>{x.name}<Review on={x.needsReview} /></td>
                    <td>{amt}</td><td>{x.specification || ""}</td><td>{vendor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {protocol.equipment?.length > 0 && (
        <>
          <h2>Equipment and Settings</h2>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Model</th><th>Settings</th></tr></thead>
            <tbody>
              {protocol.equipment.map((x) => (
                <tr key={x.id} className={x.needsReview ? "row-review" : undefined}>
                  <td>{x.name}<Review on={x.needsReview} /></td><td>{x.model || ""}</td><td>{x.settings || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {protocol.steps?.length > 0 && (
        <>
          <h2>Procedure</h2>
          {order.map((key) => (
            <React.Fragment key={key || "_"}>
              {key && <h3 className="phase">{key}</h3>}
              <table className="tbl proc">
                <thead><tr><th>Step</th><th>Action</th><th>Parameters</th><th>Expected Result / QC</th><th>Critical Notes</th></tr></thead>
                <tbody>
                  {groups[key].map((s) => {
                    const refs = [
                      ...(s.materialIds || []).map((id) => matById[id]).filter(Boolean),
                      ...(s.equipmentIds || []).map((id) => eqById[id]).filter(Boolean),
                    ];
                    return (
                      <tr key={s.id} className={s.needsReview ? "row-review" : undefined}>
                        <td>{s.number ?? ""}<Review on={s.needsReview} /></td>
                        <td>
                          {s.optional && <span className="opt">[optional] </span>}{s.action}
                          {s.decisionPoint && <div className="decision">⎇ {s.decisionPoint}</div>}
                          {refs.length > 0 && <div className="refs">{refs.map((r) => <span key={r.id} className={"chip" + (r.needsReview ? " chip-review" : "")}>{r.name}</span>)}</div>}
                        </td>
                        <td>{(s.parameters || []).map((p, i) => <span key={i} className={"param" + (p.needsReview ? " param-review" : "")}><span className="param-type">{p.type}</span>{fmtParam(p)}</span>)}</td>
                        <td>{s.expectedResult || ""}</td>
                        <td>{s.criticalNotes || ""}{s.safetyNotes && <div className="safety-inline">⚠ {s.safetyNotes}</div>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </React.Fragment>
          ))}
        </>
      )}

      {protocol.controls?.length > 0 && (
        <>
          <h2>Controls</h2>
          <ul>{protocol.controls.map((c, i) => <li key={i}><strong>{c.name}</strong>{c.description ? ": " + c.description : ""}</li>)}</ul>
        </>
      )}

      {protocol.expectedOutputs?.length > 0 && (
        <>
          <h2>Expected Outputs</h2>
          <ul>{protocol.expectedOutputs.map((o, i) => <li key={i}>{o}</li>)}</ul>
        </>
      )}

      {protocol.troubleshooting?.length > 0 && (
        <>
          <h2>Troubleshooting</h2>
          <table className="tbl">
            <thead><tr><th>Problem</th><th>Likely cause</th><th>Solution</th></tr></thead>
            <tbody>{protocol.troubleshooting.map((t, i) => <tr key={i}><td>{t.problem}</td><td>{t.cause || ""}</td><td>{t.solution || ""}</td></tr>)}</tbody>
          </table>
        </>
      )}

      {(protocol.safety?.length > 0 || (protocol.biosafetyLevel && protocol.biosafetyLevel !== "not specified")) && (
        <>
          <h2>Safety</h2>
          {protocol.biosafetyLevel && protocol.biosafetyLevel !== "not specified" && <p><span className="badge badge-bsl">{protocol.biosafetyLevel}</span></p>}
          {protocol.safety?.length > 0 && <ul>{protocol.safety.map((s, i) => <li key={i}>{s}</li>)}</ul>}
        </>
      )}

      {protocol.limitations && (<><h2>Limitations</h2><p>{protocol.limitations}</p></>)}

      {protocol.sources?.length > 0 && (
        <>
          <h2>Sources and License</h2>
          <ul>
            {protocol.sources.map((s) => (
              <li key={s.id}>
                <strong>{s.kind}:</strong> {s.title || s.file || s.url || s.doi || s.id}
                {s.file && <> <code>{s.file}</code></>}
                {s.doi && <> — DOI: <a href={"https://doi.org/" + s.doi} target="_blank" rel="noopener noreferrer">{s.doi}</a></>}
                {!s.doi && s.url && <> — <a href={s.url} target="_blank" rel="noopener noreferrer">link</a></>}
                {s.license && <><br /><span className="lic">License: {s.license} {s.licenseVerified ? "(verified)" : "(unverified)"}</span></>}
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

export default ProtocolRenderer;
