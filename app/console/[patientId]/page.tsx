import { notFound } from "next/navigation";

import { getPatient, patients } from "@/components/console/console-data";
import { PatientDossier } from "@/components/console/patient-dossier";

export function generateStaticParams() {
  return patients.map((patient) => ({ patientId: patient.id }));
}

export default async function PatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const patient = getPatient(patientId);

  if (!patient) {
    notFound();
  }

  return <PatientDossier patient={patient} />;
}
