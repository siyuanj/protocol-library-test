import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({ name: "labrecord-demo-agent", version: "0.1.0" });
const transport = new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3333/mcp"));

const protocol = {
  title: "Chemical transformation of DH5α competent cells",
  summary: "Demo draft derived from a vendor-style protocol. The recovery conditions require review before use.",
  category: "Molecular biology",
  tags: ["transformation", "DH5α", "plasmid"],
  source: {
    kind: "pdf",
    files: [{ name: "competent-cells-protocol.pdf", reference: "local-demo-file-001", pages: [1] }],
    userInstruction: "Import this as a review draft for Wang Lab. Keep all uncertain recovery details for review."
  },
  steps: [
    {
      instruction: "Thaw competent cells on ice.",
      materials: [{ name: "DH5α competent cells", amount: "50", unit: "µL", sourceReference: "competent-cells-protocol.pdf p. 1" }],
      sourceReference: "competent-cells-protocol.pdf p. 1",
      needsReview: []
    },
    {
      instruction: "Add plasmid DNA to the cells and mix gently.",
      materials: [{ name: "Plasmid DNA", sourceReference: "competent-cells-protocol.pdf p. 1" }],
      sourceReference: "competent-cells-protocol.pdf p. 1",
      needsReview: ["Confirm the recommended DNA mass for this competent-cell lot."]
    }
  ],
  needsReview: ["Confirm recovery medium volume, temperature, and incubation duration with the source document."]
};

try {
  await client.connect(transport);
  const schema = await client.callTool({ name: "get_protocol_import_schema", arguments: {} });
  console.log("Agent read the MCP import rules.");
  console.log(schema.content[0]?.text.slice(0, 180) + "…");

  const result = await client.callTool({
    name: "create_protocol_draft",
    arguments: { protocol, importNote: "Created by the standalone demo MCP client." }
  });
  console.log("\nAgent created a LabRecord draft through MCP:");
  console.log(result.content[0]?.text);
} finally {
  await transport.close();
}
