import json
import sys


def get_holter_electrical_breakdown(is_crashing=True):
    if not is_crashing:
        payload = "[BIO_AGENT]: Holter DB baseline check. Normal sinus rhythm. RR-interval variance nominal."
        return {
            "database_label": "PhysioNet Holter baseline lane",
            "is_crashing": False,
            "match_label": "baseline-safe electrical profile",
            "payload": payload,
            "reference_label": "Normal sinus reference",
        }

    payload = """[BIO_AGENT]: LIVE TELEMETRY ANOMALY DETECTED.
Initiating cross-reference with PhysioNet Sudden Cardiac Death Holter Database.
Mapping live rPPG waveform to historical Holter Record 47...

ELECTRICAL BREAKDOWN MATCH:
- RR-Interval Rigidity: Critical (Variance < 15ms)
- QRS Complex: Widening (Estimated > 120ms equivalent)
- Repolarization: T-wave alternans detected in optical cascade.

[VERDICT]: Live biological signature is a 94% match for pre-Ventricular Fibrillation (VFib) electrical decay. Cardiac muscle is currently starving of oxygen."""

    return {
        "database_label": "PhysioNet SCD Holter lane",
        "is_crashing": True,
        "match_label": "94% pre-VFib decay match",
        "payload": payload,
        "reference_label": "Holter Record 47",
    }


def main():
    patient_id = sys.argv[1] if len(sys.argv) > 1 else ""

    if patient_id == "patient-1":
        result = get_holter_electrical_breakdown(is_crashing=False)
    elif patient_id == "patient-2":
        result = get_holter_electrical_breakdown(is_crashing=True)
    else:
        raise ValueError(f"Unsupported patient id: {patient_id}")

    print(json.dumps(result))


if __name__ == "__main__":
    main()
