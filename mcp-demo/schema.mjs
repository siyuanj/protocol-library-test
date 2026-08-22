// Single source of truth for the LabRecord protocol draft shape.
// The website validates every POST against this; the MCP server just forwards.
import { z } from "zod";

const text = z.string().trim().min(1);

export const protocolSchema = z
  .object({
    title: text.max(160),
    summary: z.string().trim().max(1200).default(""),
    category: text.max(80),
    tags: z.array(text.max(50)).max(12).default([]),
    source: z
      .object({
        kind: z.enum(["pdf", "image", "voice", "text", "mixed"]),
        files: z
          .array(
            z
              .object({
                name: text.max(255),
                reference: z.string().trim().max(500).default(""),
                pages: z.array(z.number().int().positive()).max(200).optional()
              })
              .strict()
          )
          .max(20)
          .default([]),
        userInstruction: z.string().trim().max(2000).default("")
      })
      .strict(),
    steps: z
      .array(
        z
          .object({
            instruction: text.max(3000),
            duration: z.string().trim().max(80).optional(),
            temperature: z.string().trim().max(80).optional(),
            materials: z
              .array(
                z
                  .object({
                    name: text.max(200),
                    amount: z.string().trim().max(80).optional(),
                    unit: z.string().trim().max(40).optional(),
                    gradeOrLot: z.string().trim().max(100).optional(),
                    sourceReference: z.string().trim().max(160).optional()
                  })
                  .strict()
              )
              .max(40)
              .default([]),
            sourceReference: z.string().trim().max(160).optional(),
            needsReview: z.array(z.string().trim().max(240)).max(15).default([])
          })
          .strict()
      )
      .min(1)
      .max(120),
    needsReview: z.array(z.string().trim().max(240)).max(30).default([])
  })
  .strict();

export const createInputSchema = z
  .object({
    protocol: protocolSchema,
    importNote: z.string().trim().max(1000).optional()
  })
  .strict();

// Human/agent-readable description returned by the get_import_schema tool.
export function schemaDescription() {
  return {
    schemaVersion: "labrecord.protocol-draft.v1",
    rules: [
      "Create a review draft. Never publish automatically.",
      "Transcribe the source faithfully. Do NOT invent quantities, temperatures, timings, or lot numbers.",
      "Put anything uncertain, ambiguous, or missing into a needsReview entry (per step or protocol-wide).",
      "Attach a sourceReference (e.g. 'protocol.pdf p.1') to steps and materials when you can.",
      "Lab identity is derived from the API token on the server; it is never taken from tool input."
    ],
    shape: {
      title: "string",
      summary: "string",
      category: "string",
      tags: ["string"],
      source: { kind: "pdf | image | voice | text | mixed", files: [{ name: "string", reference: "string", pages: [1] }], userInstruction: "string" },
      steps: [
        {
          instruction: "string",
          duration: "string (optional)",
          temperature: "string (optional)",
          materials: [{ name: "string", amount: "string?", unit: "string?", gradeOrLot: "string?", sourceReference: "string?" }],
          sourceReference: "string (optional)",
          needsReview: ["string"]
        }
      ],
      needsReview: ["string"]
    },
    example: {
      title: "Heat-shock transformation of DH5α competent E. coli",
      summary: "Imported from a vendor insert. Heat-shock time and DNA amount need confirmation before use.",
      category: "Molecular biology",
      tags: ["transformation", "E. coli", "DH5α"],
      source: { kind: "pdf", files: [{ name: "transformation.pdf", reference: "demo-file-001", pages: [1] }], userInstruction: "Import as a review draft for Wang Lab." },
      steps: [
        {
          instruction: "Thaw competent cells on ice.",
          duration: "~10 min",
          materials: [{ name: "DH5α competent cells", amount: "50", unit: "µL", sourceReference: "transformation.pdf p.1" }],
          sourceReference: "transformation.pdf p.1",
          needsReview: []
        }
      ],
      needsReview: ["Confirm heat-shock duration (source lists 30 s, some lots 45 s)."]
    }
  };
}
