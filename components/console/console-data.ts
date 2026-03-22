import type { StaticImageData } from "next/image";

import patient1Portrait from "@/src/imgs/Patient1.png";
import patient2Portrait from "@/src/imgs/Patient2.png";

export type ConsoleMetric = {
  label: string;
  note?: string;
  value: string;
};

export type PatientTimelineEntry = {
  detail: string;
  time: string;
  title: string;
};

export type WarRoomTone = "normal" | "critical";

export type LiveVitalProfile = {
  alertThreshold: number;
  consensusBase: number;
  consensusSwing: number;
  heartRateBase: number;
  heartRateSwing: number;
  perfusionBase: number;
  perfusionSwing: number;
  perspirationBase: number;
  perspirationSwing: number;
  rigidityBase: number;
  rigiditySwing: number;
};

export type ReportSection = {
  bullets: string[];
  summary: string;
  title: string;
};

export type ReportEvent = {
  decision: string;
  medical: string;
  technical: string;
  time: string;
  title: string;
};

export type DossierNote = {
  bullets: string[];
  summary: string;
};

export type VisionCueProfile = {
  audioBars: number[];
  audioCueTags: string[];
  audioStatus: string;
  bodyScanStatus: string;
  faceCueTags: string[];
  faceStatus: string;
  sensorConfidence: string;
};

export type HistoricalGraphNode = {
  detail?: string;
  highlight?: boolean;
  id: string;
  kind: "patient" | "trait" | "case" | "drug" | "outcome";
  label: string;
  x: number;
  y: number;
};

export type HistoricalGraphEdge = {
  from: string;
  highlight?: boolean;
  to: string;
};

export type HistoricalGraphDefinition = {
  edges: HistoricalGraphEdge[];
  nodes: HistoricalGraphNode[];
  subtitle: string;
  title: string;
};

export type HolterBreakdownDefinition = {
  currentPayload: string;
  databaseLabel: string;
  matchLabel: string;
  referenceLabel: string;
  subtitle: string;
  title: string;
};

export type AgentDefinition = {
  accentBadgeClass: string;
  accentBorderClass: string;
  accentCardClass: string;
  accentIconClass: string;
  accentTextClass: string;
  checks: string[];
  conclusions: string[];
  headline: string;
  graph?: HistoricalGraphDefinition;
  holter?: HolterBreakdownDefinition;
  id: string;
  inputs: string[];
  metrics: ConsoleMetric[];
  name: string;
  quoteStream: string[];
  role: string;
  showFeed?: boolean;
  summary: string;
};

export type WarRoomConfig = {
  agents: AgentDefinition[];
  alertLabel: string;
  alertTone: WarRoomTone;
  bottomNote: string;
  ecgLabel: string;
  liveVerdictBadge: string;
  liveVerdictChip: string;
  reportEvents: ReportEvent[];
  reportSections: ReportSection[];
  signalCards: ConsoleMetric[];
  signalRows: Array<{ detail: string; title: string }>;
  survivingEvidence: Array<{ detail: string; source: string }>;
  terminalLines: string[];
  videoFile: string;
  videoLabel: string;
  vitalProfile: LiveVitalProfile;
  visionCues: VisionCueProfile;
};

export type PatientRecord = {
  admissionSummary: string;
  apparentAge: string;
  baselineRead: string;
  baselinePersonaSource: string;
  chiefInstruction: string;
  code: string;
  condition: string;
  contextCards: ConsoleMetric[];
  demoNote: string;
  directoryNote: string;
  faceReadSummary: string;
  id: string;
  location: string;
  medicalHistory: string[];
  medicalHistorySummary: string;
  monitoringMode: string;
  name: string;
  nursingNote: DossierNote;
  persona: string;
  personaNote: string;
  portrait: StaticImageData;
  portraitAlt: string;
  physicianNote: DossierNote;
  riskLevel: string;
  stayContextLabel: string;
  storyCards: ConsoleMetric[];
  summary: string;
  timeline: PatientTimelineEntry[];
  vitals: ConsoleMetric[];
  warRoom: WarRoomConfig;
  watchlist: string[];
};

const agentAppearance = {
  archive: {
    accentBadgeClass: "bg-sky-100 text-sky-700",
    accentBorderClass: "border-sky-200",
    accentCardClass: "bg-sky-50/80",
    accentIconClass: "bg-sky-100 text-sky-700",
    accentTextClass: "text-sky-700",
    id: "archive",
    name: "Agent Archive",
    role: "Mock EHR",
  },
  bio: {
    accentBadgeClass: "bg-emerald-100 text-emerald-700",
    accentBorderClass: "border-emerald-200",
    accentCardClass: "bg-emerald-50/80",
    accentIconClass: "bg-emerald-100 text-emerald-700",
    accentTextClass: "text-emerald-700",
    id: "bio",
    name: "Agent Bio",
    role: "Biometric Processing",
  },
  chief: {
    accentBadgeClass: "bg-stone-900 text-stone-50",
    accentBorderClass: "border-stone-300",
    accentCardClass: "bg-stone-100/90",
    accentIconClass: "bg-stone-900 text-stone-50",
    accentTextClass: "text-stone-900",
    id: "chief",
    name: "Agent Chief",
    role: "Consensus Orchestrator",
    showFeed: true,
  },
  pharma: {
    accentBadgeClass: "bg-amber-100 text-amber-700",
    accentBorderClass: "border-amber-200",
    accentCardClass: "bg-amber-50/80",
    accentIconClass: "bg-amber-100 text-amber-700",
    accentTextClass: "text-amber-700",
    id: "pharma",
    name: "Agent CrossCheck",
    role: "Historical Graph",
  },
  redteam: {
    accentBadgeClass: "bg-red-100 text-red-700",
    accentBorderClass: "border-red-200",
    accentCardClass: "bg-red-50/80",
    accentIconClass: "bg-red-100 text-red-700",
    accentTextClass: "text-red-700",
    id: "redteam",
    name: "Agent RedTeam",
    role: "Adversarial Skeptic",
  },
  vision: {
    accentBadgeClass: "bg-rose-100 text-rose-700",
    accentBorderClass: "border-rose-200",
    accentCardClass: "bg-rose-50/80",
    accentIconClass: "bg-rose-100 text-rose-700",
    accentTextClass: "text-rose-700",
    id: "vision",
    name: "Agent Vision",
    role: "Observer / OpenCV",
    showFeed: true,
  },
} satisfies Record<string, Partial<AgentDefinition>>;

function buildAgent(
  id: keyof typeof agentAppearance,
  data: Omit<AgentDefinition, keyof (typeof agentAppearance)[typeof id] | "id" | "name" | "role">,
): AgentDefinition {
  return {
    ...agentAppearance[id],
    ...data,
  } as AgentDefinition;
}

const patient1WarRoom: WarRoomConfig = {
  alertLabel: "normal patient loaded",
  alertTone: "normal",
  bottomNote:
    "Current demo uses the normal patient video. Critical-alert variants can be swapped into the same flow later without changing the UI structure.",
  ecgLabel: "sinus rhythm stable",
  liveVerdictBadge: "no active alert",
  liveVerdictChip: "GREEN / NORMAL",
  videoFile: "Patient1_NORMAL.mp4",
  videoLabel: "Patient1_NORMAL.mp4",
  vitalProfile: {
    alertThreshold: 0.55,
    consensusBase: 0.07,
    consensusSwing: 0.01,
    heartRateBase: 74,
    heartRateSwing: 2,
    perfusionBase: 98.3,
    perfusionSwing: 0.3,
    perspirationBase: 0.03,
    perspirationSwing: 0.01,
    rigidityBase: 0.18,
    rigiditySwing: 0.01,
  },
  signalCards: [
    { label: "Perfusion symmetry", note: "bilateral cheeks", value: "stable" },
    { label: "Perspiration drift", note: "micro-sweat index", value: "0.03" },
    { label: "HRV rigidity", note: "below alert band", value: "0.18" },
    { label: "Archive weight", note: "historical context", value: "context only" },
  ],
  signalRows: [
    {
      title: "Optical read",
      detail:
        "Vision keeps bilateral color spread inside the healthy band with no collapse around the nose bridge or brow.",
    },
    {
      title: "Physiology read",
      detail:
        "Bio keeps pulse regular and treats the current variability pattern as baseline-safe rather than rigid, while the Holter comparator stays pinned to normal sinus reference behavior.",
    },
    {
      title: "Adversarial pressure",
      detail:
        "RedTeam fails to turn lighting drift, playback artifacts, or medication masking into a stronger explanation than healthy baseline.",
    },
    {
      title: "Graph cross-check",
      detail:
        "Historical nearest-neighbor review favors the silent-infarction danger case over the stable decoy, but the room still lacks enough cross-agent pressure to escalate beyond watch mode.",
    },
  ],
  survivingEvidence: [
    {
      source: "Vision",
      detail: "Bilateral perfusion spread remains even and the face lock stays inside tolerance.",
    },
    {
      source: "Bio",
      detail: "Pulse trace remains sinus-regular with no rigidity surge or perfusion collapse, and the Holter baseline lane does not surface any electrical-decay match.",
    },
    {
      source: "CrossCheck",
      detail: "Graph nearest-neighbor review maps Morgan to the danger trajectory, but the live room still stays under alert threshold overall.",
    },
  ],
  visionCues: {
    audioBars: [12, 20, 16, 18, 14, 19],
    audioCueTags: ["breath noise low", "no cough", "no vocal strain"],
    audioStatus: "audio lane quiet",
    bodyScanStatus: "body scan active",
    faceCueTags: ["neutral brow", "sealed mouth", "steady blink"],
    faceStatus: "Face box aligned, distress cues absent",
    sensorConfidence: "94.2%",
  },
  terminalLines: [],
  reportSections: [],
  reportEvents: [],
  agents: [],
};

const patient2WarRoom: WarRoomConfig = {
  alertLabel: "critical alert live",
  alertTone: "critical",
  bottomNote:
    "Critical-alert scenario is live. The room has already crossed threshold and routed the escalation path to the hospital response chain.",
  ecgLabel: "sub-threshold unstable rhythm",
  liveVerdictBadge: "hospital alert active",
  liveVerdictChip: "RED / CRITICAL",
  videoFile: "Patient2.mp4",
  videoLabel: "Patient2.mp4",
  vitalProfile: {
    alertThreshold: 0.55,
    consensusBase: 0.84,
    consensusSwing: 0.03,
    heartRateBase: 92,
    heartRateSwing: 7,
    perfusionBase: 94.2,
    perfusionSwing: 0.8,
    perspirationBase: 0.38,
    perspirationSwing: 0.03,
    rigidityBase: 0.67,
    rigiditySwing: 0.04,
  },
  signalCards: [
    { label: "Face cue cluster", note: "brow, mouth, blink", value: "high" },
    { label: "Audio distress", note: "breath strain model", value: "0.82" },
    { label: "Perfusion withdrawal", note: "facial color loss", value: "-4.2%" },
    { label: "Escalation gate", note: "Chief state", value: "open" },
  ],
  signalRows: [
    {
      title: "Optical read",
      detail:
        "Vision sees brow tension, open-mouth recovery breathing, and visible facial strain that persist across multiple frames instead of collapsing as noise.",
    },
    {
      title: "Physiology read",
      detail:
        "Bio keeps pulse in the low 90s with rapid up-down swings that repeatedly brush 100 BPM, stays below a classic ICU alarm threshold, and still maps the live optical trace to a dangerous pre-VFib Holter signature.",
    },
    {
      title: "Audio corroboration",
      detail:
        "The audio lane contributes repeated labored-breath cues, so the room has both visible and audible evidence of respiratory distress.",
    },
    {
      title: "Graph cross-check",
      detail:
        "Nearest-neighbor graph review lands directly on the arrest trajectory, so Chief treats the cluster as a real pre-collapse pattern rather than a false alarm.",
    },
  ],
  survivingEvidence: [
    {
      source: "Vision",
      detail: "Facial strain cluster holds through brow tightening, mouth opening, and poor recovery between breaths.",
    },
    {
      source: "Audio",
      detail: "Labored-breath cadence aligns with the visible distress window and boosts confidence in a real event.",
    },
    {
      source: "Bio",
      detail: "Heart rate oscillates rapidly through the low 90s and repeatedly brushes 100 BPM, while the Holter comparator maps the optical trace to pre-VFib electrical decay despite the bedside alarm staying quiet.",
    },
    {
      source: "CrossCheck",
      detail: "Historical graph overlap lands on the arrest trajectory and supports escalation before the bedside monitor reaches a conventional tachycardia threshold.",
    },
  ],
  visionCues: {
    audioBars: [82, 61, 94, 70, 86, 72],
    audioCueTags: ["labored breathing", "gasp cadence", "voice strain"],
    audioStatus: "audio stress cues active",
    bodyScanStatus: "thoracic scan active",
    faceCueTags: ["brow tension", "mouth opening", "nasal flare"],
    faceStatus: "Face box locked, distress cues rising",
    sensorConfidence: "97.1%",
  },
  terminalLines: [],
  reportSections: [],
  reportEvents: [],
  agents: [],
};

patient1WarRoom.terminalLines = [
  "[Chief] Syncing patient display, detached webcam, and swarm telemetry.",
  "[Vision] Face lock stable. Perfusion drift remains under threshold.",
  "[Bio] Holter baseline check: normal sinus rhythm. RR-interval variance remains nominal.",
  "[Archive] Historical vascular risk loaded for context only.",
  "[CrossCheck] Morgan maps to MIMIC_HADM_145834 on three shared clinical vectors.",
  "[RedTeam] Lighting and playback artifact challenges rejected.",
  "[Chief] Aggregating evidence across the consensus engine.",
  "[Chief] Consensus score 0.07. Alert threshold not met.",
  "[Chief] Final instruction: continue monitoring. No intervention required.",
];

patient1WarRoom.reportSections = [
  {
    title: "Presenting Context",
    summary: "Normal surveillance case reviewed under passive paralysis-watch conditions with no concordant distress pattern identified.",
    bullets: [
      "Detached webcam relay remained technically stable throughout the observation window.",
      "The patient baseline is low-expression, which raises the value of camera-based surveillance despite a quiet visual presentation.",
      "Consensus remained below the escalation threshold and observation mode was maintained.",
    ],
  },
  {
    title: "Objective Surveillance Findings",
    summary: "Optical, biometric, and audio-adjacent surveillance signals remained within the expected baseline-safe range.",
    bullets: [
      "Face lock remained aligned with low micro-expression variance and no persistent strain cues.",
      "rPPG pulse extraction remained adequate for stable heart-rate estimation without rigidity escalation, and the Holter baseline comparator stayed consistent with normal sinus rhythm.",
      "Historical graph review leaned toward the danger trajectory, but the live room still lacked enough corroboration to force escalation.",
    ],
  },
  {
    title: "Clinical Assessment",
    summary: "The available evidence does not support acute cardiopulmonary compromise during the reviewed interval.",
    bullets: [
      "Perfusion remained symmetric across the monitored facial regions.",
      "HRV rigidity stayed below the alert band.",
      "Historical vascular risk increased vigilance but did not justify intervention.",
    ],
  },
  {
    title: "Disposition",
    summary: "No escalation was warranted from the autonomous surveillance system at the time of review.",
    bullets: [
      "Recommended action was continued passive monitoring.",
      "No bedside alert, rapid-response notification, or physician escalation was triggered.",
      "System remains appropriate for ongoing surveillance should the pattern change later.",
    ],
  },
];

patient1WarRoom.reportEvents = [
  {
    time: "07:10",
    title: "Surveillance session started",
    technical: "Patient monitor playback and detached webcam relay entered sync with stable lighting.",
    medical: "Normal passive surveillance commenced for low-expression paralysis watch.",
    decision: "Observation mode opened. No escalation pathway activated.",
  },
  {
    time: "08:42",
    title: "Baseline face model refreshed",
    technical: "Face lock recalibrated and perfusion baseline re-established after room-light normalization.",
    medical: "No distress cluster emerged during recalibration.",
    decision: "Safe baseline maintained for ongoing watch.",
  },
  {
    time: "09:05",
    title: "Historical graph cross-check completed",
    technical: "Nearest-neighbor graph review mapped Morgan to the danger case, but the broader room did not yet corroborate escalation.",
    medical: "Historical risk raised vigilance while current live evidence remained below actionable threshold.",
    decision: "Chief treated the graph result as context-only pressure and kept passive observation open.",
  },
  {
    time: "09:16",
    title: "Consensus closed",
    technical: "Vision, Bio, CrossCheck, and RedTeam converged on a non-alert interpretation after the Holter baseline comparator returned a nominal electrical profile.",
    medical: "No respiratory strain, no pallor collapse, and no HRV rigidity spike were present.",
    decision: "Continue passive monitoring. No intervention required.",
  },
];

patient2WarRoom.terminalLines = [
  "[Chief] Syncing patient display, detached webcam, audio lane, and swarm telemetry.",
  "[Vision] Facial distress cluster detected. Brow tension and mouth opening persist across frames.",
  "[Vision] Audio lane confirms labored-breath cadence above room-noise threshold.",
  "[Bio] PhysioNet Holter Record 47 cross-match returns a 94% pre-VFib electrical-decay signature while HR remains sub-threshold.",
  "[Archive] Prior cardiopulmonary risk raises the cost of waiting.",
  "[CrossCheck] Rowan maps to MIMIC_HADM_192833 on four shared clinical vectors.",
  "[RedTeam] Lighting and playback objections fail. Distress cluster survives attack.",
  "[Chief] Consensus score 0.84. Predictive alert threshold exceeded before overt collapse.",
  "[Chief] Rapid response notification issued. Bedside team, charge nurse, and hospital escalation path alerted.",
];

patient2WarRoom.reportSections = [
  {
    title: "Presenting Concern",
    summary: "Autonomous surveillance identified a concordant visual, audio, and biometric distress pattern concerning for acute cardiopulmonary compromise.",
    bullets: [
      "Facial strain, respiratory effort, and audio distress cues rose together rather than appearing in isolation.",
      "Biometric channels moved out of the patient's safe baseline band despite remaining below a conventional bedside tachycardia alarm threshold.",
      "Consensus crossed the escalation threshold and triggered bedside notification.",
    ],
  },
  {
    title: "Objective Surveillance Findings",
    summary: "The alert is supported by multiple channels of evidence and not by a single brittle visual feature.",
    bullets: [
      "Vision detected brow tension, mouth opening, and perfusion withdrawal.",
      "Bio cross-referenced the optical trace against a Holter-style sudden-death library and matched the current instability to pre-VFib electrical decay.",
      "Audio lane detected repeated labored-breath cadence consistent with respiratory strain.",
      "Historical graph review landed on the arrest trajectory and reinforced that the cluster was not a benign decoy.",
    ],
  },
  {
    title: "Clinical Assessment",
    summary: "The combined pattern is medically concerning for acute cardiopulmonary deterioration and requires immediate bedside review.",
    bullets: [
      "Sub-threshold heart-rate oscillation with elevated HRV rigidity raises concern for pre-collapse destabilization even before a classic ICU tachycardia alarm fires.",
      "The Holter comparator indicates a high-probability match to pre-VFib electrical decay rather than benign anxiety or playback noise.",
      "Visible work of breathing and facial strain suggest respiratory compromise rather than a flat baseline state.",
      "Recommended next steps are escalation, oxygenation check, vitals confirmation, and physician review.",
    ],
  },
  {
    title: "Escalation and Disposition",
    summary: "The system transitioned from surveillance to action once the distress cluster survived adversarial review.",
    bullets: [
      "Bedside nurse notified.",
      "Charge nurse and rapid response pathway notified.",
      "Chief terminal remains in alert mode until bedside confirmation closes the loop.",
    ],
  },
];

patient2WarRoom.reportEvents = [
  {
    time: "10:12",
    title: "Surveillance session started",
    technical: "Detached webcam, patient monitor playback, and audio lane entered sync under stable room-light conditions.",
    medical: "Monitoring opened for a higher-risk paralysis watch case.",
    decision: "Passive observation started while the room established baseline capture quality.",
  },
  {
    time: "10:13",
    title: "Facial distress cluster flagged",
    technical: "Vision isolated persistent brow tension, mouth opening, and reduced color return across the cheeks.",
    medical: "Visible strain and recovery-breath posture suggested worsening work of breathing.",
    decision: "Chief raised internal vigilance and requested cross-agent confirmation before paging staff.",
  },
  {
    time: "10:14",
    title: "Electrical breakdown comparator crossed threshold",
    technical: "Bio mapped the live optical trace against PhysioNet Sudden Cardiac Death Holter Record 47 and surfaced a high-probability pre-VFib decay match.",
    medical: "The pattern now carried an electrical-risk signature despite heart rate remaining below a conventional tachycardia alarm threshold.",
    decision: "Bio evidence was promoted from watch-only to alert-candidate status and pushed to the Chief.",
  },
  {
    time: "10:15",
    title: "RedTeam objections collapsed",
    technical: "Lighting and playback artifact theories failed, the Holter comparator stayed positive, and the nearest-neighbor graph match remained locked to the arrest trajectory.",
    medical: "No benign explanation remained stronger than an evolving pre-collapse strain pattern with historical precedent.",
    decision: "Chief opened the escalation gate and prepared a hospital alert.",
  },
  {
    time: "10:16",
    title: "Hospital alert issued",
    technical: "Consensus held above threshold long enough for the Chief to route the final action state.",
    medical: "The room classified the case as active cardiopulmonary distress requiring immediate bedside confirmation.",
    decision: "Bedside nurse, charge nurse, and rapid response pathway notified. Alert remains active.",
  },
];

patient1WarRoom.agents = [
  buildAgent("vision", {
    headline: "Face cues remain quiet",
    summary:
      "Tracks facial strain, perfusion drift, and the ambient audio lane from the detached webcam feed pointed at the monitor.",
    metrics: [
      { label: "Face cue index", value: "0.12" },
      { label: "Audio stress", value: "0.08" },
      { label: "Pallor drift", value: "-0.2%" },
    ],
    inputs: ["Detached webcam stream", "Facial landmark lock", "Ambient audio cue lane"],
    checks: [
      "Rejects noisy frames before they enter the swarm",
      "Measures micro-sweating against the room-light baseline",
      "Listens for cough, gasp, or strain artifacts that would support visual distress",
    ],
    conclusions: [
      "No perfusion collapse in the current normal feed",
      "No facial distress signature detected",
      "Audio lane stays quiet enough to support baseline normal",
    ],
    quoteStream: [
      "Vision channel stable. No facial distress pattern emerging.",
      "Perfusion map remains symmetrical across both cheeks.",
      "Audio lane stays quiet. No labored-breath cue survives review.",
    ],
  }),
  buildAgent("bio", {
    headline: "Baseline physiology intact",
    summary:
      "Converts the face stream into pulse, variability, and perfusion features, then checks the read against a safe Holter-style electrical baseline before elevating concern.",
    holter: {
      title: "Holter electrical comparator",
      subtitle: "Bio cross-checks the optical pulse trace against a Holter-style baseline before it gives Chief any reason to worry.",
      databaseLabel: "PhysioNet Holter baseline lane",
      referenceLabel: "Normal sinus reference",
      matchLabel: "baseline-safe electrical profile",
      currentPayload: "[BIO_AGENT]: Holter DB baseline check. Normal sinus rhythm. RR-interval variance nominal.",
    },
    metrics: [
      { label: "Heart rate", value: "74 BPM" },
      { label: "HRV rigidity", value: "0.18" },
      { label: "Perfusion", value: "98.3%" },
    ],
    inputs: ["rPPG pulse trace", "Perfusion spread", "Simulated bedside vitals"],
    checks: [
      "Flags rigid heart-rate variability",
      "Cross-checks perfusion, pulse, and perspiration",
      "Compares the live optical trace against a Holter-style baseline reference",
      "Suppresses patterns that still look like a healthy baseline",
    ],
    conclusions: [
      "Pulse rhythm is regular",
      "Holter baseline comparator stays nominal",
      "No oxygen-collapse proxy is present",
      "Current physiology reads normal-monitoring",
    ],
    quoteStream: [
      "Bio read matches Vision. No acute cardiac stress signature.",
      "Holter baseline check holds on normal sinus rhythm with nominal RR variance.",
      "HRV rigidity is not elevated enough to challenge baseline normal.",
    ],
  }),
  buildAgent("archive", {
    headline: "Historical risk adds context",
    summary:
      "Pulls prior admissions and vascular notes so the swarm compares live signals against this patient, not against an average patient.",
    metrics: [
      { label: "Risk history", value: "Moderate" },
      { label: "Prior MI flags", value: "0" },
      { label: "Admissions", value: "2" },
    ],
    inputs: ["Mock EHR profile", "Discharge summaries", "Vascular-history tags"],
    checks: [
      "Separates chronic baseline from acute change",
      "Raises vigilance without auto-triggering alerts",
      "Provides context weighting to the Chief",
    ],
    conclusions: [
      "Background risk is real but not currently decisive",
      "No prior event mirrors this normal feed",
      "Archive increases watchfulness, not panic",
    ],
    quoteStream: [
      "Archive weighting is moderate, not alarming.",
      "Historical vascular risk exists, but there is no acute precedent.",
      "No record evidence contradicts the stable live read.",
    ],
  }),
  buildAgent("pharma", {
    headline: "Topological match favors silent infarction",
    summary:
      "Cross-checks Morgan against historical stroke trajectories through a case graph to find the closest topological match.",
    graph: {
      title: "Morgan nearest-case topology",
      subtitle: "Patient node, shared clinical traits, nearest danger match, and the competing safe decoy.",
      nodes: [
        { id: "pt001", kind: "patient", label: "PT-001\nMorgan", x: 12, y: 52, highlight: true, detail: "live patient" },
        { id: "trait-stroke", kind: "trait", label: "Post-stroke\nParalysis", x: 34, y: 24, highlight: true },
        { id: "trait-vascular", kind: "trait", label: "Vascular\nHistory", x: 36, y: 50, highlight: true },
        { id: "trait-hrv", kind: "trait", label: "HRV\nRigidity", x: 35, y: 76, highlight: true },
        { id: "case-danger-1", kind: "case", label: "MIMIC\n145834", x: 69, y: 33, highlight: true, detail: "danger match" },
        { id: "case-decoy-1", kind: "case", label: "MIMIC\n112213", x: 69, y: 77, detail: "safe decoy" },
        { id: "drug-heparin", kind: "drug", label: "Heparin", x: 91, y: 16, highlight: true },
        { id: "drug-nitro", kind: "drug", label: "Nitroglycerin", x: 92, y: 30, highlight: true },
        { id: "outcome-silent-mi", kind: "outcome", label: "Silent\nInfarction", x: 90, y: 47, highlight: true },
        { id: "trait-low-expression", kind: "trait", label: "Low Expression\nBaseline", x: 50, y: 90 },
        { id: "drug-aspirin", kind: "drug", label: "Aspirin", x: 89, y: 70 },
        { id: "drug-metoprolol", kind: "drug", label: "Metoprolol", x: 91, y: 84 },
        { id: "outcome-stable", kind: "outcome", label: "Stable", x: 88, y: 96 },
      ],
      edges: [
        { from: "pt001", to: "trait-stroke", highlight: true },
        { from: "pt001", to: "trait-vascular", highlight: true },
        { from: "pt001", to: "trait-hrv", highlight: true },
        { from: "case-danger-1", to: "trait-stroke", highlight: true },
        { from: "case-danger-1", to: "trait-vascular", highlight: true },
        { from: "case-danger-1", to: "trait-hrv", highlight: true },
        { from: "case-danger-1", to: "drug-heparin", highlight: true },
        { from: "case-danger-1", to: "drug-nitro", highlight: true },
        { from: "case-danger-1", to: "outcome-silent-mi", highlight: true },
        { from: "case-decoy-1", to: "trait-stroke" },
        { from: "case-decoy-1", to: "trait-low-expression" },
        { from: "case-decoy-1", to: "drug-aspirin" },
        { from: "case-decoy-1", to: "drug-metoprolol" },
        { from: "case-decoy-1", to: "outcome-stable" },
      ],
    },
    metrics: [
      { label: "Closest case", value: "145834" },
      { label: "Shared vectors", value: "3" },
      { label: "Trajectory", value: "Silent MI" },
    ],
    inputs: ["Case graph", "Trait overlap search", "Historical trajectory nodes"],
    checks: [
      "Builds a case graph from prior trajectories and active patient traits",
      "Counts shared neighbors between Morgan and each prior case",
      "Pushes the nearest-case trajectory into the Chief once the graph outranks the safe decoy",
    ],
    conclusions: [
      "Morgan maps most closely to the danger trajectory, not the stable decoy",
      "Historical medication load does not explain away HRV rigidity",
      "Cross-check lane increases urgency despite the patient's quiet baseline expression",
    ],
    quoteStream: [
      "Graph cross-reference complete. Morgan matches MIMIC_HADM_145834 on three clinical vectors.",
      "Nearest historical trajectory points toward silent infarction rather than a stable post-stroke baseline.",
      "Cross-check lane rejects the safe decoy. The graph is not clearing this back to normal.",
    ],
  }),
  buildAgent("redteam", {
    headline: "False-positive pressure active",
    summary:
      "Attempts to break every alarm theory by blaming lighting drift, playback artifacts, or medication noise before the Chief can escalate.",
    metrics: [
      { label: "Lighting challenge", value: "Rejected" },
      { label: "Playback artifact", value: "Low" },
      { label: "Alarm resistance", value: "High" },
    ],
    inputs: ["All agent outputs", "Scene-lighting checks", "Medication and archive context"],
    checks: [
      "Challenges pallor as exposure drift",
      "Challenges pulse irregularity as playback artifact",
      "Blocks escalation until evidence survives attack",
    ],
    conclusions: [
      "No alert pathway survives the current counterfactuals",
      "Best explanation remains stable baseline",
      "RedTeam rejects escalation under present evidence",
    ],
    quoteStream: [
      "Counterpoint: I still do not see enough to justify an alert.",
      "Lighting artifact theory tested and rejected. Feed remains normal.",
      "Skeptic verdict: no escalation pathway survives review.",
    ],
  }),
  buildAgent("chief", {
    headline: "Consensus: observe only",
    summary:
      "Weighs the entire room, resolves RedTeam objections, and streams the final operational instruction across the terminal.",
    metrics: [
      { label: "Consensus score", value: "0.07" },
      { label: "Alert state", value: "Green" },
      { label: "Escalation gate", value: "Closed" },
    ],
    inputs: ["All six agent outputs", "Consensus weighting", "RedTeam challenge results"],
    checks: [
      "Waits for cross-agent agreement before escalating",
      "Down-weights any claim RedTeam can break",
      "Streams the final decision into the terminal",
    ],
    conclusions: [
      "Current patient video remains normal",
      "Consensus score is well below alert threshold",
      "Action: continue passive surveillance",
    ],
    quoteStream: [
      "Chief verdict: monitor only. No cardiac alert.",
      "Consensus stable. Maintain observation posture.",
      "Terminal update: all channels aligned to baseline normal.",
    ],
  }),
];

patient2WarRoom.agents = [
  buildAgent("vision", {
    headline: "Facial distress cluster detected",
    summary:
      "Tracks facial strain, respiratory effort, and audio stress cues from the distressed patient relay instead of relying on a single visual anomaly.",
    metrics: [
      { label: "Face cue index", value: "0.86" },
      { label: "Audio stress", value: "0.82" },
      { label: "Pallor drift", value: "-6.7%" },
    ],
    inputs: ["Detached webcam stream", "Face lock and cue map", "Ambient audio cue lane"],
    checks: [
      "Measures brow tension, mouth opening, and blink recovery",
      "Listens for labored-breath cadence, gasp patterns, and vocal strain",
      "Rejects transient noise unless visual and audio cues persist together",
    ],
    conclusions: [
      "Facial strain pattern is persistent rather than incidental",
      "Audio corroboration supports true respiratory distress",
      "Vision channel is no longer compatible with a safe baseline reading",
    ],
    quoteStream: [
      "Vision flag: brow tension, mouth opening, and poor recovery are holding across frames.",
      "Audio lane confirms labored breathing. This is not just a visual blip.",
      "Face cues are escalating, not resolving. Distress cluster remains active.",
    ],
  }),
  buildAgent("bio", {
    headline: "Cardiopulmonary strain escalating",
    summary:
      "Converts the relay into pulse, variability, and perfusion features, then cross-references the optical trace against a Holter-style electrical failure signature before overt collapse.",
    holter: {
      title: "Holter electrical comparator",
      subtitle: "Bio is comparing Rowan's unstable optical pulse pattern against a sudden-cardiac-death Holter reference to justify escalation before a bedside alarm fires.",
      databaseLabel: "PhysioNet SCD Holter lane",
      referenceLabel: "Holter Record 47",
      matchLabel: "94% pre-VFib decay match",
      currentPayload: `[BIO_AGENT]: LIVE TELEMETRY ANOMALY DETECTED.
Initiating cross-reference with PhysioNet Sudden Cardiac Death Holter Database.
Mapping live rPPG waveform to historical Holter Record 47...

ELECTRICAL BREAKDOWN MATCH:
- RR-Interval Rigidity: Critical (Variance < 15ms)
- QRS Complex: Widening (Estimated > 120ms equivalent)
- Repolarization: T-wave alternans detected in optical cascade.

[VERDICT]: Live biological signature is a 94% match for pre-Ventricular Fibrillation (VFib) electrical decay. Cardiac muscle is currently starving of oxygen.`,
    },
    metrics: [
      { label: "Heart rate", value: "92-99 BPM" },
      { label: "HRV rigidity", value: "0.67" },
      { label: "Perfusion", value: "94.2%" },
    ],
    inputs: ["rPPG pulse trace", "Perfusion spread", "Simulated bedside vitals"],
    checks: [
      "Flags rapid beat-to-beat instability before overt tachycardia",
      "Cross-checks pulse, perspiration, and perfusion collapse",
      "Maps the live optical trace against a sudden-cardiac-death Holter reference lane",
      "Tests whether the pattern still fits a safe baseline band",
    ],
    conclusions: [
      "Pulse and rigidity now look unstable enough to matter before a bedside threshold alarm fires",
      "Holter comparator aligns the trace with pre-VFib electrical decay",
      "Perfusion has moved away from the comfortable baseline",
      "Bio channel supports escalation rather than observation",
    ],
    quoteStream: [
      "Bio read has left baseline. This is not a quiet physiology trace anymore.",
      "Holter cross-reference lands on pre-VFib electrical decay even while the bedside threshold still has not fired.",
      "Sub-threshold does not mean safe here. The instability pattern remains above the room's predictive risk band.",
    ],
  }),
  buildAgent("archive", {
    headline: "Historical risk sharpens urgency",
    summary:
      "Pulls prior admissions and cardiopulmonary context so the swarm can weigh whether waiting is riskier than escalating.",
    metrics: [
      { label: "Risk history", value: "High" },
      { label: "Prior MI flags", value: "2" },
      { label: "Admissions", value: "6" },
    ],
    inputs: ["Mock EHR profile", "Prior ICU notes", "Cardiopulmonary history"],
    checks: [
      "Separates chronic history from present-tense deterioration",
      "Raises the cost of waiting when the current pattern looks acute",
      "Adds urgency weighting to the Chief",
    ],
    conclusions: [
      "History increases concern rather than calming the room",
      "Prior risk makes this pattern more dangerous to ignore",
      "Archive channel supports rapid bedside confirmation",
    ],
    quoteStream: [
      "Archive context raises the penalty for hesitation here.",
      "This patient has enough background risk that the room should not stall on a weak objection.",
      "Historical context supports escalation once the live signal cluster holds.",
    ],
  }),
  buildAgent("pharma", {
    headline: "Historical graph flags arrest trajectory",
    summary:
      "Cross-checks Rowan against historical cardiopulmonary failure trajectories through a case graph to find the nearest historical match.",
    graph: {
      title: "Rowan nearest-case topology",
      subtitle: "Patient node, respiratory strain traits, nearest arrest match, and the competing agitation decoy.",
      nodes: [
        { id: "pt002", kind: "patient", label: "PT-002\nRowan", x: 12, y: 52, highlight: true, detail: "live patient" },
        { id: "trait-paralysis", kind: "trait", label: "Paralysis\nBaseline", x: 33, y: 20, highlight: true },
        { id: "trait-breath", kind: "trait", label: "Labored\nBreathing", x: 35, y: 42, highlight: true },
        { id: "trait-perfusion", kind: "trait", label: "Perfusion\nWithdrawal", x: 37, y: 62, highlight: true },
        { id: "trait-rigidity", kind: "trait", label: "HRV Rigidity\n> 0.60", x: 37, y: 82, highlight: true },
        { id: "case-danger-2", kind: "case", label: "MIMIC\n192833", x: 69, y: 38, highlight: true, detail: "danger match" },
        { id: "case-decoy-2", kind: "case", label: "MIMIC\n109244", x: 69, y: 82, detail: "agitation decoy" },
        { id: "drug-furosemide", kind: "drug", label: "Furosemide", x: 92, y: 24, highlight: true },
        { id: "outcome-arrest", kind: "outcome", label: "Acute\nCardiopulmonary\nArrest", x: 91, y: 50, highlight: true },
        { id: "trait-visible-strain", kind: "trait", label: "Visible\nStrain", x: 50, y: 96 },
        { id: "drug-lorazepam", kind: "drug", label: "Lorazepam", x: 91, y: 78 },
        { id: "outcome-agitation", kind: "outcome", label: "Stable\nAgitation", x: 91, y: 95 },
      ],
      edges: [
        { from: "pt002", to: "trait-paralysis", highlight: true },
        { from: "pt002", to: "trait-breath", highlight: true },
        { from: "pt002", to: "trait-perfusion", highlight: true },
        { from: "pt002", to: "trait-rigidity", highlight: true },
        { from: "case-danger-2", to: "trait-paralysis", highlight: true },
        { from: "case-danger-2", to: "trait-breath", highlight: true },
        { from: "case-danger-2", to: "trait-perfusion", highlight: true },
        { from: "case-danger-2", to: "trait-rigidity", highlight: true },
        { from: "case-danger-2", to: "drug-furosemide", highlight: true },
        { from: "case-danger-2", to: "outcome-arrest", highlight: true },
        { from: "case-decoy-2", to: "trait-paralysis" },
        { from: "case-decoy-2", to: "trait-visible-strain" },
        { from: "case-decoy-2", to: "drug-lorazepam" },
        { from: "case-decoy-2", to: "outcome-agitation" },
      ],
    },
    metrics: [
      { label: "Closest case", value: "192833" },
      { label: "Shared vectors", value: "4" },
      { label: "Trajectory", value: "Arrest" },
    ],
    inputs: ["Case graph", "Trait overlap search", "Historical trajectory nodes"],
    checks: [
      "Builds a case graph from prior cardiopulmonary trajectories and active patient traits",
      "Counts shared neighbors between Rowan and each historical admission",
      "Routes the nearest-case trajectory into the Chief once the graph beats the agitation decoy",
    ],
    conclusions: [
      "Rowan maps directly to the danger trajectory rather than the agitation decoy",
      "Topological overlap supports escalation before the bedside monitor reaches a classic tachycardia threshold",
      "Cross-check lane raises confidence that this is a real pre-collapse event",
    ],
    quoteStream: [
      "Graph cross-reference complete. Rowan matches MIMIC_HADM_192833 on four clinical vectors.",
      "Nearest historical trajectory points toward acute cardiopulmonary arrest, not stable agitation.",
      "Cross-check lane is aligned with Vision and Bio. Escalation should not wait for HR to break 100.",
    ],
  }),
  buildAgent("redteam", {
    headline: "Counterarguments collapsing",
    summary:
      "Attempts to break the alert by blaming lighting drift, playback artifacts, or confounders. In this case the distress cluster keeps surviving.",
    metrics: [
      { label: "Lighting challenge", value: "Failed" },
      { label: "Playback artifact", value: "Rejected" },
      { label: "Alarm resistance", value: "Low" },
    ],
    inputs: ["All agent outputs", "Scene-lighting checks", "Medication and archive context"],
    checks: [
      "Challenges facial strain as exposure drift",
      "Challenges pulse irregularity as playback artifact",
      "Blocks escalation until the evidence survives attack",
    ],
    conclusions: [
      "No benign explanation beats the distress cluster",
      "RedTeam cannot break the combined visual, audio, and biometric case",
      "The alert survives skeptical review",
    ],
    quoteStream: [
      "I attacked lighting, playback, and meds. The cluster still stands.",
      "Counterfactuals are collapsing. I cannot clear this back to baseline.",
      "RedTeam verdict: alert case survives review.",
    ],
  }),
  buildAgent("chief", {
    headline: "Consensus: hospital alert live",
    summary:
      "Weighs the entire room, resolves RedTeam objections, and escalates when the predictive pattern is dangerous even before classic bedside alarm thresholds are crossed.",
    metrics: [
      { label: "Consensus score", value: "0.84" },
      { label: "Alert state", value: "Red" },
      { label: "Escalation gate", value: "Open" },
    ],
    inputs: ["All six agent outputs", "Consensus weighting", "RedTeam challenge results"],
    checks: [
      "Waits for cross-agent agreement before escalating",
      "Down-weights any claim RedTeam can break",
      "Routes bedside and hospital notifications once threshold is crossed",
    ],
    conclusions: [
      "Current patient video indicates active distress with predictive deterioration risk",
      "Consensus score is well above alert threshold",
      "Action: escalate immediately and notify hospital staff",
    ],
    quoteStream: [
      "Chief verdict: escalate now. Hospital alert is live.",
      "Consensus remains above threshold. Keep the escalation path open.",
      "Terminal update: bedside nurse and response chain notified.",
    ],
  }),
];

export const patients: PatientRecord[] = [
  {
    id: "patient-1",
    code: "PT-001",
    name: "Morgan Ellison",
    apparentAge: "56",
    persona: "Quiet Strategist",
    condition: "Post-stroke paralysis watch",
    location: "Neuro Step-Down // Bed 04",
    stayContextLabel: "Hospital day 11 // spouse listed as primary contact",
    riskLevel: "Moderate vascular history",
    monitoringMode: "Passive room-camera surveillance",
    summary:
      "Admitted after ischemic stroke with residual left-sided paralysis. Retired civil engineer, lives with spouse, communicates politely but briefly, and tends to understate discomfort unless directly asked.",
    admissionSummary:
      "Transferred from acute stroke service to neuro step-down after stabilization. Current admission focus is paralysis recovery, vascular-risk monitoring, and watching for subtle autonomic or cardiopulmonary drift that may not be outwardly dramatic.",
    baselineRead:
      "Portrait read: apparent mid-to-late 50s, steady eye contact, reserved facial affect, and mild fatigue around the eyes.",
    faceReadSummary:
      "The face reads as controlled and quiet. That matters because subtle cardiac drift can hide in patients who do not visibly perform distress.",
    personaNote:
      "Composed, methodical, and slow to visibly signal discomfort. Over the first 11 hospital days, staff documentation repeatedly describes Morgan as cooperative, stoic, and unlikely to volunteer symptoms without direct prompting.",
    baselinePersonaSource:
      "Based on 11 days of step-down nursing, physician, and therapy documentation during the current admission.",
    contextCards: [
      { label: "Hospital day", value: "11", note: "Neuro step-down stay" },
      { label: "Admitting problem", value: "Ischemic stroke", note: "Residual paralysis baseline" },
      { label: "Home context", value: "Lives with spouse", note: "Adult daughter nearby" },
      { label: "Communication", value: "Brief / stoic", note: "Often underreports discomfort" },
    ],
    medicalHistorySummary:
      "Residual paralysis after prior stroke, chronic vascular disease, and a chart pattern that makes quiet deterioration more dangerous than dramatic deterioration.",
    medicalHistory: [
      "Prior ischemic stroke with persistent paralysis baseline and reduced expressive range during routine care.",
      "Known vascular-risk burden and blood-pressure variability increase the cost of missing subtle physiologic drift.",
      "Previous admissions read as clinically quiet, so this patient benefits from surveillance that catches low-theater changes early.",
    ],
    physicianNote: {
      summary:
        "Neurology and hospitalist notes describe a medically stable post-stroke recovery course, but emphasize that Morgan's low-expression baseline can make meaningful decline look deceptively calm.",
      bullets: [
        "Residual hemiparesis is chronic for this admission and should not be confused with new decompensation.",
        "Vascular history supports a lower threshold for reviewing unexplained autonomic or cardiopulmonary drift.",
        "Clinical team repeatedly notes that symptom reporting is delayed unless staff ask direct, specific questions.",
      ],
    },
    nursingNote: {
      summary:
        "Bedside nursing describes Morgan as courteous, independent-minded, and not someone who presses the call light early when feeling off.",
      bullets: [
        "Facial affect stays flat even during uncomfortable care tasks, which can hide early distress by appearance alone.",
        "Usually responds in short phrases and minimizes complaints unless prompted twice.",
        "Baseline on the floor is calm, quiet, and easy to over-read as 'doing fine' when more subtle changes are present.",
      ],
    },
    directoryNote:
      "Normal video loaded. No active alert, but the patient remains a strong demo case because the face baseline is restrained rather than expressive.",
    chiefInstruction: "Continue passive monitoring. No escalation required.",
    demoNote:
      "This profile is a demo dossier assembled from the provided portrait plus the normal-monitoring patient video.",
    portrait: patient1Portrait,
    portraitAlt: "Portrait used for patient one dossier",
    storyCards: [
      { label: "Apparent age", value: "56", note: "Estimated from portrait" },
      { label: "Baseline affect", value: "Calm / guarded", note: "Low-expression face" },
      { label: "Current mode", value: "Passive watch", note: "Detached webcam feed" },
      { label: "Escalations today", value: "0", note: "Normal scenario" },
    ],
    vitals: [
      { label: "Baseline heart rate", value: "74 BPM", note: "rPPG-derived" },
      { label: "Perfusion spread", value: "98.3%", note: "Stable facial color map" },
      { label: "HRV rigidity", value: "0.18", note: "Below alert band" },
      { label: "Graph nearest case", value: "145834", note: "Silent MI trajectory" },
    ],
    watchlist: [
      "Reserved expression means micro-distress is easy to miss by eye",
      "Mild under-eye fatigue can look normal even when perfusion begins to drift",
      "Vascular history raises vigilance without forcing an alert",
      "Medication load currently does not explain away a live anomaly",
    ],
    timeline: [
      {
        time: "Day 01",
        title: "Admitted after stroke stabilization",
        detail: "Moved into monitored neuro recovery with residual paralysis documented as baseline deficit.",
      },
      {
        time: "Day 03",
        title: "Step-down baseline established",
        detail: "Nursing and therapy notes converged on a calm, low-expression, underreporting baseline persona.",
      },
      {
        time: "Day 08",
        title: "Vascular-risk review documented",
        detail: "Chart review reinforced that quiet presentation should not be used as reassurance in isolation.",
      },
      {
        time: "Today",
        title: "Surveillance context handed to war room",
        detail: "Detached webcam relay is opened with the expectation that subtle deterioration could be biologically real before it becomes behaviorally obvious.",
      },
    ],
    warRoom: patient1WarRoom,
  },
  {
    id: "patient-2",
    code: "PT-002",
    name: "Rowan Hale",
    apparentAge: "63",
    persona: "Visible Strain",
    condition: "Paralysis watch // acute cardiopulmonary distress",
    location: "Neuro ICU // Bed 02",
    stayContextLabel: "Hospital day 6 // wife visiting daily",
    riskLevel: "Critical live escalation",
    monitoringMode: "Escalated room-camera surveillance",
    summary:
      "Admitted with a paralysis baseline and ongoing ICU-level monitoring needs. Former shop teacher, supported by spouse at bedside, usually tries to stay composed but becomes visibly strained when respiratory reserve drops.",
    admissionSummary:
      "Current admission has been shaped by neurologic weakness, limited respiratory reserve, and repeated concern that decompensation may appear first as breathing effort and physiologic instability rather than an immediate bedside-alarm event.",
    baselineRead:
      "Portrait read: apparent early 60s, tightened brow, open-mouth recovery breathing, and fatigue written across the lower face.",
    faceReadSummary:
      "This face externalizes strain. Unlike Morgan, the lower face, brow, and breathing posture all visibly broadcast trouble, which makes it an ideal alerting case.",
    personaNote:
      "Still trying to stay composed, but visibly losing respiratory reserve. Across the first 6 ICU days, staff notes describe Rowan as someone who tries to tough it out, then tips visibly once breathing work becomes too hard to hide.",
    baselinePersonaSource:
      "Based on 6 days of ICU nursing, physician, and respiratory-therapy documentation during the current admission.",
    contextCards: [
      { label: "Hospital day", value: "6", note: "Neuro ICU stay" },
      { label: "Admitting problem", value: "Paralysis watch", note: "High-risk respiratory reserve" },
      { label: "Home context", value: "Spouse at bedside", note: "Family engaged in updates" },
      { label: "Communication", value: "Stoic / pushes through", note: "Symptoms often minimized early" },
    ],
    medicalHistorySummary:
      "Higher-risk paralysis watch with prior cardiopulmonary instability, limited respiratory reserve, and enough recent ICU context that waiting is riskier than overreacting.",
    medicalHistory: [
      "Paralysis baseline with repeated high-acuity monitoring needs and prior ICU-level cardiopulmonary concern in the chart context.",
      "Reduced respiratory reserve means visible work of breathing matters earlier, even before classic bedside alarm thresholds trigger.",
      "Current presentation is more severe than this patient's documented strained baseline and should not be dismissed as anxiety alone.",
    ],
    physicianNote: {
      summary:
        "ICU and physician notes frame Rowan as a patient with limited respiratory margin, where trend and pattern matter more than waiting for one classic bedside threshold to fire.",
      bullets: [
        "Prior cardiopulmonary instability during this admission increases the cost of hesitation when breathing effort rises.",
        "Sub-threshold heart-rate changes are still clinically meaningful when paired with perfusion withdrawal and visible work of breathing.",
        "Current floor guidance already recommends low threshold for bedside escalation if strain persists across channels.",
      ],
    },
    nursingNote: {
      summary:
        "Bedside nursing describes Rowan as stoic but visually expressive under fatigue, especially during turning, suctioning, or prolonged recovery breathing.",
      bullets: [
        "Open-mouth recovery breathing and neck effort usually appear before Rowan verbally asks for help.",
        "Brow tension and facial fatigue are well-documented departure points from this patient's calmer baseline windows.",
        "Nurses note a pattern of minimizing symptoms until distress becomes externally obvious.",
      ],
    },
    directoryNote:
      "Critical video loaded. Visible facial strain, respiratory effort, and audio distress cues are strong enough to push the swarm into hospital-alert mode.",
    chiefInstruction: "Escalate now. Notify bedside nurse, charge nurse, and rapid response pathway.",
    demoNote:
      "This profile is a demo dossier assembled from the provided portrait plus the distressed patient video. The room should escalate.",
    portrait: patient2Portrait,
    portraitAlt: "Portrait used for patient two dossier",
    storyCards: [
      { label: "Apparent age", value: "63", note: "Estimated from portrait" },
      { label: "Baseline affect", value: "High-expression / strained", note: "Visible distress face" },
      { label: "Current mode", value: "Hospital alert", note: "Escalation in progress" },
      { label: "Escalations today", value: "1", note: "Critical scenario" },
    ],
    vitals: [
      { label: "Current heart rate", value: "92-99 BPM", note: "rPPG-derived unstable oscillation" },
      { label: "Perfusion spread", value: "94.2%", note: "Facial color withdrawal present" },
      { label: "HRV rigidity", value: "0.67", note: "Above predictive risk band" },
      { label: "Graph nearest case", value: "192833", note: "Arrest trajectory" },
    ],
    watchlist: [
      "Visible mouth opening and neck effort suggest increased work of breathing",
      "Facial tension plus perfusion withdrawal create a stronger distress cluster than patient one's subtle baseline",
      "Heart rate volatility remains below a classic ICU alarm threshold while still behaving abnormally",
      "Audible respiratory strain supports the visual read instead of contradicting it",
      "Immediate clinical priority is escalation, bedside confirmation, and oxygenation check",
    ],
    timeline: [
      {
        time: "Day 01",
        title: "Admitted to Neuro ICU",
        detail: "Entered high-acuity monitoring with paralysis baseline and early concern for limited respiratory reserve.",
      },
      {
        time: "Day 03",
        title: "Respiratory strain baseline documented",
        detail: "Nursing and respiratory therapy notes established that Rowan tries to push through symptoms before asking for help.",
      },
      {
        time: "Day 05",
        title: "Low-threshold escalation guidance added",
        detail: "Physician notes emphasized that visible work of breathing should trigger action even if bedside alarms are not yet dramatic.",
      },
      {
        time: "Today",
        title: "Current distress pattern loaded",
        detail: "Live surveillance is handed to the war room because the patient's present pattern exceeds the documented in-hospital baseline.",
      },
    ],
    warRoom: patient2WarRoom,
  },
];

export const setupChain = ["Patient Directory", "Patient Dossier", "Detached Webcam", "War Room"];

export function getPatient(patientId: string) {
  return patients.find((patient) => patient.id === patientId);
}
