import { NextResponse } from "next/server";
import { z } from "zod";

import { getPatient, type PatientRecord } from "@/components/console/console-data";
import {
  extractJsonObject,
  liveWarRoomSnapshotSchema,
  partialLiveWarRoomSnapshotSchema,
  type LiveWarRoomSnapshot,
} from "@/lib/console-live";
import { getHolterBreakdown } from "@/lib/holter-breakdown";
import { getKnowledgeGraphContext } from "@/lib/knowledge-graph";

export const runtime = "nodejs";

const anthropicModel = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

const requestSchema = z.object({
  patientId: z.string().min(1),
  vitals: z.object({
    consensusScore: z.string().min(1),
    heartRate: z.number().min(30).max(220),
    perfusion: z.string().min(1),
    perspiration: z.string().min(1),
    rigidity: z.string().min(1),
  }),
});

async function buildConsolePrompt(patientId: string, vitals: z.infer<typeof requestSchema>["vitals"]) {
  const patient = getPatient(patientId);

  if (!patient) {
    throw new Error("Patient not found.");
  }

  const critical = patient.warRoom.alertTone === "critical";
  const knowledgeGraphContext = await getKnowledgeGraphContext(patientId);
  const holterBreakdown = await getHolterBreakdown(patientId);
  const context = {
    patient: {
      apparentAge: patient.apparentAge,
      baselineRead: patient.baselineRead,
      chiefInstruction: patient.chiefInstruction,
      code: patient.code,
      condition: patient.condition,
      currentAlertLabel: patient.warRoom.alertLabel,
      currentVerdictBadge: patient.warRoom.liveVerdictBadge,
      currentVerdictChip: patient.warRoom.liveVerdictChip,
      faceReadSummary: patient.faceReadSummary,
      id: patient.id,
      location: patient.location,
      monitoringMode: patient.monitoringMode,
      name: patient.name,
      persona: patient.persona,
      riskLevel: patient.riskLevel,
      summary: patient.summary,
      watchlist: patient.watchlist,
    },
    scenario: {
      alertThreshold: patient.warRoom.vitalProfile.alertThreshold,
      alertTone: patient.warRoom.alertTone,
      ecgLabel: patient.warRoom.ecgLabel,
      holterBreakdown,
      holterPayload: holterBreakdown.payload,
      historicalGraphPayload: knowledgeGraphContext.payload,
      knowledgeGraph: knowledgeGraphContext,
      patientVideo: patient.warRoom.videoLabel,
      signalRows: patient.warRoom.signalRows,
      survivingEvidence: patient.warRoom.survivingEvidence,
      visionCues: patient.warRoom.visionCues,
    },
    agents: patient.warRoom.agents.map((agent) => ({
      headline: agent.headline,
      id: agent.id,
      inputs: agent.inputs,
      metrics: agent.metrics,
      name: agent.name,
      role: agent.role,
      summary: agent.summary,
    })),
    vitals,
  };

  return {
    critical,
    prompt: [
      "Return valid JSON only.",
      "You are generating live war-room copy for a clinical surveillance demo called ~n0.",
      "Do not mention AI, prompts, JSON, LLMs, or simulations.",
      "Keep the current scenario intact: do not flip a normal case into critical or a critical case into normal.",
      "Preserve the existing visual language: concise, technical, clinical, and readable on a dashboard.",
      "The former Pharma lane has been rotated into a historical graph cross-check lane. Keep its id as 'pharma' but write it as a topological nearest-case specialist rather than a medication auditor.",
      "The Bio lane has access to a Holter cross-reference payload. Write it like an electrical-signal specialist using the Holter context when it strengthens or calms the case.",
      critical
        ? "For this critical case, emphasize predictive deterioration before overt collapse. The heart rate can remain below a classic ICU tachycardia alarm while still being unstable and medically concerning."
        : "For this normal case, keep the room calm, low-risk, and clearly below escalation threshold.",
      "Generate all six agent voices, a refreshed Chief terminal, signal synthesis, surviving evidence, report sections, and report events.",
      "Every agent must sound specialized and medically plausible.",
      "Use the current vitals and patient context as ground truth.",
      "The Holter payload is authoritative for the Bio lane and can influence the Chief terminal plus report language.",
      "The knowledge-graph payload is authoritative historical context and should influence the graph-cross-check agent plus the Chief terminal.",
      "Schema requirements:",
      "- agents: exactly 6 entries with ids vision, bio, archive, pharma, redteam, chief",
      "- signalCards: exactly 4 metrics",
      "- signalRows: exactly 4 rows",
      "- terminalLines: 8 to 10 lines",
      "- reportSections: 4 to 5 sections",
      "- reportEvents: 4 to 6 events",
      "- visionCues.audioBars: exactly 6 integer bars between 5 and 100",
      "Context JSON:",
      JSON.stringify(context, null, 2),
      "Return a single JSON object with keys:",
      "alertLabel, bottomNote, chiefInstruction, ecgLabel, liveVerdictBadge, liveVerdictChip, signalCards, signalRows, survivingEvidence, terminalLines, reportSections, reportEvents, visionCues, agents",
    ].join("\n"),
  };
}

function buildBaseSnapshot(patient: PatientRecord): LiveWarRoomSnapshot {
  return {
    agents: patient.warRoom.agents.map((agent) => ({
      checks: agent.checks,
      conclusions: agent.conclusions,
      headline: agent.headline,
      id: agent.id as LiveWarRoomSnapshot["agents"][number]["id"],
      inputs: agent.inputs,
      metrics: agent.metrics,
      quoteStream: agent.quoteStream,
      summary: agent.summary,
    })),
    alertLabel: patient.warRoom.alertLabel,
    bottomNote: patient.warRoom.bottomNote,
    chiefInstruction: patient.chiefInstruction,
    ecgLabel: patient.warRoom.ecgLabel,
    liveVerdictBadge: patient.warRoom.liveVerdictBadge,
    liveVerdictChip: patient.warRoom.liveVerdictChip,
    reportEvents: patient.warRoom.reportEvents,
    reportSections: patient.warRoom.reportSections,
    signalCards: patient.warRoom.signalCards,
    signalRows: patient.warRoom.signalRows,
    survivingEvidence: patient.warRoom.survivingEvidence,
    terminalLines: patient.warRoom.terminalLines,
    visionCues: patient.warRoom.visionCues,
  };
}

function mergeMetricArrays(
  baseMetrics: LiveWarRoomSnapshot["signalCards"],
  nextMetrics: unknown,
) {
  if (!Array.isArray(nextMetrics) || nextMetrics.length === 0) {
    return baseMetrics;
  }

  return baseMetrics.map((metric, index) => {
    const candidate = nextMetrics[index];

    if (!candidate || typeof candidate !== "object") {
      return metric;
    }

    const nextMetric = candidate as Partial<typeof metric>;

    return {
      label: typeof nextMetric.label === "string" && nextMetric.label ? nextMetric.label : metric.label,
      note: typeof nextMetric.note === "string" && nextMetric.note ? nextMetric.note : metric.note,
      value: typeof nextMetric.value === "string" && nextMetric.value ? nextMetric.value : metric.value,
    };
  });
}

function mergeSnapshot(baseSnapshot: LiveWarRoomSnapshot, rawCandidate: unknown): LiveWarRoomSnapshot {
  const parsedCandidate = partialLiveWarRoomSnapshotSchema.safeParse(rawCandidate);

  if (!parsedCandidate.success) {
    return baseSnapshot;
  }

  const candidate = parsedCandidate.data;
  const nextAgentMap = new Map(candidate.agents?.map((agent) => [agent.id, agent]) ?? []);

  return liveWarRoomSnapshotSchema.parse({
    ...baseSnapshot,
    agents: baseSnapshot.agents.map((agent) => {
      const nextAgent = nextAgentMap.get(agent.id);

      if (!nextAgent) {
        return agent;
      }

      return {
        ...agent,
        checks: nextAgent.checks?.length ? nextAgent.checks : agent.checks,
        conclusions: nextAgent.conclusions?.length ? nextAgent.conclusions : agent.conclusions,
        headline: nextAgent.headline ?? agent.headline,
        inputs: nextAgent.inputs?.length ? nextAgent.inputs : agent.inputs,
        metrics: mergeMetricArrays(agent.metrics, nextAgent.metrics),
        quoteStream: nextAgent.quoteStream?.length ? nextAgent.quoteStream : agent.quoteStream,
        summary: nextAgent.summary ?? agent.summary,
      };
    }),
    alertLabel: candidate.alertLabel ?? baseSnapshot.alertLabel,
    bottomNote: candidate.bottomNote ?? baseSnapshot.bottomNote,
    chiefInstruction: candidate.chiefInstruction ?? baseSnapshot.chiefInstruction,
    ecgLabel: candidate.ecgLabel ?? baseSnapshot.ecgLabel,
    liveVerdictBadge: candidate.liveVerdictBadge ?? baseSnapshot.liveVerdictBadge,
    liveVerdictChip: candidate.liveVerdictChip ?? baseSnapshot.liveVerdictChip,
    reportEvents: Array.isArray(candidate.reportEvents) && candidate.reportEvents.length
      ? baseSnapshot.reportEvents.map((event, index) => {
          const nextEvent = candidate.reportEvents?.[index];

          if (!nextEvent) {
            return event;
          }

          return {
            decision: nextEvent.decision ?? event.decision,
            medical: nextEvent.medical ?? event.medical,
            technical: nextEvent.technical ?? event.technical,
            time: nextEvent.time ?? event.time,
            title: nextEvent.title ?? event.title,
          };
        })
      : baseSnapshot.reportEvents,
    reportSections: Array.isArray(candidate.reportSections) && candidate.reportSections.length
      ? baseSnapshot.reportSections.map((section, index) => {
          const nextSection = candidate.reportSections?.[index];

          if (!nextSection) {
            return section;
          }

          return {
            bullets: nextSection.bullets?.length ? nextSection.bullets : section.bullets,
            summary: nextSection.summary ?? section.summary,
            title: nextSection.title ?? section.title,
          };
        })
      : baseSnapshot.reportSections,
    signalCards: mergeMetricArrays(baseSnapshot.signalCards, candidate.signalCards),
    signalRows: Array.isArray(candidate.signalRows) && candidate.signalRows.length
      ? baseSnapshot.signalRows.map((row, index) => {
          const nextRow = candidate.signalRows?.[index];

          if (!nextRow) {
            return row;
          }

          return {
            detail: nextRow.detail ?? row.detail,
            title: nextRow.title ?? row.title,
          };
        })
      : baseSnapshot.signalRows,
    survivingEvidence: Array.isArray(candidate.survivingEvidence) && candidate.survivingEvidence.length
      ? baseSnapshot.survivingEvidence.map((evidence, index) => {
          const nextEvidence = candidate.survivingEvidence?.[index];

          if (!nextEvidence) {
            return evidence;
          }

          return {
            detail: nextEvidence.detail ?? evidence.detail,
            source: nextEvidence.source ?? evidence.source,
          };
        })
      : baseSnapshot.survivingEvidence,
    terminalLines:
      candidate.terminalLines?.filter((line): line is string => typeof line === "string" && line.trim().length > 0).length
        ? candidate.terminalLines.filter((line): line is string => typeof line === "string" && line.trim().length > 0)
        : baseSnapshot.terminalLines,
    visionCues: candidate.visionCues
      ? {
          audioBars:
            candidate.visionCues.audioBars?.length === 6 ? candidate.visionCues.audioBars : baseSnapshot.visionCues.audioBars,
          audioCueTags:
            candidate.visionCues.audioCueTags?.length ? candidate.visionCues.audioCueTags : baseSnapshot.visionCues.audioCueTags,
          audioStatus: candidate.visionCues.audioStatus ?? baseSnapshot.visionCues.audioStatus,
          bodyScanStatus: candidate.visionCues.bodyScanStatus ?? baseSnapshot.visionCues.bodyScanStatus,
          faceCueTags:
            candidate.visionCues.faceCueTags?.length ? candidate.visionCues.faceCueTags : baseSnapshot.visionCues.faceCueTags,
          faceStatus: candidate.visionCues.faceStatus ?? baseSnapshot.visionCues.faceStatus,
          sensorConfidence: candidate.visionCues.sensorConfidence ?? baseSnapshot.visionCues.sensorConfidence,
        }
      : baseSnapshot.visionCues,
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is missing on the server." },
      { status: 503 },
    );
  }

  try {
    const parsedRequest = requestSchema.parse(await request.json());
    const patient = getPatient(parsedRequest.patientId);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const { prompt } = await buildConsolePrompt(parsedRequest.patientId, parsedRequest.vitals);
    const baseSnapshot = buildBaseSnapshot(patient);

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        max_tokens: 3200,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: anthropicModel,
        temperature: 0.4,
      }),
      cache: "no-store",
    });

    const anthropicJson = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      const errorMessage =
        typeof anthropicJson?.error?.message === "string"
          ? anthropicJson.error.message
          : "Anthropic request failed.";

      return NextResponse.json({ error: errorMessage }, { status: anthropicResponse.status });
    }

    const responseText = Array.isArray(anthropicJson?.content)
      ? anthropicJson.content
          .filter((item: { type?: string; text?: string }) => item.type === "text")
          .map((item: { text?: string }) => item.text ?? "")
          .join("\n")
      : "";

    const snapshot = mergeSnapshot(baseSnapshot, extractJsonObject(responseText));

    return NextResponse.json({ snapshot }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Live console payload validation failed.", details: error.flatten() },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "Unknown console inference error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
