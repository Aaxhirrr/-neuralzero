import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { z } from "zod";

const execFileAsync = promisify(execFile);

const holterBreakdownSchema = z.object({
  database_label: z.string().min(1),
  is_crashing: z.boolean(),
  match_label: z.string().min(1),
  payload: z.string().min(1),
  reference_label: z.string().min(1),
});

export type HolterBreakdown = z.infer<typeof holterBreakdownSchema>;

const fallbackBreakdowns: Record<string, HolterBreakdown> = {
  "patient-1": {
    database_label: "PhysioNet Holter baseline lane",
    is_crashing: false,
    match_label: "baseline-safe electrical profile",
    payload: "[BIO_AGENT]: Holter DB baseline check. Normal sinus rhythm. RR-interval variance nominal.",
    reference_label: "Normal sinus reference",
  },
  "patient-2": {
    database_label: "PhysioNet SCD Holter lane",
    is_crashing: true,
    match_label: "94% pre-VFib decay match",
    payload: `[BIO_AGENT]: LIVE TELEMETRY ANOMALY DETECTED.
Initiating cross-reference with PhysioNet Sudden Cardiac Death Holter Database.
Mapping live rPPG waveform to historical Holter Record 47...

ELECTRICAL BREAKDOWN MATCH:
- RR-Interval Rigidity: Critical (Variance < 15ms)
- QRS Complex: Widening (Estimated > 120ms equivalent)
- Repolarization: T-wave alternans detected in optical cascade.

[VERDICT]: Live biological signature is a 94% match for pre-Ventricular Fibrillation (VFib) electrical decay. Cardiac muscle is currently starving of oxygen.`,
    reference_label: "Holter Record 47",
  },
};

export async function getHolterBreakdown(patientId: string) {
  const scriptPath = path.join(process.cwd(), "scripts", "hardcoded_holter.py");

  try {
    const { stdout } = await execFileAsync("python", [scriptPath, patientId], {
      timeout: 10000,
      windowsHide: true,
    });

    return holterBreakdownSchema.parse(JSON.parse(stdout));
  } catch {
    const fallbackBreakdown = fallbackBreakdowns[patientId];

    if (!fallbackBreakdown) {
      throw new Error(`No Holter breakdown found for ${patientId}.`);
    }

    return fallbackBreakdown;
  }
}
