#!/usr/bin/env python3
import argparse
import math
import random
import sys
import time
from datetime import datetime


PATIENTS = {
    "patient-1": {
        "audio_floor": 0.12,
        "blink_base": 0.79,
        "brow_base": 0.14,
        "face_lock": 0.98,
        "mouth_base": 0.11,
        "name": "Morgan Ellison",
        "patient_code": "PT-001",
        "perfusion_base": -0.6,
        "respiratory_base": 0.19,
        "scenario": "quiet baseline watch",
        "unit": "Neuro Stepdown / Bed 04",
        "vocal_base": 0.07,
    },
    "patient-2": {
        "audio_floor": 0.69,
        "blink_base": 0.32,
        "brow_base": 0.81,
        "face_lock": 0.97,
        "mouth_base": 0.78,
        "name": "Rowan Hale",
        "patient_code": "PT-002",
        "perfusion_base": -6.1,
        "respiratory_base": 0.84,
        "scenario": "respiratory distress escalation",
        "unit": "Neuro ICU / Bed 02",
        "vocal_base": 0.63,
    },
}


def clamp(value, low, high):
    return max(low, min(high, value))


def timestamp():
    return datetime.now().strftime("%H:%M:%S.%f")[:-3]


def sample_observation(patient_key, frame_index):
    profile = PATIENTS[patient_key]
    distress = patient_key == "patient-2"

    face_lock = clamp(profile["face_lock"] + math.sin(frame_index / 3.6) * 0.01 + random.uniform(-0.004, 0.004), 0.91, 0.99)
    brow_tension = clamp(profile["brow_base"] + math.sin(frame_index / 2.1) * 0.05 + random.uniform(-0.02, 0.02), 0.03, 0.96)
    mouth_opening = clamp(profile["mouth_base"] + math.sin(frame_index / 1.8) * 0.06 + random.uniform(-0.02, 0.02), 0.02, 0.95)
    blink_recovery = clamp(profile["blink_base"] + math.sin(frame_index / 2.5) * 0.05 + random.uniform(-0.02, 0.02), 0.12, 0.96)
    perfusion_withdrawal = round(profile["perfusion_base"] + math.sin(frame_index / 2.2) * 0.6 + random.uniform(-0.15, 0.15), 1)
    respiratory_effort = clamp(profile["respiratory_base"] + math.sin(frame_index / 1.7) * 0.06 + random.uniform(-0.02, 0.02), 0.06, 0.97)
    audio_breath = clamp(profile["audio_floor"] + math.sin(frame_index / 1.6) * 0.07 + random.uniform(-0.03, 0.03), 0.04, 0.98)
    gasp_cadence = clamp((audio_breath - 0.08) if distress else (audio_breath - 0.04), 0.01, 0.95)
    vocal_strain = clamp(profile["vocal_base"] + math.sin(frame_index / 1.9) * 0.05 + random.uniform(-0.02, 0.02), 0.02, 0.95)
    thoracic_motion = clamp(0.34 + respiratory_effort * 0.58 + random.uniform(-0.03, 0.03), 0.16, 0.96)

    if distress:
        verdict = "distress cluster persisting"
        audio_state = "audio corroboration active"
    else:
        verdict = "baseline-compatible relay"
        audio_state = "ambient audio quiet"

    return {
        "audio_breath": audio_breath,
        "audio_state": audio_state,
        "blink_recovery": blink_recovery,
        "brow_tension": brow_tension,
        "face_lock": face_lock,
        "gasp_cadence": gasp_cadence,
        "mouth_opening": mouth_opening,
        "perfusion_withdrawal": perfusion_withdrawal,
        "respiratory_effort": respiratory_effort,
        "thoracic_motion": thoracic_motion,
        "verdict": verdict,
        "vocal_strain": vocal_strain,
    }


def compact_line(patient_key, frame_index):
    profile = PATIENTS[patient_key]
    observation = sample_observation(patient_key, frame_index)

    return (
        f"[{timestamp()}] FRAME {frame_index:06d} | patient={profile['patient_code']} {profile['name']} | "
        f"face_lock={observation['face_lock']:.2f} | "
        f"brow_tension={observation['brow_tension']:.2f} | "
        f"mouth_opening={observation['mouth_opening']:.2f} | "
        f"blink_recovery={observation['blink_recovery']:.2f} | "
        f"perfusion_withdrawal={observation['perfusion_withdrawal']:+.1f}% | "
        f"thoracic_motion={observation['thoracic_motion']:.2f} | "
        f"audio_breath={observation['audio_breath']:.2f} | "
        f"gasp_cadence={observation['gasp_cadence']:.2f} | "
        f"vocal_strain={observation['vocal_strain']:.2f} | "
        f"verdict={observation['verdict']}"
    )


def block_output(patient_key, frame_index):
    profile = PATIENTS[patient_key]
    observation = sample_observation(patient_key, frame_index)

    return "\n".join(
        [
            f"[{timestamp()}] VISION RELAY | frame={frame_index:06d} | {profile['patient_code']} {profile['name']}",
            f"  unit: {profile['unit']}",
            f"  scenario: {profile['scenario']}",
            f"  face_lock_confidence: {observation['face_lock']:.2f}",
            f"  expressions: brow_tension={observation['brow_tension']:.2f} mouth_opening={observation['mouth_opening']:.2f} blink_recovery={observation['blink_recovery']:.2f}",
            f"  perfusion: facial_withdrawal={observation['perfusion_withdrawal']:+.1f}% thoracic_motion={observation['thoracic_motion']:.2f}",
            f"  audio_lane: breath={observation['audio_breath']:.2f} gasp_cadence={observation['gasp_cadence']:.2f} vocal_strain={observation['vocal_strain']:.2f}",
            f"  audio_state: {observation['audio_state']}",
            f"  verdict: {observation['verdict']}",
        ]
    )


def main():
    parser = argparse.ArgumentParser(
        description="Stream detached-camera perception telemetry for the Vision agent demo."
    )
    parser.add_argument(
        "--patient",
        default="patient-2",
        choices=sorted(PATIENTS.keys()),
        help="Which patient relay to emit.",
    )
    parser.add_argument(
        "--mode",
        default="compact",
        choices=["compact", "blocks"],
        help="compact = dense one-line telemetry, blocks = readable multi-line relay output.",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.18,
        help="Seconds between frames.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=0,
        help="Optional frame count. 0 means stream forever.",
    )
    args = parser.parse_args()

    profile = PATIENTS[args.patient]
    print(
        f"[vision-relay] source=detached_webcam monitor_relay=active patient={profile['patient_code']} scenario={profile['scenario']} mode={args.mode}",
        flush=True,
    )

    frame_index = 1

    try:
        while True:
            payload = compact_line(args.patient, frame_index) if args.mode == "compact" else block_output(args.patient, frame_index)
            sys.stdout.write(f"{payload}\n")
            sys.stdout.flush()

            frame_index += 1
            if args.count and frame_index > args.count:
                break

            time.sleep(args.interval)
    except KeyboardInterrupt:
        sys.stdout.write("\n[vision-relay] stream closed by operator\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
