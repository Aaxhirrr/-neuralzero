import { notFound } from "next/navigation";

import { getPatient, patients } from "@/components/console/console-data";
import { NeuralConsole } from "@/components/console/neural-console";

export function generateStaticParams() {
  return patients.map((patient) => ({ patientId: patient.id }));
}

export default async function PatientWarRoomPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const patient = getPatient(patientId);

  if (!patient) {
    notFound();
  }

  return <NeuralConsole patient={patient} />;
}
