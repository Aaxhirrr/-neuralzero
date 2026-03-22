import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { z } from "zod";

const execFileAsync = promisify(execFile);

const knowledgeGraphContextSchema = z.object({
  agent_headline: z.string().min(1),
  closest_case: z.string().min(1),
  drug_nodes: z.array(z.string()),
  outcome_nodes: z.array(z.string()).min(1),
  patient_label: z.string().min(1),
  payload: z.string().min(1),
  shared_clinical_vectors: z.number().int().min(1),
});

export type KnowledgeGraphContext = z.infer<typeof knowledgeGraphContextSchema>;

const fallbackContexts: Record<string, KnowledgeGraphContext> = {
  "patient-1": {
    agent_headline: "Historical topology match locked",
    closest_case: "MIMIC_HADM_145834",
    drug_nodes: ["Drug: Heparin", "Drug: Nitroglycerin"],
    outcome_nodes: ["Outcome: SILENT INFARCTION"],
    patient_label: "PT-001 (Morgan)",
    payload: `[ARCHIVE_AGENT]: Topological graph cross-reference complete.
Live Patient: PT-001 (Morgan)
Closest Historical Match: MIMIC_HADM_145834 (3 shared clinical vectors)
Historical Medication Load: ['Drug: Heparin', 'Drug: Nitroglycerin']
Historical Trajectory: ['Outcome: SILENT INFARCTION']

[SYSTEM INSTRUCTION FOR CHIEF AGENT]:
The patient's current medication load does NOT account for the HRV Rigidity. The topological graph trajectory indicates a high probability of Outcome: SILENT INFARCTION. Trigger override.`,
    shared_clinical_vectors: 3,
  },
  "patient-2": {
    agent_headline: "Historical arrest trajectory found",
    closest_case: "MIMIC_HADM_192833",
    drug_nodes: [],
    outcome_nodes: ["Outcome: ACUTE CARDIOPULMONARY ARREST"],
    patient_label: "PT-002 (Rowan)",
    payload: `[ARCHIVE_AGENT]: Topological graph cross-reference complete.
Live Patient: PT-002 (Rowan)
Closest Historical Match: MIMIC_HADM_192833 (4 shared clinical vectors)
Historical Trajectory: ['Outcome: ACUTE CARDIOPULMONARY ARREST']

[SYSTEM INSTRUCTION FOR CHIEF AGENT]:
The patient's presentation (Labored Breathing + Perfusion Drop to 94.2% + HRV 0.67) maps directly to historical cases of Outcome: ACUTE CARDIOPULMONARY ARREST. RedTeam objections regarding lighting/artifacts have been overruled by audio corroboration. Do not wait for HR to break 100 BPM. ESCALATE IMMEDIATELY.`,
    shared_clinical_vectors: 4,
  },
};

export async function getKnowledgeGraphContext(patientId: string) {
  const scriptPath = path.join(process.cwd(), "scripts", "hardcoded_knowledge_graph.py");

  try {
    const { stdout } = await execFileAsync("python", [scriptPath, patientId], {
      timeout: 10000,
      windowsHide: true,
    });

    return knowledgeGraphContextSchema.parse(JSON.parse(stdout));
  } catch {
    const fallbackContext = fallbackContexts[patientId];

    if (!fallbackContext) {
      throw new Error(`No hardcoded knowledge-graph context found for ${patientId}.`);
    }

    return fallbackContext;
  }
}
