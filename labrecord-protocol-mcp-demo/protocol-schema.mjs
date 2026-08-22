import { z } from "zod";

const text = z.string().trim().min(1);

export const protocolDraftSchema = z.object({
  title: text.max(160),
  summary: z.string().trim().max(1200).default(""),
  category: text.max(80),
  tags: z.array(text.max(50)).max(12).default([]),
  source: z.object({
    kind: z.enum(["pdf", "image", "voice", "text", "mixed"]),
    files: z.array(z.object({
      name: text.max(255),
      reference: text.max(500),
      pages: z.array(z.number().int().positive()).max(200).optional()
    }).strict()).max(20).default([]),
    userInstruction: z.string().trim().max(2000).default("")
  }).strict(),
  steps: z.array(z.object({
    instruction: text.max(3000),
    duration: z.string().trim().max(80).optional(),
    temperature: z.string().trim().max(80).optional(),
    materials: z.array(z.object({
      name: text.max(200),
      amount: z.string().trim().max(80).optional(),
      unit: z.string().trim().max(40).optional(),
      gradeOrLot: z.string().trim().max(100).optional(),
      sourceReference: z.string().trim().max(160).optional()
    }).strict()).max(30).default([]),
    sourceReference: z.string().trim().max(160).optional(),
    needsReview: z.array(z.string().trim().max(200)).max(10).default([])
  }).strict()).min(1).max(100),
  needsReview: z.array(z.string().trim().max(240)).max(30).default([])
}).strict();

export const createProtocolInputSchema = z.object({
  protocol: protocolDraftSchema,
  importNote: z.string().trim().max(1000).optional()
}).strict();

export function publicSchemaDescription() {
  return {
    schemaVersion: "labrecord.protocol-draft.v1",
    policy: [
      "Create a draft, never publish automatically.",
      "Do not invent quantities, temperatures, timings, lot numbers, or safety information.",
      "Put uncertain or missing facts in needsReview.",
      "Attach source page or image-region references whenever they are available.",
      "The calling user must be authorized for the Lab; Lab identity is server-controlled."
    ],
    example: {
      title: "Chemical transformation of DH5α",
      summary: "Draft extracted from a vendor protocol; verify recovery medium volume.",
      category: "Molecular biology",
      tags: ["transformation", "E. coli"],
      source: { kind: "pdf", files: [{ name: "competent-cells.pdf", reference: "file_abc", pages: [1, 2] }], userInstruction: "Import as a draft." },
      steps: [{
        instruction: "Thaw competent cells on ice.",
        materials: [{ name: "DH5α competent cells", amount: "50", unit: "µL", sourceReference: "competent-cells.pdf p. 1" }],
        sourceReference: "competent-cells.pdf p. 1",
        needsReview: []
      }],
      needsReview: ["Confirm the recovery medium and incubation settings before publishing."]
    }
  };
}
