#!/usr/bin/env python3
import argparse
import math
import random
import sys
import time
from datetime import datetime


PATIENTS = {
    "patient-1": {
        "bed": "04",
        "dob": "19700314",
        "encounter": "ENC145834",
        "first_name": "Morgan",
        "last_name": "Ellison",
        "location": "NEURO_STEPDOWN",
        "monitor": "PHILIPS_INTELLIVUE",
        "mrn": "70422115",
        "sex": "M",
        "unit": "NSD",
        "visit": "VASCULAR_WATCH",
    },
    "patient-2": {
        "bed": "02",
        "dob": "19621127",
        "encounter": "ENC192833",
        "first_name": "Rowan",
        "last_name": "Hale",
        "location": "NEURO_ICU",
        "monitor": "GE_DASH",
        "mrn": "81244702",
        "sex": "M",
        "unit": "NICU",
        "visit": "CARDIORESP_ALERT",
    },
}


def bounded(value, low, high):
    return max(low, min(high, value))


def sample_vitals(patient_key, tick):
    if patient_key == "patient-1":
        heart_rate = round(74 + math.sin(tick / 2.8) * 2 + random.uniform(-0.6, 0.6))
        respiratory_rate = round(15 + math.sin(tick / 3.6) * 1 + random.uniform(-0.4, 0.4))
        spo2 = round(98 + math.sin(tick / 4.2) * 0.5 + random.uniform(-0.2, 0.2))
        systolic = round(126 + math.sin(tick / 4.5) * 4 + random.uniform(-1.5, 1.5))
        diastolic = round(78 + math.sin(tick / 4.8) * 3 + random.uniform(-1.0, 1.0))
        pvc = 0
        perfusion = round(98.3 + math.sin(tick / 3.1) * 0.3 + random.uniform(-0.1, 0.1), 1)
        hrv = round(0.18 + math.sin(tick / 4.1) * 0.01 + random.uniform(-0.005, 0.005), 2)
    else:
        heart_rate = round(95 + math.sin(tick / 1.2) * 4 + random.uniform(-1.2, 1.2))
        respiratory_rate = round(27 + math.sin(tick / 1.7) * 3 + random.uniform(-0.8, 0.8))
        spo2 = round(94 + math.sin(tick / 2.0) * 1 + random.uniform(-0.4, 0.4))
        systolic = round(148 + math.sin(tick / 1.8) * 7 + random.uniform(-2.5, 2.5))
        diastolic = round(89 + math.sin(tick / 1.9) * 4 + random.uniform(-1.8, 1.8))
        pvc = random.choice([0, 1, 2, 3])
        perfusion = round(94.2 + math.sin(tick / 1.5) * 0.7 + random.uniform(-0.2, 0.2), 1)
        hrv = round(0.67 + math.sin(tick / 1.4) * 0.04 + random.uniform(-0.01, 0.01), 2)

    return {
        "bp": f"{bounded(systolic, 90, 190)}^{bounded(diastolic, 50, 110)}",
        "hr": bounded(heart_rate, 50, 130),
        "hrv": hrv,
        "perfusion": perfusion,
        "pvc": pvc,
        "rr": bounded(respiratory_rate, 10, 34),
        "spo2": bounded(spo2, 86, 100),
    }


def hl7_timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S")


def build_message(patient_key, sequence, tick):
    patient = PATIENTS[patient_key]
    vitals = sample_vitals(patient_key, tick)
    timestamp = hl7_timestamp()
    message_id = f"MSG{sequence:06d}"
    order_id = f"ORD{sequence:06d}"

    hr_flag = "H" if vitals["hr"] >= 100 else "N"
    rr_flag = "H" if vitals["rr"] >= 24 else "N"
    spo2_flag = "L" if vitals["spo2"] <= 94 else "N"
    pvc_flag = "H" if vitals["pvc"] >= 2 else "N"

    return [
        f"MSH|^~\\&|{patient['monitor']}|{patient['location']}_{patient['bed']}|N0_GATEWAY|CARDIAC_SWARM|{timestamp}||ORU^R01|{message_id}|P|2.3.1",
        f"PID|||{patient['mrn']}^^^HOSP^MR||{patient['last_name']}^{patient['first_name']}||{patient['dob']}|{patient['sex']}",
        f"PV1||I|{patient['unit']}^{patient['bed']}^1||||ATTENDING^SIM|||||||||||{patient['encounter']}",
        f"OBR|1||{order_id}|VSNAP^Legacy Monitor Snapshot^99MON",
        f"OBX|1|NM|8867-4^Heart rate^LN||{vitals['hr']}|/min|60-100|{hr_flag}|||F",
        f"OBX|2|NM|9279-1^Respiratory rate^LN||{vitals['rr']}|/min|12-20|{rr_flag}|||F",
        f"OBX|3|NM|59408-5^SpO2^LN||{vitals['spo2']}|%|95-100|{spo2_flag}|||F",
        f"OBX|4|ST|8480-6^Non-invasive BP^LN||{vitals['bp']}|mmHg|||F",
        f"OBX|5|NM|80404-7^PVC count^LN||{vitals['pvc']}|count/min|0-1|{pvc_flag}|||F",
        f"OBX|6|NM|99N0^Perfusion Index^99N0||{vitals['perfusion']}|%|||F",
        f"OBX|7|NM|99N0^HRV Rigidity^99N0||{vitals['hrv']}|idx|||F",
        f"NTE|1||VISIT={patient['visit']} SOURCE=LEGACY_TCP MONITOR={patient['monitor']}",
    ]


def format_message(segments, mode):
    if mode == "segments":
        return "\n".join(segments)

    return "<VT>" + "\\r".join(segments) + "<FS><CR>"


def main():
    parser = argparse.ArgumentParser(
        description="Stream realistic HL7 ORU monitor traffic for a demo terminal."
    )
    parser.add_argument(
        "--patient",
        default="patient-2",
        choices=sorted(PATIENTS.keys()),
        help="Which demo patient stream to emit.",
    )
    parser.add_argument(
        "--mode",
        default="raw",
        choices=["raw", "segments"],
        help="raw = one-line MLLP-style receive view, segments = multi-line HL7 segments.",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.08,
        help="Seconds between messages. Lower feels more like a hot TCP stream.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=0,
        help="Optional message count. 0 means stream forever.",
    )
    args = parser.parse_args()

    print(
        f"[hl7-relay] listening on 0.0.0.0:2575 | source={PATIENTS[args.patient]['monitor']} | mode={args.mode}",
        flush=True,
    )

    sequence = 1
    tick = 0

    try:
        while True:
            segments = build_message(args.patient, sequence, tick)
            payload = format_message(segments, args.mode)
            timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]

            if args.mode == "segments":
                sys.stdout.write(f"\n[{timestamp}] RX message {sequence:06d}\n{payload}\n")
            else:
                sys.stdout.write(f"[{timestamp}] RX {payload}\n")

            sys.stdout.flush()
            sequence += 1
            tick += 1

            if args.count and sequence > args.count:
                break

            time.sleep(args.interval)
    except KeyboardInterrupt:
        sys.stdout.write("\n[hl7-relay] stream closed by operator\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
