import { readFile } from "fs/promises";
import { join } from "path";

const patientVideos: Record<string, string> = {
  "patient-1": "Patient1_NORMAL.mp4",
  "patient-2": "Patient2.mp4",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient") ?? "patient-1";
  const patientVideoFile = patientVideos[patientId];

  if (!patientVideoFile) {
    return new Response("Patient video not found.", { status: 404 });
  }

  const patientVideoPath = join(process.cwd(), "src", "vids", patientVideoFile);
  const file = await readFile(patientVideoPath);

  return new Response(file, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Length": String(file.byteLength),
      "Content-Type": "video/mp4",
    },
  });
}
