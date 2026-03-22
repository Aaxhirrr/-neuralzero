import { patients } from "@/components/console/console-data";
import { PatientDirectory } from "@/components/console/patient-directory";

export default function ConsolePage() {
  return <PatientDirectory patients={patients} />;
}
