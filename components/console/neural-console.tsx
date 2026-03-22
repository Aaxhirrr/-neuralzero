"use client";

import Link from "next/link";
import { startTransition, useEffect, useEffectEvent, useId, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  Crown,
  Download,
  Eye,
  FileText,
  GitBranch,
  HeartPulse,
  Moon,
  Shield,
  Sun,
  Volume2,
  VolumeX,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  setupChain,
  type AgentDefinition,
  type HistoricalGraphDefinition,
  type HolterBreakdownDefinition,
  type PatientRecord,
} from "@/components/console/console-data";
import { relayModeStorageKey, type LiveWarRoomSnapshot, type RelayMode } from "@/lib/console-live";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const defaultFaceLockBox = {
  height: 18.5,
  width: 16.5,
  x: 58.5,
  y: 45.2,
};

const criticalFaceLockBox = {
  height: 16.8,
  width: 13.8,
  x: 46.8,
  y: 37.6,
};

const bodyScanPolygon = [
  { x: 43.5, y: 41.5 },
  { x: 56.5, y: 39.5 },
  { x: 73.5, y: 43.5 },
  { x: 82.5, y: 58 },
  { x: 80.5, y: 73 },
  { x: 71.5, y: 95.5 },
  { x: 51.5, y: 99 },
  { x: 38.5, y: 90.5 },
  { x: 33.5, y: 76.5 },
  { x: 35.5, y: 56 },
];

function formatOverlayPoints(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x * 100},${point.y * 100}`).join(" ");
}

type LiveVitals = {
  consensusScore: string;
  heartRate: number;
  perfusion: string;
  perspiration: string;
  rigidity: string;
};

function isCriticalPatient(patient: PatientRecord) {
  return patient.warRoom.alertTone === "critical";
}

function getAlertBadgeClasses(patient: PatientRecord) {
  return isCriticalPatient(patient)
    ? "rounded-full border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] text-red-600 dark:text-red-300"
    : "rounded-full border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-700 dark:text-emerald-300";
}

function getVerdictChipClasses(patient: PatientRecord) {
  return isCriticalPatient(patient)
    ? "rounded-[18px] border border-red-500/20 bg-red-500/10 px-3 py-2 font-mono text-sm text-red-700 dark:text-red-300"
    : "rounded-[18px] border border-emerald-500/15 bg-emerald-500/8 px-3 py-2 font-mono text-sm text-emerald-700 dark:text-emerald-300";
}

function getRelayChipLabel(mode: RelayMode, status: "idle" | "loading" | "ready" | "error") {
  if (mode === "live") {
    if (status === "loading") {
      return "relay syncing";
    }

    if (status === "error") {
      return "relay degraded";
    }

    return "relay live";
  }

  return "relay cached";
}

function getRelayChipClasses(mode: RelayMode, status: "idle" | "loading" | "ready" | "error") {
  if (mode === "live") {
    if (status === "error") {
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    }

    if (status === "loading") {
      return "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    }

    return "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300";
  }

  return "border-foreground/10 bg-background/70 text-muted-foreground";
}

function mergeLiveAgents(baseAgents: AgentDefinition[], liveAgents: LiveWarRoomSnapshot["agents"] | undefined) {
  if (!liveAgents?.length) {
    return baseAgents;
  }

  const liveAgentMap = new Map<string, LiveWarRoomSnapshot["agents"][number]>(
    liveAgents.map((agent) => [agent.id, agent]),
  );

  return baseAgents.map((agent) => {
    const liveAgent = liveAgentMap.get(agent.id);

    if (!liveAgent) {
      return agent;
    }

    return {
      ...agent,
      ...liveAgent,
      checks: liveAgent.checks.length ? liveAgent.checks : agent.checks,
      conclusions: liveAgent.conclusions.length ? liveAgent.conclusions : agent.conclusions,
      inputs: liveAgent.inputs.length ? liveAgent.inputs : agent.inputs,
      metrics: liveAgent.metrics.length ? liveAgent.metrics : agent.metrics,
      quoteStream: liveAgent.quoteStream.length ? liveAgent.quoteStream : agent.quoteStream,
    };
  });
}

function buildReportText(patient: PatientRecord, vitals: LiveVitals) {
  const report = patient.warRoom;
  const critical = isCriticalPatient(patient);
  const confidenceValue = critical
    ? `${Math.round(Number(vitals.consensusScore) * 100)}% alert confidence`
    : `${Math.round((1 - Number(vitals.consensusScore)) * 100)}% stable confidence`;
  const impression = critical
    ? "Autonomous surveillance identified a concordant visual, audio, and biometric distress pattern concerning for acute cardiopulmonary compromise."
    : "Autonomous surveillance did not identify a concordant distress pattern and the current relay remains compatible with baseline-safe monitoring.";
  const disposition = critical
    ? "Immediate bedside review, rapid-response notification, vitals confirmation, and physician escalation."
    : "Continue passive monitoring with no escalation at the current time.";

  const sections = report.reportSections
    .map(
      (section) =>
        `${section.title}\nAssessment: ${section.summary}\n${section.bullets.map((bullet) => `- ${bullet}`).join("\n")}`,
    )
    .join("\n\n");

  const events = report.reportEvents
    .map(
      (event) =>
        `${event.time} | ${event.title}\nTechnical: ${event.technical}\nMedical: ${event.medical}\nDecision: ${event.decision}`,
    )
    .join("\n\n");

  return [
    "AUTONOMOUS CARDIAC SURVEILLANCE REPORT",
    "",
    `Patient: ${patient.name}`,
    `Patient ID: ${patient.code}`,
    `Location: ${patient.location}`,
    `Scenario: ${patient.condition}`,
    `Monitoring Mode: ${patient.monitoringMode}`,
    "",
    "PRIMARY CLINICAL IMPRESSION",
    impression,
    "",
    "RECOMMENDED DISPOSITION",
    disposition,
    "",
    "CURRENT OBJECTIVE FINDINGS",
    `- Chief instruction: ${patient.chiefInstruction}`,
    `- Alert state: ${report.alertLabel}`,
    `- Consensus score: ${vitals.consensusScore}`,
    `- Heart rate estimate: ${vitals.heartRate} BPM`,
    `- Perfusion estimate: ${vitals.perfusion}%`,
    `- Perspiration index: ${vitals.perspiration}`,
    `- HRV rigidity: ${vitals.rigidity}`,
    `- Confidence: ${confidenceValue}`,
    "",
    "SURVEILLANCE ASSESSMENT",
    sections,
    "",
    "CHRONOLOGY OF EVENTS",
    events,
  ].join("\n");
}

// Small synthetic ECG loop for the demo instrument strip under the main relay.
function createEcgPath(phase: number, critical = false) {
  const width = 1000;
  const segments = 260;
  const cycles = critical ? 4.35 : 4;
  const baseY = critical ? 80 : 78;

  let path = "";

  for (let index = 0; index <= segments; index += 1) {
    const x = (index / segments) * width;
    const t = ((index / segments) * cycles + phase / 28) % 1;
    let y = baseY + Math.sin((index + phase) * 0.16) * (critical ? 2.2 : 1.2);

    if (t >= 0.12 && t < 0.19) {
      const u = (t - 0.12) / 0.07;
      y = baseY - Math.sin(Math.PI * u) * 6;
    } else if (t >= 0.22 && t < 0.235) {
      const u = (t - 0.22) / 0.015;
      y = baseY + u * 7;
    } else if (t >= 0.235 && t < 0.255) {
      const u = (t - 0.235) / 0.02;
      y = baseY + 7 - u * 56;
    } else if (t >= 0.255 && t < 0.285) {
      const u = (t - 0.255) / 0.03;
      y = baseY - 49 + u * 68;
    } else if (t >= 0.285 && t < 0.34) {
      const u = (t - 0.285) / 0.055;
      y = baseY + 19 - u * 19;
    } else if (t >= 0.42 && t < 0.56) {
      const u = (t - 0.42) / 0.14;
      y = baseY - Math.sin(Math.PI * u) * (critical ? 11 : 15);
    }

    if (critical) {
      y += Math.sin((index + phase) * 0.33) * 2.4;
      if (t >= 0.58 && t < 0.67) {
        const u = (t - 0.58) / 0.09;
        y = baseY - Math.sin(Math.PI * u) * 5.5;
      }
    }

    path += `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }

  return path.trim();
}

const agentIcons: Record<string, LucideIcon> = {
  vision: Eye,
  bio: Activity,
  archive: FileText,
  pharma: GitBranch,
  redteam: Shield,
  chief: Crown,
};

const darkAgentToneMap: Record<
  string,
  {
    badge: string;
    border: string;
    headline: string;
    icon: string;
    overlay: string;
  }
> = {
  vision: {
    border: "border-rose-500/25",
    overlay: "bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.14),transparent_48%)]",
    icon: "bg-rose-500/12 text-rose-200 ring-1 ring-rose-500/20",
    headline: "text-rose-300",
    badge: "border border-rose-500/20 bg-rose-500/12 text-rose-100",
  },
  bio: {
    border: "border-emerald-500/25",
    overlay: "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_48%)]",
    icon: "bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-500/20",
    headline: "text-emerald-300",
    badge: "border border-emerald-500/20 bg-emerald-500/12 text-emerald-100",
  },
  archive: {
    border: "border-sky-500/25",
    overlay: "bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_48%)]",
    icon: "bg-sky-500/12 text-sky-200 ring-1 ring-sky-500/20",
    headline: "text-sky-300",
    badge: "border border-sky-500/20 bg-sky-500/12 text-sky-100",
  },
  pharma: {
    border: "border-amber-500/25",
    overlay: "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_48%)]",
    icon: "bg-amber-500/12 text-amber-200 ring-1 ring-amber-500/20",
    headline: "text-amber-300",
    badge: "border border-amber-500/20 bg-amber-500/12 text-amber-100",
  },
  redteam: {
    border: "border-red-500/25",
    overlay: "bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.14),transparent_48%)]",
    icon: "bg-red-500/12 text-red-200 ring-1 ring-red-500/20",
    headline: "text-red-300",
    badge: "border border-red-500/20 bg-red-500/12 text-red-100",
  },
  chief: {
    border: "border-stone-400/20",
    overlay: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_48%)]",
    icon: "bg-white/10 text-white ring-1 ring-white/12",
    headline: "text-stone-100",
    badge: "border border-white/10 bg-white/8 text-stone-100",
  },
};

function HistoricalGraphPanel({ graph }: { graph: HistoricalGraphDefinition }) {
  const defaultNodeId =
    graph.nodes.find((node) => node.kind === "case" && node.highlight)?.id ??
    graph.nodes.find((node) => node.kind === "patient")?.id ??
    graph.nodes[0]?.id ??
    "";
  const [selectedNodeId, setSelectedNodeId] = useState(defaultNodeId);

  useEffect(() => {
    setSelectedNodeId(defaultNodeId);
  }, [defaultNodeId]);

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const selectedNode = nodeMap.get(selectedNodeId) ?? graph.nodes[0];
  const selectedEdges = graph.edges.filter((edge) => edge.from === selectedNode?.id || edge.to === selectedNode?.id);
  const selectedNodeIds = new Set([selectedNode?.id, ...selectedEdges.map((edge) => edge.from), ...selectedEdges.map((edge) => edge.to)]);

  const nodeStyleMap = {
    patient: {
      fill: "from-stone-900 via-stone-800 to-stone-700",
      glow: "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_36px_rgba(28,25,23,0.38)]",
      ring: "ring-stone-400/45",
      text: "text-stone-50",
    },
    trait: {
      fill: "from-emerald-100 via-white to-emerald-50",
      glow: "shadow-[0_0_0_1px_rgba(16,185,129,0.16),0_0_28px_rgba(110,231,183,0.32)]",
      ring: "ring-emerald-300/60",
      text: "text-emerald-700",
    },
    case: {
      fill: "from-amber-50 via-white to-orange-50",
      glow: "shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_0_32px_rgba(245,158,11,0.24)]",
      ring: "ring-amber-300/60",
      text: "text-amber-700",
    },
    drug: {
      fill: "from-sky-50 via-white to-blue-50",
      glow: "shadow-[0_0_0_1px_rgba(56,189,248,0.14),0_0_24px_rgba(125,211,252,0.26)]",
      ring: "ring-sky-300/60",
      text: "text-sky-700",
    },
    outcome: {
      fill: "from-rose-50 via-white to-red-50",
      glow: "shadow-[0_0_0_1px_rgba(248,113,113,0.18),0_0_30px_rgba(248,113,113,0.24)]",
      ring: "ring-red-300/60",
      text: "text-red-700",
    },
  } satisfies Record<HistoricalGraphDefinition["nodes"][number]["kind"], { fill: string; glow: string; ring: string; text: string }>;

  function getRelationshipLabel(edge: HistoricalGraphDefinition["edges"][number]) {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);

    if (!fromNode || !toNode) {
      return "linked";
    }

    if (fromNode.kind === "patient" && toNode.kind === "trait") {
      return "presents";
    }

    if (fromNode.kind === "case" && toNode.kind === "trait") {
      return edge.highlight ? "shared trait" : "partial trait";
    }

    if (fromNode.kind === "case" && toNode.kind === "drug") {
      return "historical med";
    }

    if (fromNode.kind === "case" && toNode.kind === "outcome") {
      return "historical outcome";
    }

    return "linked";
  }

  function getNodeCaption(node: HistoricalGraphDefinition["nodes"][number]) {
    if (node.detail) {
      return node.detail;
    }

    if (node.kind === "patient") {
      return "Current monitored patient";
    }

    if (node.kind === "case") {
      return node.highlight ? "Nearest historical match" : "Competing decoy case";
    }

    if (node.kind === "trait") {
      return "Clinical vector";
    }

    if (node.kind === "drug") {
      return "Historical medication context";
    }

    return "Historical trajectory";
  }

  return (
    <div className="mt-6 rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Knowledge graph</div>
          <h4 className="mt-3 text-xl font-semibold text-foreground">{graph.title}</h4>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{graph.subtitle}</p>
        </div>
        <Badge className="w-fit rounded-full border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-700">
          interactive graph
        </Badge>
      </div>

      <div className="mt-5">
        <div className="rounded-[26px] border border-foreground/10 bg-background/80 p-4">
          <div className="relative h-[480px] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] lg:h-[540px] xl:h-[600px]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(120,113,108,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(120,113,108,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />

            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="graph-edge-hot" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.95)" />
                  <stop offset="55%" stopColor="rgba(245,158,11,0.92)" />
                  <stop offset="100%" stopColor="rgba(248,113,113,0.92)" />
                </linearGradient>
              </defs>

              {graph.edges.map((edge) => {
                const fromNode = nodeMap.get(edge.from);
                const toNode = nodeMap.get(edge.to);

                if (!fromNode || !toNode) {
                  return null;
                }

                const isActive = selectedEdges.some(
                  (selectedEdge) => selectedEdge.from === edge.from && selectedEdge.to === edge.to,
                );
                const offset = Math.abs(toNode.x - fromNode.x) > Math.abs(toNode.y - fromNode.y) ? 8 : 5;
                const controlX1 = fromNode.x + (toNode.x > fromNode.x ? offset : -offset);
                const controlY1 = fromNode.y;
                const controlX2 = toNode.x + (toNode.x > fromNode.x ? -offset : offset);
                const controlY2 = toNode.y;

                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={`M ${fromNode.x} ${fromNode.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toNode.x} ${toNode.y}`}
                    fill="none"
                    stroke={isActive || edge.highlight ? "url(#graph-edge-hot)" : "rgba(120,113,108,0.22)"}
                    strokeWidth={isActive || edge.highlight ? "0.62" : "0.3"}
                    strokeDasharray={isActive || edge.highlight ? undefined : "1.1 1.6"}
                    opacity={selectedNode ? (isActive || edge.highlight ? 1 : 0.42) : 1}
                  />
                );
              })}
            </svg>

            {graph.nodes.map((node) => {
              const isSelected = node.id === selectedNode?.id;
              const isConnected = selectedNodeIds.has(node.id);
              const style = nodeStyleMap[node.kind];
              const labelLines = node.label.split("\n");

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center transition-transform duration-300 hover:scale-105"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div
                    className={cn(
                      "relative flex items-center justify-center rounded-full bg-gradient-to-br ring-1 transition-all duration-300",
                      style.fill,
                      style.glow,
                      style.ring,
                      isSelected
                        ? "h-16 w-16 scale-105 lg:h-[72px] lg:w-[72px]"
                        : node.kind === "patient" || node.kind === "case" || node.kind === "outcome"
                          ? "h-14 w-14 lg:h-16 lg:w-16"
                          : "h-11 w-11 lg:h-12 lg:w-12",
                      selectedNode && !isConnected ? "opacity-35" : "opacity-100",
                    )}
                  >
                    <div className="absolute inset-[12%] rounded-full border border-white/35" />
                    <div className="absolute inset-[26%] rounded-full bg-white/55" />
                  </div>

                  <div
                    className={cn(
                      "mt-2 text-[10px] font-semibold leading-snug lg:text-[11px]",
                      style.text,
                      selectedNode && !isConnected ? "opacity-40" : "opacity-100",
                    )}
                  >
                    {labelLines.map((line) => (
                      <div key={`${node.id}-${line}`}>{line}</div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <div className="rounded-[26px] border border-foreground/10 bg-background/80 p-5">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Selected node</div>
            <h5 className="mt-3 text-xl font-semibold text-foreground">{selectedNode?.label.replaceAll("\n", " ")}</h5>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selectedNode ? getNodeCaption(selectedNode) : ""}</p>

            <div className="mt-4 rounded-[20px] border border-foreground/10 bg-foreground/[0.03] p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Graph read</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Tap any node to follow the active clinical path. The brighter route marks the strongest historical match
                currently influencing CrossCheck.
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-foreground/10 bg-background/80 p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Relationships</div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {selectedEdges.map((edge) => {
                const fromNode = nodeMap.get(edge.from);
                const toNode = nodeMap.get(edge.to);
                const otherNode = fromNode?.id === selectedNode?.id ? toNode : fromNode;

                if (!otherNode) {
                  return null;
                }

                return (
                  <button
                    key={`${selectedNode?.id}-${edge.from}-${edge.to}`}
                    type="button"
                    onClick={() => setSelectedNodeId(otherNode.id)}
                    className="flex w-full items-center justify-between rounded-[16px] border border-foreground/10 bg-background/80 px-3 py-3 text-left transition-colors hover:bg-foreground/[0.04]"
                  >
                    <span className="text-sm text-foreground">{otherNode.label.replaceAll("\n", " ")}</span>
                    <span className="ml-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {getRelationshipLabel(edge)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GridBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(8)].map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute h-px bg-foreground/10"
          style={{
            top: `${12.5 * (i + 1)}%`,
            left: 0,
            right: 0,
          }}
        />
      ))}
      {[...Array(12)].map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute w-px bg-foreground/10"
          style={{
            left: `${8.33 * (i + 1)}%`,
            top: 0,
            bottom: 0,
          }}
        />
      ))}
    </div>
  );
}

function formatRuntime(tick: number) {
  const totalSeconds = 46 + tick * 2;
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function PatientFeed({
  patient,
  className,
  compact = false,
  showTelemetry = true,
  showStatusPanels = false,
  showTracking = false,
  showBodyScan = false,
  showOverlayLabels = true,
  scanPhase = 0,
  audioEnabled = false,
  onToggleAudio,
}: {
  patient: PatientRecord;
  className?: string;
  compact?: boolean;
  showTelemetry?: boolean;
  showStatusPanels?: boolean;
  showTracking?: boolean;
  showBodyScan?: boolean;
  showOverlayLabels?: boolean;
  scanPhase?: number;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}) {
  const critical = isCriticalPatient(patient);
  const visionCueProfile = patient.warRoom.visionCues;
  const faceLockBox = critical ? criticalFaceLockBox : defaultFaceLockBox;
  const faceBracketLength = compact ? 2.4 : 2.9;
  const faceBracketInset = compact ? 0.9 : 1.2;
  const faceStrokeWidth = compact ? 0.34 : 0.28;
  const bodyScanLineY = 42 + (scanPhase / 119) * 50;
  const bodySweepHeight = compact ? 16 : 20;
  const scanLabelOpacity = 0.74 + Math.sin(scanPhase / 8) * 0.18;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[32px] border border-foreground/10 bg-[#120f0d] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <div className="relative h-full overflow-hidden rounded-[24px] bg-black">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted={!audioEnabled}
          playsInline
          src={`/api/patient-video?patient=${patient.id}`}
        />

        {onToggleAudio ? (
          <button
            type="button"
            onClick={onToggleAudio}
            className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/45 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            {audioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {audioEnabled ? "Audio on" : "Audio off"}
          </button>
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.06)_45%,rgba(0,0,0,0.46)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_49%,transparent_100%)] bg-[length:100%_8px] opacity-20" />

        {showTracking ? (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="vision-face-box" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor={critical ? "rgba(254,202,202,0.95)" : "rgba(255,255,255,0.92)"} />
                <stop offset="100%" stopColor={critical ? "rgba(248,113,113,0.95)" : "rgba(248,113,113,0.8)"} />
              </linearGradient>
              <linearGradient id="vision-body-outline" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(134,239,172,0.85)" />
                <stop offset="100%" stopColor="rgba(34,197,94,0.55)" />
              </linearGradient>
              <linearGradient id="vision-body-sweep" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(34,197,94,0)" />
                <stop offset="50%" stopColor="rgba(74,222,128,0.28)" />
                <stop offset="100%" stopColor="rgba(187,247,208,0)" />
              </linearGradient>
              <clipPath id="vision-body-clip">
                <polygon points={formatOverlayPoints(bodyScanPolygon)} />
              </clipPath>
            </defs>

            {showBodyScan ? (
              <>
                <polygon
                  points={formatOverlayPoints(bodyScanPolygon)}
                  fill="rgba(34,197,94,0.06)"
                  stroke="url(#vision-body-outline)"
                  strokeWidth={compact ? "0.38" : "0.28"}
                  strokeLinejoin="round"
                />
                <g clipPath="url(#vision-body-clip)">
                  <rect
                    x="30"
                    y={bodyScanLineY - bodySweepHeight / 2}
                    width="56"
                    height={bodySweepHeight}
                    fill="url(#vision-body-sweep)"
                  />
                  <rect
                    x="30"
                    y={bodyScanLineY - 2.2}
                    width="56"
                    height="4.4"
                    fill="rgba(187,247,208,0.12)"
                  />
                  <line
                    x1="31"
                    x2="85"
                    y1={bodyScanLineY}
                    y2={bodyScanLineY}
                    stroke="rgba(134,239,172,0.82)"
                      strokeWidth={compact ? "0.6" : "0.42"}
                  />
                </g>
                <text
                  x={critical ? "22" : "30"}
                  y={critical ? "32" : "38"}
                  fill="rgba(187,247,208,0.92)"
                  fontSize={compact ? "2.4" : "2.1"}
                  letterSpacing="0.22em"
                  opacity={scanLabelOpacity}
                  style={{ textTransform: "uppercase" }}
                >
                  {visionCueProfile.bodyScanStatus}
                </text>
              </>
            ) : null}

            <rect
              x={faceLockBox.x}
              y={faceLockBox.y}
              width={faceLockBox.width}
              height={faceLockBox.height}
              rx="2.8"
              fill="rgba(239,68,68,0.08)"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={compact ? "0.18" : "0.12"}
            />

            <line
              x1={faceLockBox.x + faceLockBox.width / 2}
              x2={faceLockBox.x + faceLockBox.width / 2}
              y1={faceLockBox.y + 1.8}
              y2={faceLockBox.y + faceLockBox.height - 1.8}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={compact ? "0.16" : "0.12"}
              strokeDasharray={compact ? "0.85 0.85" : "0.7 1"}
            />
            <line
              x1={faceLockBox.x + 1.8}
              x2={faceLockBox.x + faceLockBox.width - 1.8}
              y1={faceLockBox.y + faceLockBox.height / 2}
              y2={faceLockBox.y + faceLockBox.height / 2}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={compact ? "0.16" : "0.12"}
              strokeDasharray={compact ? "0.85 0.85" : "0.7 1"}
            />

            <path
              d={`
                M ${faceLockBox.x + faceBracketLength} ${faceLockBox.y}
                L ${faceLockBox.x + faceBracketInset} ${faceLockBox.y}
                L ${faceLockBox.x} ${faceLockBox.y + faceBracketInset}
                M ${faceLockBox.x + faceLockBox.width - faceBracketLength} ${faceLockBox.y}
                L ${faceLockBox.x + faceLockBox.width - faceBracketInset} ${faceLockBox.y}
                L ${faceLockBox.x + faceLockBox.width} ${faceLockBox.y + faceBracketInset}
                M ${faceLockBox.x} ${faceLockBox.y + faceLockBox.height - faceBracketInset}
                L ${faceLockBox.x} ${faceLockBox.y + faceLockBox.height}
                L ${faceLockBox.x + faceBracketLength} ${faceLockBox.y + faceLockBox.height}
                M ${faceLockBox.x + faceLockBox.width - faceBracketLength} ${faceLockBox.y + faceLockBox.height}
                L ${faceLockBox.x + faceLockBox.width} ${faceLockBox.y + faceLockBox.height}
                L ${faceLockBox.x + faceLockBox.width} ${faceLockBox.y + faceLockBox.height - faceBracketInset}
              `}
              fill="none"
              stroke="url(#vision-face-box)"
              strokeWidth={faceStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <text
              x={critical ? faceLockBox.x - 1.2 : faceLockBox.x}
              y={critical ? faceLockBox.y - 2.8 : faceLockBox.y - 1.9}
              fill="rgba(255,255,255,0.9)"
              fontSize={compact ? "2.4" : "2.2"}
              letterSpacing="0.2em"
              style={{ textTransform: "uppercase" }}
            >
              Face lock
            </text>
          </svg>
        ) : null}

        {showTelemetry && showOverlayLabels ? (
          <>
            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border-red-500/25 bg-red-500/15 text-[11px] text-red-50">
                LIVE WEBCAM RELAY
              </Badge>
              <Badge className="rounded-full border-white/15 bg-black/35 text-[11px] text-white/75">
                {patient.warRoom.videoLabel}
              </Badge>
            </div>

            {showTracking ? (
              <div className="absolute right-4 top-16 w-[188px] space-y-3">
                <div className="rounded-[18px] border border-white/12 bg-black/50 px-3 py-3 backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Face cues</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {visionCueProfile.faceCueTags.map((cue) => (
                      <span
                        key={cue}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
                          critical ? "bg-red-500/15 text-red-100" : "bg-white/10 text-white/80",
                        )}
                      >
                        {cue}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[18px] border border-white/12 bg-black/50 px-3 py-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Audio cues</div>
                    <div className={cn("text-[10px] uppercase tracking-[0.18em]", critical ? "text-red-200" : "text-emerald-200")}>
                      {visionCueProfile.audioStatus}
                    </div>
                  </div>
                  <div className="mt-3 flex h-10 items-end gap-1">
                    {visionCueProfile.audioBars.map((bar, index) => (
                      <div
                        key={`${bar}-${index}`}
                        className={cn(
                          "w-full rounded-full",
                          critical ? "bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200" : "bg-gradient-to-t from-emerald-500 via-teal-400 to-cyan-200",
                        )}
                        style={{ height: `${bar}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {visionCueProfile.audioCueTags.map((cue) => (
                      <span key={cue} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/75">
                        {cue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {showStatusPanels ? (
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div className="max-w-xs rounded-[20px] border border-white/12 bg-black/45 px-3 py-2 backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                    {showTracking ? "Vision lock" : "Live relay"}
                  </div>
                  <div className="mt-1 font-mono text-sm text-white">
                    {showTracking ? visionCueProfile.faceStatus : "Webcam feed stable"}
                  </div>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-black/45 px-3 py-2 text-right backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">Sensor confidence</div>
                  <div className="mt-1 font-mono text-sm text-red-100">{visionCueProfile.sensorConfidence}</div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function EcgFeed({
  patient,
  heartRate,
  perfusion,
  phase,
}: {
  patient: PatientRecord;
  heartRate: number;
  perfusion: string;
  phase: number;
}) {
  const critical = isCriticalPatient(patient);
  const ecgPath = createEcgPath(phase, critical);
  const scanPosition = 88 + ((phase * 24) % 824);

  return (
    <div className="rounded-[28px] border border-foreground/10 bg-background/88 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
            <HeartPulse className="h-4 w-4 text-red-500" />
            ECG Live Feed
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">Real-time cardiac trace</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
            HR {heartRate} BPM
          </Badge>
          <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
            perfusion {perfusion}%
          </Badge>
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              critical
                ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300"
                : "border-emerald-500/15 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
            )}
          >
            {patient.warRoom.ecgLabel}
          </Badge>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[24px] border border-white/8 bg-black/90 p-4">
        <svg className="h-[120px] w-full" viewBox="0 0 1000 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ecg-stroke" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(52,211,153,0.6)" />
              <stop offset="50%" stopColor="rgba(74,222,128,1)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0.6)" />
            </linearGradient>
          </defs>

          {Array.from({ length: 10 }).map((_, index) => (
            <line
              key={`grid-v-${index}`}
              x1={index * 100}
              x2={index * 100}
              y1="0"
              y2="140"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {Array.from({ length: 7 }).map((_, index) => (
            <line
              key={`grid-h-${index}`}
              x1="0"
              x2="1000"
              y1={index * 20}
              y2={index * 20}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          <path
            d={ecgPath}
            fill="none"
            stroke={critical ? "rgba(248,113,113,0.18)" : "rgba(74,222,128,0.2)"}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d={ecgPath}
            fill="none"
            stroke={critical ? "rgba(248,113,113,0.92)" : "url(#ecg-stroke)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1={scanPosition}
            x2={scanPosition}
            y1="0"
            y2="140"
            stroke={critical ? "rgba(248,113,113,0.36)" : "rgba(74,222,128,0.32)"}
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

function SignalSynthesisBoard({
  patient,
  vitals,
  tick,
  onOpenReport,
}: {
  patient: PatientRecord;
  vitals: LiveVitals;
  tick: number;
  onOpenReport: () => void;
}) {
  const watchItems = Array.from({ length: 3 }, (_, index) => patient.watchlist[(tick + index) % patient.watchlist.length]);
  const critical = isCriticalPatient(patient);
  const signalCards = patient.warRoom.signalCards.map((card) => {
    if (card.label === "Perspiration drift") {
      return { ...card, value: vitals.perspiration };
    }
    if (card.label === "HRV rigidity") {
      return { ...card, value: vitals.rigidity };
    }
    return card;
  });

  return (
    <div className="rounded-[28px] border border-foreground/10 bg-background/88 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Signal synthesis</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">Swarm evidence synthesis</div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            This is the clean evidence layer for {patient.name}. It documents why the room stays passive or why it
            escalates, and it is the quickest place for a clinician to understand what survived review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
            {patient.monitoringMode}
          </Badge>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-foreground/10 bg-background/70 px-4 text-sm"
            onClick={onOpenReport}
          >
            <FileText className="h-4 w-4" />
            Open Report
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {signalCards.map((card) => (
          <div key={card.label} className="rounded-[22px] border border-foreground/10 bg-foreground/[0.03] px-4 py-4">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{card.label}</div>
            <div className={cn("mt-3 font-mono text-lg", critical ? "text-red-600 dark:text-red-300" : "text-foreground")}>
              {card.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{card.note}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Active watchlist</div>
          <div className="mt-4 space-y-3">
            {watchItems.map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-[18px] border border-foreground/10 bg-background/80 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mr-3 font-mono text-xs text-foreground">{`0${index + 1}`}</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Consensus inputs surviving review</div>
          <div className="mt-4 space-y-3">
            {patient.warRoom.signalRows.map((row) => (
              <div key={row.title} className="rounded-[18px] border border-foreground/10 bg-background/80 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{row.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{row.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChiefTerminalCard({
  patient,
  terminalLines,
}: {
  patient: PatientRecord;
  terminalLines: string[];
}) {
  const critical = isCriticalPatient(patient);

  return (
    <div className="rounded-[28px] border border-foreground/10 bg-background/88 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Chief terminal</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Chief consensus stream</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every agent speaks here. The Chief keeps only the evidence that survives skepticism and turns it into one
            operational instruction.
          </p>
        </div>

        <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
          alert threshold {patient.warRoom.vitalProfile.alertThreshold.toFixed(2)}
        </Badge>
      </div>

      <div className="mt-6 overflow-hidden rounded-[30px] border border-foreground/10 bg-[#0a0a0a] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.12)]">
        <div className="rounded-[24px] bg-black px-4 py-4">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="font-mono text-xs text-white/45">chief://consensus-terminal</div>
          </div>

          <div className="mt-4 h-[430px] space-y-3 overflow-y-auto pr-2 font-mono text-sm">
            {terminalLines.map((line, index) => (
              <div key={`${line}-${index}`} className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3 text-white/82">
                <span className="mr-3 text-white/35">{`0${index + 1}`.slice(-2)}</span>
                {line}
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Vision</div>
              <div className="mt-2 font-mono text-sm text-white">
                {critical ? "distress confirmed" : "aligned"}
              </div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Bio</div>
              <div className="mt-2 font-mono text-sm text-white">
                {critical ? "strain rising" : "stable"}
              </div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">RedTeam</div>
              <div className="mt-2 font-mono text-sm text-white">
                {critical ? "objections failed" : "blocking alert"}
              </div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Chief</div>
              <div className={cn("mt-2 font-mono text-sm", critical ? "text-red-300" : "text-emerald-300")}>
                {critical ? "hospital alert" : "observe only"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportModal({
  onClose,
  onDownload,
  patient,
  vitals,
}: {
  onClose: () => void;
  onDownload: () => void;
  patient: PatientRecord;
  vitals: LiveVitals;
}) {
  const critical = isCriticalPatient(patient);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close report"
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-[1240px] overflow-y-auto rounded-[36px] border border-foreground/10 bg-background text-foreground shadow-[0_40px_120px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Clinical report</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {patient.code} / {patient.name}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Physician-facing surveillance report generated from the live war-room session, with technical evidence,
              clinical interpretation, and operational actions preserved in one document.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="rounded-full border-foreground/10 bg-background/70" onClick={onDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-foreground/10 bg-background/70 p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[0.96fr_1.04fr]">
          <div className="space-y-5">
            <div className="rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Attending summary</div>
                  <div className="mt-2 text-xl font-semibold text-foreground">{patient.chiefInstruction}</div>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {critical
                      ? "System classification is consistent with acute cardiopulmonary distress. The alert pathway remains active pending bedside confirmation."
                      : "System classification remains compatible with stable monitoring. No acute cardiopulmonary event is supported by the current evidence."}
                  </p>
                </div>
                <div className={getVerdictChipClasses(patient)}>{patient.warRoom.liveVerdictChip}</div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Consensus score</div>
                  <div className="mt-2 font-mono text-lg text-foreground">{vitals.consensusScore}</div>
                </div>
                <div className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Heart rate estimate</div>
                  <div className="mt-2 font-mono text-lg text-foreground">{vitals.heartRate} BPM</div>
                </div>
                <div className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Perfusion estimate</div>
                  <div className="mt-2 font-mono text-lg text-foreground">{vitals.perfusion}%</div>
                </div>
                <div className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">HRV rigidity</div>
                  <div className="mt-2 font-mono text-lg text-foreground">{vitals.rigidity}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Structured assessment</div>
              <div className="mt-4 space-y-4">
                {patient.warRoom.reportSections.map((section, index) => (
                  <div key={section.title} className="rounded-[22px] border border-foreground/10 bg-background/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03] text-xs font-mono text-muted-foreground">
                        {`0${index + 1}`.slice(-2)}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{section.title}</div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground">{section.summary}</p>
                    <div className="mt-4 space-y-3">
                      {section.bullets.map((bullet) => (
                        <div key={bullet} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-red-500" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Clinical chronology</div>
                <div className="mt-2 text-xl font-semibold text-foreground">Technical, medical, and operational timeline</div>
              </div>
              <Badge className={cn("rounded-full px-3 py-1 text-[11px]", critical ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")}>
                {patient.warRoom.alertLabel}
              </Badge>
            </div>

            <div className="mt-5 space-y-4">
              {patient.warRoom.reportEvents.map((event) => (
                <div key={`${event.time}-${event.title}`} className="rounded-[24px] border border-foreground/10 bg-background/80 p-4">
                  <div className="font-mono text-sm text-red-500">{event.time}</div>
                  <h4 className="mt-3 text-lg font-semibold text-foreground">{event.title}</h4>
                  <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Technical observations</div>
                      <div className="mt-1">{event.technical}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Clinical interpretation</div>
                      <div className="mt-1">{event.medical}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Operational decision</div>
                      <div className="mt-1 text-foreground">{event.decision}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HolterComparatorPanel({
  holter,
  patient,
  phase,
}: {
  holter: HolterBreakdownDefinition;
  patient: PatientRecord;
  phase: number;
}) {
  const [replayProgress, setReplayProgress] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const clipId = useId().replace(/:/g, "");
  const critical = isCriticalPatient(patient);
  const stablePath = createEcgPath(phase, false);
  const collapsePath = createEcgPath(phase, true);
  const revealWidth = Math.max(0, Math.min(1000, Math.round(replayProgress * 1000)));
  const scanPosition = Math.max(18, revealWidth || 18);

  useEffect(() => {
    setReplayProgress(0);
    setIsReplaying(false);
  }, [holter.currentPayload, patient.id]);

  useEffect(() => {
    if (!isReplaying) {
      return;
    }

    const interval = window.setInterval(() => {
      setReplayProgress((currentProgress) => {
        const nextProgress = Math.min(1, currentProgress + 0.045);

        if (nextProgress >= 1) {
          window.clearInterval(interval);
          setIsReplaying(false);
        }

        return nextProgress;
      });
    }, 70);

    return () => window.clearInterval(interval);
  }, [isReplaying]);

  function handleReplayToggle() {
    if (replayProgress > 0) {
      setReplayProgress(0);
      setIsReplaying(false);
      return;
    }

    setReplayProgress(0);
    setIsReplaying(true);
  }

  return (
    <div className="mt-6 rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{holter.databaseLabel}</div>
          <h4 className="mt-3 text-xl font-semibold text-foreground">{holter.title}</h4>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{holter.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
            {holter.referenceLabel}
          </Badge>
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              critical
                ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            )}
          >
            {holter.matchLabel}
          </Badge>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-foreground/10 bg-background/70 px-4 text-sm"
            onClick={handleReplayToggle}
          >
            {replayProgress > 0 ? "Reset replay" : "Replay deterioration"}
          </Button>
        </div>
      </div>

      <div className="mt-5 rounded-[26px] border border-foreground/10 bg-[#0a0a0a] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Holter database scanner</div>
            <div className="mt-2 text-lg font-semibold text-white">Stable reference to electrical-breakdown replay</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              replay {Math.round(replayProgress * 100)}%
            </Badge>
            <Badge className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              {isReplaying ? "scanner running" : "scanner armed"}
            </Badge>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-white/8 bg-black p-4">
          <svg className="h-[180px] w-full" viewBox="0 0 1000 180" preserveAspectRatio="none">
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={revealWidth} height="180" />
              </clipPath>
              <linearGradient id={`${clipId}-stable`} x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(52,211,153,0.45)" />
                <stop offset="50%" stopColor="rgba(74,222,128,0.98)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0.45)" />
              </linearGradient>
              <linearGradient id={`${clipId}-critical`} x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(248,113,113,0.45)" />
                <stop offset="50%" stopColor="rgba(251,146,60,1)" />
                <stop offset="100%" stopColor="rgba(248,113,113,0.45)" />
              </linearGradient>
            </defs>

            {Array.from({ length: 10 }).map((_, index) => (
              <line
                key={`holter-grid-v-${index}`}
                x1={index * 100}
                x2={index * 100}
                y1="0"
                y2="180"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            {Array.from({ length: 9 }).map((_, index) => (
              <line
                key={`holter-grid-h-${index}`}
                x1="0"
                x2="1000"
                y1={index * 22.5}
                y2={index * 22.5}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            <path d={stablePath} fill="none" stroke="rgba(74,222,128,0.18)" strokeWidth="10" strokeLinecap="round" />
            <path d={stablePath} fill="none" stroke={`url(#${clipId}-stable)`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            <path
              d={collapsePath}
              fill="none"
              stroke="rgba(248,113,113,0.16)"
              strokeWidth="10"
              strokeLinecap="round"
              clipPath={`url(#${clipId})`}
            />
            <path
              d={collapsePath}
              fill="none"
              stroke={`url(#${clipId}-critical)`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              clipPath={`url(#${clipId})`}
            />

            {replayProgress > 0 ? (
              <line
                x1={scanPosition}
                x2={scanPosition}
                y1="0"
                y2="180"
                stroke="rgba(134,239,172,0.38)"
                strokeWidth="2"
              />
            ) : null}
          </svg>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Reference lane</div>
              <div className="mt-2 font-mono text-sm text-emerald-300">normal sinus profile</div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Breakdown replay</div>
              <div className="mt-2 font-mono text-sm text-orange-300">pre-collapse electrical decay</div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Current read</div>
              <div className={cn("mt-2 font-mono text-sm", critical ? "text-red-300" : "text-emerald-300")}>
                {holter.matchLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-foreground/10 bg-background/80 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Bio agent readout</div>
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This is the electrical-language payload Bio can push into the room when the optical trace is cross-referenced against the Holter lane.
            </div>
          </div>
          <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
            live payload
          </Badge>
        </div>

        <div className="mt-4 overflow-hidden rounded-[22px] border border-foreground/10 bg-[#0a0a0a] p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/82">{holter.currentPayload}</pre>
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  debateLine,
  isDarkMode,
  onOpen,
}: {
  agent: AgentDefinition;
  debateLine: string;
  isDarkMode: boolean;
  onOpen: (agent: AgentDefinition) => void;
}) {
  const Icon = agentIcons[agent.id] ?? Bot;
  const darkTone = darkAgentToneMap[agent.id] ?? darkAgentToneMap.chief;

  return (
    <button
      type="button"
      onClick={() => onOpen(agent)}
      className={cn(
        "group relative w-full overflow-hidden rounded-[28px] p-5 text-left transition-all duration-300 hover:-translate-y-1",
        isDarkMode
          ? cn(
              "border bg-[#14110f] shadow-[0_20px_60px_rgba(0,0,0,0.22)] hover:bg-[#181412] hover:shadow-[0_28px_90px_rgba(0,0,0,0.32)]",
              darkTone.border,
            )
          : cn(
              "border bg-background/92 shadow-[0_20px_70px_rgba(0,0,0,0.05)] backdrop-blur-xl hover:shadow-[0_28px_90px_rgba(0,0,0,0.08)]",
              agent.accentBorderClass,
            ),
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          isDarkMode ? darkTone.overlay : cn("opacity-50", agent.accentCardClass),
        )}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cn("rounded-[18px] p-2.5", isDarkMode ? darkTone.icon : agent.accentIconClass)}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <div className={cn("text-[11px] uppercase tracking-[0.24em]", isDarkMode ? "text-stone-500" : "text-muted-foreground")}>
                {agent.role}
              </div>
              <h3 className={cn("mt-1 font-mono text-base", isDarkMode ? "text-stone-50" : "text-foreground")}>
                {agent.name}
              </h3>
            </div>
          </div>
          <ArrowRight
            className={cn(
              "mt-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1",
              isDarkMode ? "text-stone-600" : "text-muted-foreground",
            )}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className={cn("text-sm font-medium", isDarkMode ? darkTone.headline : agent.accentTextClass)}>
            {agent.headline}
          </p>
          <Badge className={cn("rounded-full border-0 px-3 py-1 text-[10px]", isDarkMode ? darkTone.badge : agent.accentBadgeClass)}>
            open
          </Badge>
        </div>

        <p className={cn("mt-3 text-sm leading-relaxed", isDarkMode ? "text-stone-400" : "text-muted-foreground")}>
          {agent.summary}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {agent.metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(
                "rounded-[18px] px-3 py-2",
                isDarkMode ? "border border-white/10 bg-black/45" : "border border-foreground/10 bg-background/80",
              )}
            >
              <div className={cn("text-[10px] uppercase tracking-[0.22em]", isDarkMode ? "text-stone-500" : "text-muted-foreground")}>
                {metric.label}
              </div>
              <div className={cn("mt-1 font-mono text-sm", isDarkMode ? "text-stone-100" : "text-foreground")}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "mt-5 rounded-[20px] px-3 py-3",
            isDarkMode ? "border border-white/10 bg-black/55" : "border border-foreground/10 bg-background/80",
          )}
        >
          <div className={cn("text-[10px] uppercase tracking-[0.22em]", isDarkMode ? "text-stone-500" : "text-muted-foreground")}>
            Live room quote
          </div>
          <p className={cn("mt-2 text-sm leading-relaxed", isDarkMode ? "text-stone-300" : "text-muted-foreground")}>
            {debateLine}
          </p>
        </div>
      </div>
    </button>
  );
}

export function NeuralConsole({ patient }: { patient: PatientRecord }) {
  const [tick, setTick] = useState(0);
  const [ecgPhase, setEcgPhase] = useState(0);
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showVisionLabels, setShowVisionLabels] = useState(true);
  const [isCanvasAudioEnabled, setIsCanvasAudioEnabled] = useState(false);
  const [relayMode, setRelayMode] = useState<RelayMode>("cached");
  const [relayStatus, setRelayStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [relayError, setRelayError] = useState<string | null>(null);
  const [liveSnapshot, setLiveSnapshot] = useState<LiveWarRoomSnapshot | null>(null);

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem("n0-war-room-theme");

      if (storedTheme) {
        setIsDarkMode(storedTheme === "dark");
        return;
      }

      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    try {
      const storedRelayMode = window.localStorage.getItem(relayModeStorageKey);

      if (storedRelayMode === "live" || storedRelayMode === "cached") {
        setRelayMode(storedRelayMode);
      }
    } catch {
      setRelayMode("cached");
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("n0-war-room-theme", isDarkMode ? "dark" : "light");
    } catch {
      // Ignore storage errors and keep the in-memory toggle working.
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(relayModeStorageKey, relayMode);
    } catch {
      // Ignore storage errors and keep the in-memory toggle working.
    }
  }, [relayMode]);

  useEffect(() => {
    setIsCanvasAudioEnabled(false);
  }, [patient.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((currentTick) => currentTick + 1);
    }, 1600);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setEcgPhase((currentPhase) => (currentPhase + 1) % 120);
    }, 120);

    return () => window.clearInterval(interval);
  }, []);

  const vitals = useMemo<LiveVitals>(
    () => ({
      consensusScore: (
        patient.warRoom.vitalProfile.consensusBase +
        Math.sin(tick / 1.6) * patient.warRoom.vitalProfile.consensusSwing
      ).toFixed(2),
      heartRate: Math.round(
        patient.warRoom.vitalProfile.heartRateBase +
          Math.sin(tick / 1.4) * patient.warRoom.vitalProfile.heartRateSwing,
      ),
      perfusion: (
        patient.warRoom.vitalProfile.perfusionBase +
        Math.sin(tick / 2) * patient.warRoom.vitalProfile.perfusionSwing
      ).toFixed(1),
      perspiration: (
        patient.warRoom.vitalProfile.perspirationBase +
        Math.sin((tick + 1) / 1.7) * patient.warRoom.vitalProfile.perspirationSwing
      ).toFixed(2),
      rigidity: (
        patient.warRoom.vitalProfile.rigidityBase +
        Math.sin(tick / 1.8) * patient.warRoom.vitalProfile.rigiditySwing
      ).toFixed(2),
    }),
    [patient, tick],
  );

  const refreshRelay = useEffectEvent(async () => {
    if (relayMode !== "live") {
      return;
    }

    setRelayStatus("loading");
    setRelayError(null);

    try {
      const response = await fetch("/api/console-swarm", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          vitals,
        }),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof responseJson?.error === "string" ? responseJson.error : "Live relay request failed.",
        );
      }

      startTransition(() => {
        setLiveSnapshot(responseJson.snapshot as LiveWarRoomSnapshot);
        setRelayStatus("ready");
      });
    } catch (error) {
      setRelayStatus("error");
      setRelayError(error instanceof Error ? error.message : "Live relay request failed.");
    }
  });

  useEffect(() => {
    if (relayMode !== "live") {
      setLiveSnapshot(null);
      setRelayError(null);
      setRelayStatus("idle");
      return;
    }

    void refreshRelay();
    const interval = window.setInterval(() => {
      void refreshRelay();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [patient.id, refreshRelay, relayMode]);

  const displayPatient = useMemo<PatientRecord>(() => {
    if (!liveSnapshot) {
      return patient;
    }

    return {
      ...patient,
      chiefInstruction: liveSnapshot.chiefInstruction,
      warRoom: {
        ...patient.warRoom,
        agents: mergeLiveAgents(patient.warRoom.agents, liveSnapshot.agents),
        alertLabel: liveSnapshot.alertLabel,
        bottomNote: liveSnapshot.bottomNote,
        ecgLabel: liveSnapshot.ecgLabel,
        liveVerdictBadge: liveSnapshot.liveVerdictBadge,
        liveVerdictChip: liveSnapshot.liveVerdictChip,
        reportEvents: liveSnapshot.reportEvents,
        reportSections: liveSnapshot.reportSections,
        signalCards: liveSnapshot.signalCards,
        signalRows: liveSnapshot.signalRows,
        survivingEvidence: liveSnapshot.survivingEvidence,
        terminalLines: liveSnapshot.terminalLines,
        visionCues: liveSnapshot.visionCues,
      },
    };
  }, [liveSnapshot, patient]);

  const agents = displayPatient.warRoom.agents;
  const terminalLines = displayPatient.warRoom.terminalLines;
  const critical = isCriticalPatient(displayPatient);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTerminalIndex((currentIndex) => (currentIndex + 1) % (terminalLines.length + 1));
    }, 1100);

    return () => window.clearInterval(interval);
  }, [terminalLines.length]);

  useEffect(() => {
    if (!selectedAgent) {
      return;
    }

    const refreshedAgent = agents.find((agent) => agent.id === selectedAgent.id);

    if (refreshedAgent && refreshedAgent !== selectedAgent) {
      setSelectedAgent(refreshedAgent);
    }
  }, [agents, selectedAgent]);

  useEffect(() => {
    if (!selectedAgent && !isReportOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedAgent) {
          setSelectedAgent(null);
          return;
        }

        setIsReportOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReportOpen, selectedAgent]);

  useEffect(() => {
    if (selectedAgent?.id === "vision") {
      setShowVisionLabels(true);
    }
  }, [selectedAgent]);

  const visibleTerminalLines = useMemo(() => {
    const normalizedLength = terminalIndex === 0 ? terminalLines.length : terminalIndex;
    return terminalLines.slice(0, Math.max(3, normalizedLength));
  }, [terminalIndex, terminalLines]);

  const SelectedAgentIcon = selectedAgent ? agentIcons[selectedAgent.id] ?? Bot : null;
  const selectedAgentLine = selectedAgent ? selectedAgent.quoteStream[tick % selectedAgent.quoteStream.length] : "";
  const isVisionModal = selectedAgent?.id === "vision";
  const reportText = useMemo(() => buildReportText(displayPatient, vitals), [displayPatient, vitals]);
  const stableOrAlertConfidence = critical
    ? `${Math.round(Number(vitals.consensusScore) * 100)}% alert confidence`
    : `${Math.round((1 - Number(vitals.consensusScore)) * 100)}% stable`;

  function handleRelayToggle() {
    setRelayMode((currentMode) => (currentMode === "cached" ? "live" : "cached"));
  }

  function handleDownloadReport() {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `${displayPatient.code.toLowerCase()}-war-room-report.txt`;
    anchor.click();
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
  }

  return (
    <div className={isDarkMode ? "dark" : undefined}>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
        <GridBackdrop />

        <div className="pointer-events-none absolute right-[-4%] top-[12%] h-[420px] w-[420px] rounded-full bg-red-500/6 blur-[140px]" />
        <div className="pointer-events-none absolute left-[-4%] top-[30%] h-[360px] w-[360px] rounded-full bg-foreground/[0.04] blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-8 lg:px-12 lg:py-10">
          <header className="rounded-[28px] border border-foreground/10 bg-background/85 px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors duration-300">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-foreground/15 bg-background/70 px-5"
                >
                  <Link href={`/console/${patient.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Dossier
                  </Link>
                </Button>

                <div>
                  <div className="font-mono text-lg text-foreground">~n0 / War Room</div>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Homepage language, not dashboard sludge. This is the live room: patient feed in the middle, agents on
                    the edges, Chief logic across the bottom.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-3 py-2 text-[11px] text-muted-foreground">
                  <Sun className="h-3.5 w-3.5" />
                  <Switch
                    aria-label="Toggle war room dark mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="data-[state=checked]:bg-foreground data-[state=unchecked]:bg-input"
                  />
                  <Moon className="h-3.5 w-3.5" />
                </div>
                <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                  {displayPatient.name}
                </Badge>
                <Badge className={getAlertBadgeClasses(displayPatient)}>
                  {displayPatient.warRoom.alertLabel}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-full border-foreground/10 bg-background/70 px-4 text-[11px]"
                  onClick={() => setIsReportOpen(true)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRelayToggle}
                  title={relayError ?? "Toggle relay mode"}
                  className={cn(
                    "h-8 rounded-full px-4 text-[11px] shadow-none",
                    getRelayChipClasses(relayMode, relayStatus),
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      relayMode === "live"
                        ? relayStatus === "error"
                          ? "bg-amber-400"
                          : relayStatus === "loading"
                            ? "animate-pulse bg-sky-400"
                            : "bg-red-400"
                        : "bg-stone-400",
                    )}
                  />
                  {getRelayChipLabel(relayMode, relayStatus)}
                </Button>
                <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                  runtime {formatRuntime(tick)}
                </Badge>
              </div>
            </div>
          </header>

          <section className="mt-8 rounded-[36px] border border-foreground/10 bg-background/88 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-colors duration-300 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Consensus canvas</div>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight lg:text-5xl">
                  Patient feed in the center, agents around the edges, and the Chief resolving the room below.
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                {setupChain.map((step) => (
                  <Badge
                    key={step}
                    className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground"
                  >
                    {step}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                HR {vitals.heartRate} BPM
              </Badge>
              <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                perfusion {vitals.perfusion}%
              </Badge>
              <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                perspiration {vitals.perspiration}
              </Badge>
              <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                HRV rigidity {vitals.rigidity}
              </Badge>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
              <div className="order-2 space-y-4 xl:order-1">
                {agents.slice(0, 3).map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  debateLine={agent.quoteStream[tick % agent.quoteStream.length]}
                  isDarkMode={isDarkMode}
                  onOpen={setSelectedAgent}
                />
                ))}
              </div>

              <div className="order-1 space-y-4 xl:order-2">
                <PatientFeed
                  patient={displayPatient}
                  className="aspect-[4/3] w-full xl:aspect-[16/11]"
                  showTelemetry
                  audioEnabled={displayPatient.id === "patient-2" ? isCanvasAudioEnabled : false}
                  onToggleAudio={
                    displayPatient.id === "patient-2"
                      ? () => setIsCanvasAudioEnabled((currentState) => !currentState)
                      : undefined
                  }
                />
                <EcgFeed patient={displayPatient} heartRate={vitals.heartRate} perfusion={vitals.perfusion} phase={ecgPhase} />
                <ChiefTerminalCard patient={displayPatient} terminalLines={visibleTerminalLines} />
              </div>

              <div className="order-3 space-y-4">
                {agents.slice(3).map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  debateLine={agent.quoteStream[tick % agent.quoteStream.length]}
                  isDarkMode={isDarkMode}
                  onOpen={setSelectedAgent}
                />
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
            <SignalSynthesisBoard patient={displayPatient} vitals={vitals} tick={tick} onOpenReport={() => setIsReportOpen(true)} />

            <div className="rounded-[36px] border border-foreground/10 bg-background/88 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-colors duration-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Chief side channel</div>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight">Live verdict</h3>
                </div>
                <Badge className={getAlertBadgeClasses(displayPatient)}>
                  {displayPatient.warRoom.liveVerdictBadge}
                </Badge>
              </div>

              <div className="mt-6 rounded-[28px] border border-foreground/10 bg-foreground/[0.03] p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Surviving evidence</div>
                <div className="mt-4 space-y-3">
                  {displayPatient.warRoom.survivingEvidence.map((entry) => (
                    <div key={entry.source} className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{entry.source}</div>
                      <div className="mt-2 text-sm leading-relaxed text-foreground">{entry.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-foreground/10 bg-foreground/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Chief verdict</div>
                    <div className="mt-2 text-lg font-semibold">{displayPatient.chiefInstruction}</div>
                  </div>
                  <div className={getVerdictChipClasses(displayPatient)}>{displayPatient.warRoom.liveVerdictChip}</div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      <span>{critical ? "Alert confidence" : "Consensus confidence"}</span>
                      <span>{stableOrAlertConfidence}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          critical
                            ? "bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300"
                            : "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400",
                        )}
                        style={{
                          width: `${critical ? Math.round(Number(vitals.consensusScore) * 100) : Math.round((1 - Number(vitals.consensusScore)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      <span>Alert escalation score</span>
                      <span>{vitals.consensusScore}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300"
                        style={{ width: `${Math.round(Number(vitals.consensusScore) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 rounded-[28px] border border-foreground/10 bg-background/85 px-5 py-4 text-sm text-muted-foreground shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors duration-300">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                {displayPatient.warRoom.bottomNote}
              </div>
              <div className="font-mono text-xs">~n0 // neural bypass surveillance console</div>
            </div>
          </div>
        </div>
      </main>

      {isReportOpen ? (
        <ReportModal
          patient={displayPatient}
          vitals={vitals}
          onClose={() => setIsReportOpen(false)}
          onDownload={handleDownloadReport}
        />
      ) : null}

      {selectedAgent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close agent details"
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={() => setSelectedAgent(null)}
          />

          <div
            className={cn(
              "relative z-10 max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-[36px] border border-foreground/10 bg-background shadow-[0_40px_120px_rgba(0,0,0,0.12)]",
              isVisionModal ? "max-w-[1420px]" : selectedAgent.graph ? "max-w-[1520px]" : "max-w-[1180px]",
            )}
          >
            <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-5">
              <div className="flex items-center gap-3">
                {SelectedAgentIcon ? (
                  <span className={cn("rounded-[18px] p-3", selectedAgent.accentIconClass)}>
                    <SelectedAgentIcon className="h-5 w-5" />
                  </span>
                ) : null}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{selectedAgent.role}</div>
                  <h3 className="mt-1 font-mono text-xl text-foreground">{selectedAgent.name}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="rounded-full border border-foreground/10 bg-background/70 p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className={cn(
                "grid gap-6 p-6",
                isVisionModal
                  ? "xl:grid-cols-[1.34fr_0.82fr]"
                  : selectedAgent.graph
                    ? "xl:grid-cols-[minmax(0,1.42fr)_360px]"
                    : "xl:grid-cols-[1.1fr_0.9fr]",
              )}
            >
              <div>
                <div className="grid gap-4 md:grid-cols-3">
                  {selectedAgent.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-4">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</div>
                      <div className="mt-3 font-mono text-lg text-foreground">{metric.value}</div>
                    </div>
                  ))}
                </div>

                {isVisionModal ? (
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-full border-foreground/10 bg-background/70 px-4 text-sm text-white hover:text-white"
                      onClick={() => setShowVisionLabels((currentState) => !currentState)}
                    >
                      {showVisionLabels ? "Hide labels" : "Show labels"}
                    </Button>
                  </div>
                ) : null}

                {selectedAgent.showFeed ? (
                  <PatientFeed
                    patient={displayPatient}
                    className={cn(isVisionModal ? "mt-4 h-[460px] xl:h-[540px]" : "mt-6 h-[360px]")}
                    compact={false}
                    showStatusPanels={selectedAgent.id === "vision"}
                    showTracking={selectedAgent.id === "vision"}
                    showBodyScan={selectedAgent.id === "vision"}
                    showOverlayLabels={selectedAgent.id === "vision" ? showVisionLabels : true}
                    scanPhase={ecgPhase}
                  />
                ) : (
                  <>
                    {selectedAgent.graph ? <HistoricalGraphPanel graph={selectedAgent.graph} /> : null}
                    {selectedAgent.id === "bio" && selectedAgent.holter ? (
                      <HolterComparatorPanel holter={selectedAgent.holter} patient={displayPatient} phase={ecgPhase} />
                    ) : null}

                    {!selectedAgent.graph ? (
                      <div className="mt-6 rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Reasoning focus</div>
                        <h4 className={cn("mt-3 text-xl font-semibold", selectedAgent.accentTextClass)}>
                          {selectedAgent.headline}
                        </h4>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{selectedAgent.summary}</p>
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          {selectedAgent.conclusions.map((conclusion) => (
                            <div
                              key={conclusion}
                              className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                            >
                              {conclusion}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              <div className="space-y-5">
                {selectedAgent.graph ? (
                  <div className="rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Reasoning focus</div>
                    <h4 className={cn("mt-3 text-xl font-semibold", selectedAgent.accentTextClass)}>
                      {selectedAgent.headline}
                    </h4>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{selectedAgent.summary}</p>
                    <div className="mt-5 grid gap-3">
                      {selectedAgent.conclusions.map((conclusion) => (
                        <div
                          key={conclusion}
                          className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                        >
                          {conclusion}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">How it works</div>
                  <div className="mt-4 space-y-3">
                    {selectedAgent.checks.map((check) => (
                      <div
                        key={check}
                        className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        {check}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Inputs</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedAgent.inputs.map((input) => (
                      <Badge
                        key={input}
                        className="rounded-full border border-foreground/10 bg-background/75 px-3 py-1 text-[11px] text-muted-foreground"
                      >
                        {input}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Live room quote</div>
                  <p className="mt-3 text-base leading-relaxed text-foreground">{selectedAgentLine}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Current pulse</div>
                      <div className="mt-2 font-mono text-lg text-foreground">{vitals.heartRate} BPM</div>
                    </div>
                    <div className="rounded-[20px] border border-foreground/10 bg-background/80 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Consensus score</div>
                      <div className="mt-2 font-mono text-lg text-foreground">{vitals.consensusScore}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
