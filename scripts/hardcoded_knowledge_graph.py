import json
import sys

import networkx as nx


def get_hardcoded_knowledge_graph_context():
    graph = nx.Graph()
    graph.add_edges_from(
        [
            ("MIMIC_HADM_145834", "Post-stroke Paralysis"),
            ("MIMIC_HADM_145834", "Vascular History"),
            ("MIMIC_HADM_145834", "HRV Rigidity"),
            ("MIMIC_HADM_145834", "Drug: Heparin"),
            ("MIMIC_HADM_145834", "Drug: Nitroglycerin"),
            ("MIMIC_HADM_145834", "Outcome: SILENT INFARCTION"),
        ]
    )
    graph.add_edges_from(
        [
            ("MIMIC_HADM_112213", "Post-stroke Paralysis"),
            ("MIMIC_HADM_112213", "Low Expression Baseline"),
            ("MIMIC_HADM_112213", "Drug: Aspirin"),
            ("MIMIC_HADM_112213", "Drug: Metoprolol"),
            ("MIMIC_HADM_112213", "Outcome: Stable"),
        ]
    )

    demo_patient = "PT-001 (Morgan)"
    current_traits = ["Post-stroke Paralysis", "Vascular History", "HRV Rigidity"]

    graph.add_node(demo_patient)
    for trait in current_traits:
        graph.add_edge(demo_patient, trait)

    similarities = {}
    historical_cases = ["MIMIC_HADM_145834", "MIMIC_HADM_112213"]

    for case in historical_cases:
        shared_traits = list(nx.common_neighbors(graph, demo_patient, case))
        similarities[case] = len(shared_traits)

    closest_case = max(similarities, key=similarities.get)
    outcome_nodes = [node for node in graph.neighbors(closest_case) if "Outcome" in node]
    drug_nodes = [node for node in graph.neighbors(closest_case) if "Drug" in node]

    payload = f"""[ARCHIVE_AGENT]: Topological graph cross-reference complete.
Live Patient: {demo_patient}
Closest Historical Match: {closest_case} ({similarities[closest_case]} shared clinical vectors)
Historical Medication Load: {drug_nodes}
Historical Trajectory: {outcome_nodes}

[SYSTEM INSTRUCTION FOR CHIEF AGENT]:
The patient's current medication load does NOT account for the HRV Rigidity. The topological graph trajectory indicates a high probability of {outcome_nodes[0]}. Trigger override."""

    return {
        "agent_headline": "Historical topology match locked",
        "closest_case": closest_case,
        "drug_nodes": drug_nodes,
        "outcome_nodes": outcome_nodes,
        "patient_label": demo_patient,
        "payload": payload,
        "shared_clinical_vectors": similarities[closest_case],
    }


def get_hardcoded_knowledge_graph_pt002():
    graph = nx.Graph()
    graph.add_edges_from(
        [
            ("MIMIC_HADM_192833", "Paralysis Baseline"),
            ("MIMIC_HADM_192833", "Labored Breathing"),
            ("MIMIC_HADM_192833", "Perfusion Withdrawal"),
            ("MIMIC_HADM_192833", "HRV Rigidity (>0.60)"),
            ("MIMIC_HADM_192833", "Drug: Furosemide"),
            ("MIMIC_HADM_192833", "Outcome: ACUTE CARDIOPULMONARY ARREST"),
        ]
    )
    graph.add_edges_from(
        [
            ("MIMIC_HADM_109244", "Paralysis Baseline"),
            ("MIMIC_HADM_109244", "Visible Strain"),
            ("MIMIC_HADM_109244", "Drug: Lorazepam"),
            ("MIMIC_HADM_109244", "Outcome: Stable (Agitation)"),
        ]
    )

    demo_patient = "PT-002 (Rowan)"
    current_traits = [
        "Paralysis Baseline",
        "Labored Breathing",
        "Perfusion Withdrawal",
        "HRV Rigidity (>0.60)",
    ]

    graph.add_node(demo_patient)
    for trait in current_traits:
        graph.add_edge(demo_patient, trait)

    similarities = {}
    historical_cases = ["MIMIC_HADM_192833", "MIMIC_HADM_109244"]

    for case in historical_cases:
        shared_traits = list(nx.common_neighbors(graph, demo_patient, case))
        similarities[case] = len(shared_traits)

    closest_case = max(similarities, key=similarities.get)
    outcome_nodes = [node for node in graph.neighbors(closest_case) if "Outcome" in node]

    payload = f"""[ARCHIVE_AGENT]: Topological graph cross-reference complete.
Live Patient: {demo_patient}
Closest Historical Match: {closest_case} ({similarities[closest_case]} shared clinical vectors)
Historical Trajectory: {outcome_nodes}

[SYSTEM INSTRUCTION FOR CHIEF AGENT]:
The patient's presentation (Labored Breathing + Perfusion Drop to 94.2% + HRV 0.67) maps directly to historical cases of {outcome_nodes[0]}. RedTeam objections regarding lighting/artifacts have been overruled by audio corroboration. Do not wait for HR to break 100 BPM. ESCALATE IMMEDIATELY."""

    return {
        "agent_headline": "Historical arrest trajectory found",
        "closest_case": closest_case,
        "drug_nodes": [],
        "outcome_nodes": outcome_nodes,
        "patient_label": demo_patient,
        "payload": payload,
        "shared_clinical_vectors": similarities[closest_case],
    }


def main():
    patient_id = sys.argv[1] if len(sys.argv) > 1 else ""

    if patient_id == "patient-1":
        result = get_hardcoded_knowledge_graph_context()
    elif patient_id == "patient-2":
        result = get_hardcoded_knowledge_graph_pt002()
    else:
        raise ValueError(f"Unsupported patient id: {patient_id}")

    print(json.dumps(result))


if __name__ == "__main__":
    main()
