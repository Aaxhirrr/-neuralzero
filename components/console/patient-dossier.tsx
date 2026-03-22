import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileStack, HeartPulse, ShieldAlert } from "lucide-react";

import type { PatientRecord } from "@/components/console/console-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function GridBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(8)].map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute h-px bg-foreground/10"
          style={{
            top: `${12.5 * (i + 1)}%`,
            left: 0,
            right: 0,
          }}
        />
      ))}
      {[...Array(12)].map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute w-px bg-foreground/10"
          style={{
            left: `${8.33 * (i + 1)}%`,
            top: 0,
            bottom: 0,
          }}
        />
      ))}
    </div>
  );
}

export function PatientDossier({ patient }: { patient: PatientRecord }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GridBackdrop />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-8 lg:px-12 lg:py-10">
        <header className="flex flex-col gap-6 rounded-[28px] border border-foreground/10 bg-background/85 px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-foreground/15 bg-background/70 px-5"
            >
              <Link href="/console">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Directory
              </Link>
            </Button>

            <div>
              <div className="font-mono text-lg text-foreground">~n0 / Patient Dossier</div>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                A context page before the swarm. Read the baseline, understand the patient, then enter the war room.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
              {patient.code}
            </Badge>
            <Badge className="rounded-full border-red-500/15 bg-red-500/8 px-3 py-1 text-[11px] text-red-600">
              {patient.condition}
            </Badge>
            <Badge
              className={
                patient.warRoom.alertTone === "critical"
                  ? "rounded-full border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] text-red-700"
                  : "rounded-full border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-[11px] text-emerald-700"
              }
            >
              {patient.warRoom.alertLabel}
            </Badge>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-4">
          <article className="relative overflow-hidden rounded-[36px] border border-foreground/10 bg-foreground p-8 text-background shadow-[0_28px_90px_rgba(0,0,0,0.12)] lg:col-span-2 lg:min-h-[520px]">
            <div className="absolute inset-0">
              <Image
                src={patient.portrait}
                alt={patient.portraitAlt}
                fill
                className="object-cover opacity-30"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.6)_45%,rgba(0,0,0,0.25)_100%)]" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-3 text-sm font-mono text-background/70">
                  <FileStack className="h-4 w-4 text-red-400" />
                  Wrapped-style patient summary
                </div>

                <div className="mt-10 text-sm uppercase tracking-[0.28em] text-background/55">{patient.code}</div>
                <h1 className="mt-4 max-w-xl text-[clamp(3.5rem,8vw,6rem)] font-display leading-[0.92] tracking-tight">
                  {patient.name}
                </h1>
                <div className="mt-6 font-mono text-sm text-background/65">
                  {patient.stayContextLabel} / {patient.persona}
                </div>
              </div>

              <div className="mt-10 max-w-xl rounded-[28px] border border-white/12 bg-white/8 p-5 backdrop-blur-xl">
                <p className="text-base leading-relaxed text-background/90">{patient.summary}</p>
                <p className="mt-4 text-sm leading-relaxed text-background/65">{patient.admissionSummary}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] border border-foreground/10 bg-background/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileStack className="h-4 w-4 text-red-500" />
              Patient context
            </div>
            <div className="mt-6 space-y-4">
              {patient.contextCards.map((metric) => (
                <div key={metric.label} className="rounded-[22px] border border-foreground/10 bg-foreground/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{metric.label}</div>
                  <div className="mt-3 text-2xl font-semibold">{metric.value}</div>
                  {metric.note ? <div className="mt-2 text-sm text-muted-foreground">{metric.note}</div> : null}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-foreground/10 bg-background/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Baseline persona
            </div>
            <div className="mt-6 text-3xl font-semibold leading-tight">{patient.persona}</div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {patient.personaNote}
            </p>
            <div className="mt-6 rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-4 text-sm leading-relaxed text-muted-foreground">
              <div>{patient.baselinePersonaSource}</div>
              <div className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">{patient.location}</div>
            </div>
          </article>

          <article className="rounded-[32px] border border-foreground/10 bg-background/90 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl lg:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Medical history</div>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">{patient.medicalHistorySummary}</p>

            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {patient.medicalHistory.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] px-4 py-4 text-sm leading-relaxed text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-foreground/10 bg-background/90 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <HeartPulse className="h-4 w-4 text-red-500" />
              Physician note
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{patient.physicianNote.summary}</p>

            <div className="mt-6 space-y-3">
              {patient.physicianNote.bullets.map((item) => (
                <div key={item} className="rounded-[22px] border border-foreground/10 bg-foreground/[0.03] p-4 text-sm leading-relaxed text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-foreground/10 bg-background/90 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileStack className="h-4 w-4 text-red-500" />
              Nursing note
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{patient.nursingNote.summary}</p>

            <div className="mt-6 space-y-3">
              {patient.nursingNote.bullets.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-[22px] border border-foreground/10 bg-foreground/[0.03] px-4 py-4 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-foreground/10 bg-background/90 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl lg:col-span-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Hospital course</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">What the team already knows before the war room</h2>
              </div>
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full bg-foreground px-8 text-base text-background hover:bg-foreground/90"
              >
                <Link href={`/console/${patient.id}/war-room`}>
                  Enter War Room
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-4">
              {patient.timeline.map((entry) => (
                <div
                  key={entry.time}
                  className="rounded-[26px] border border-foreground/10 bg-foreground/[0.03] p-5"
                >
                  <div className="font-mono text-sm text-red-500">{entry.time}</div>
                  <h3 className="mt-4 text-xl font-semibold">{entry.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{entry.detail}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
