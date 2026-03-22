import { z } from "zod";

export const relayModeStorageKey = "n0-war-room-relay-mode";

export const relayModeSchema = z.enum(["cached", "live"]);
export type RelayMode = z.infer<typeof relayModeSchema>;

export const liveConsoleMetricSchema = z.object({
  label: z.string().min(1).max(60),
  note: z.string().min(1).max(80).optional(),
  value: z.string().min(1).max(80),
});

const signalRowSchema = z.object({
  detail: z.string().min(1).max(280),
  title: z.string().min(1).max(60),
});

const evidenceSchema = z.object({
  detail: z.string().min(1).max(260),
  source: z.string().min(1).max(40),
});

const reportSectionSchema = z.object({
  bullets: z.array(z.string().min(1).max(180)).min(2).max(5),
  summary: z.string().min(1).max(280),
  title: z.string().min(1).max(80),
});

const reportEventSchema = z.object({
  decision: z.string().min(1).max(220),
  medical: z.string().min(1).max(220),
  technical: z.string().min(1).max(220),
  time: z.string().min(1).max(24),
  title: z.string().min(1).max(80),
});

const visionCueSchema = z.object({
  audioBars: z.array(z.number().int().min(5).max(100)).length(6),
  audioCueTags: z.array(z.string().min(1).max(40)).min(2).max(4),
  audioStatus: z.string().min(1).max(60),
  bodyScanStatus: z.string().min(1).max(60),
  faceCueTags: z.array(z.string().min(1).max(40)).min(2).max(4),
  faceStatus: z.string().min(1).max(100),
  sensorConfidence: z.string().min(1).max(30),
});

const agentIdSchema = z.enum(["vision", "bio", "archive", "pharma", "redteam", "chief"]);

const liveAgentSchema = z.object({
  checks: z.array(z.string().min(1).max(180)).min(3).max(5),
  conclusions: z.array(z.string().min(1).max(180)).min(3).max(5),
  headline: z.string().min(1).max(120),
  id: agentIdSchema,
  inputs: z.array(z.string().min(1).max(80)).min(3).max(5),
  metrics: z.array(liveConsoleMetricSchema).min(3).max(4),
  quoteStream: z.array(z.string().min(1).max(180)).min(3).max(4),
  summary: z.string().min(1).max(320),
});

export const liveWarRoomSnapshotSchema = z.object({
  agents: z.array(liveAgentSchema).length(6),
  alertLabel: z.string().min(1).max(60),
  bottomNote: z.string().min(1).max(280),
  chiefInstruction: z.string().min(1).max(240),
  ecgLabel: z.string().min(1).max(80),
  liveVerdictBadge: z.string().min(1).max(60),
  liveVerdictChip: z.string().min(1).max(60),
  reportEvents: z.array(reportEventSchema).min(4).max(6),
  reportSections: z.array(reportSectionSchema).min(4).max(5),
  signalCards: z.array(liveConsoleMetricSchema).length(4),
  signalRows: z.array(signalRowSchema).length(4),
  survivingEvidence: z.array(evidenceSchema).min(3).max(5),
  terminalLines: z.array(z.string().min(1).max(220)).min(8).max(10),
  visionCues: visionCueSchema,
});

export type LiveWarRoomSnapshot = z.infer<typeof liveWarRoomSnapshotSchema>;

const partialConsoleMetricSchema = liveConsoleMetricSchema.partial();
const partialSignalRowSchema = signalRowSchema.partial();
const partialEvidenceSchema = evidenceSchema.partial();
const partialReportSectionSchema = reportSectionSchema.partial();
const partialReportEventSchema = reportEventSchema.partial();
const partialVisionCueSchema = visionCueSchema.partial();
const partialLiveAgentSchema = liveAgentSchema.partial().extend({
  id: agentIdSchema,
});

export const partialLiveWarRoomSnapshotSchema = z
  .object({
    agents: z.array(partialLiveAgentSchema).optional(),
    alertLabel: z.string().optional(),
    bottomNote: z.string().optional(),
    chiefInstruction: z.string().optional(),
    ecgLabel: z.string().optional(),
    liveVerdictBadge: z.string().optional(),
    liveVerdictChip: z.string().optional(),
    reportEvents: z.array(partialReportEventSchema).optional(),
    reportSections: z.array(partialReportSectionSchema).optional(),
    signalCards: z.array(partialConsoleMetricSchema).optional(),
    signalRows: z.array(partialSignalRowSchema).optional(),
    survivingEvidence: z.array(partialEvidenceSchema).optional(),
    terminalLines: z.array(z.string()).optional(),
    visionCues: partialVisionCueSchema.optional(),
  })
  .passthrough();

export function extractJsonObject(rawText: string) {
  const fencedMatch = rawText.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] ?? rawText;
  const startIndex = candidate.indexOf("{");
  const endIndex = candidate.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("No JSON object found in model response.");
  }

  return JSON.parse(candidate.slice(startIndex, endIndex + 1));
}
