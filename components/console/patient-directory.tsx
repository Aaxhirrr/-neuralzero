"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, FolderOpen, HeartPulse, Search, ShieldCheck } from "lucide-react";

import type { PatientRecord } from "@/components/console/console-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export function PatientDirectory({ patients }: { patients: PatientRecord[] }) {
  const [query, setQuery] = useState("");
  const criticalPatients = useMemo(
    () => patients.filter((patient) => patient.warRoom.alertTone === "critical"),
    [patients],
  );
  const searchExamples = patients.map((patient) => `${patient.name.split(" ")[0]} / ${patient.code}`).join(", ");

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery) {
      return;
    }

    const timer = window.setTimeout(() => {
      const searchField = document.getElementById("patient-directory-search");
      if (searchField instanceof HTMLInputElement) {
        searchField.focus();
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [query]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPatients = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return patients.filter((patient) =>
      [
        patient.name,
        patient.code,
        patient.persona,
        patient.condition,
        patient.location,
      ].some((field) => field.toLowerCase().includes(normalizedQuery)),
    );
  }, [normalizedQuery, patients]);

  const hasQuery = normalizedQuery.length > 0;
  const hasResults = filteredPatients.length > 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <GridBackdrop />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-8 lg:px-12 lg:py-10">
        <header className="flex flex-col gap-6 rounded-[28px] border border-foreground/10 bg-background/80 px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-foreground/15 bg-background/70 px-5"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>

            <div>
              <div className="font-mono text-lg text-foreground">~n0 / Patient Directory</div>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Start in the monitored patient list, open the dossier, then enter the war room only when you want
                the live multi-agent breakdown.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border-red-500/15 bg-red-500/8 px-3 py-1 text-[11px] text-red-600">
              {patients.length} monitored patients
            </Badge>
            <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
              {criticalPatients.length} active alert{criticalPatients.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[36px] border border-foreground/10 bg-background/85 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <FolderOpen className="h-4 w-4 text-red-500" />
              Command Center Intake
            </div>

            <h1 className="mt-6 max-w-4xl text-[clamp(3rem,8vw,6rem)] font-display leading-[0.9] tracking-tight">
              Open the patient first.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              The war room should feel earned. Pick the patient, read the dossier, understand the baseline, then step
              into the live agent debate with context already in your head.
            </p>

            <div className="mt-10 max-w-2xl rounded-[30px] border border-foreground/10 bg-foreground/[0.03] p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Search intake</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Search the directory to reveal the patient.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Try searching {searchExamples}.
              </p>

              <div className="mt-5 relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="patient-directory-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search patient directory..."
                  className="h-14 rounded-full border-foreground/10 bg-background pl-11 pr-4 text-base shadow-none"
                />
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                {hasQuery
                  ? hasResults
                    ? `${filteredPatients.length} patient match loaded.`
                    : "No patient matched that query yet."
                  : "No patient is revealed until you search the directory."}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[28px] border border-foreground/10 bg-background/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4 text-red-500" />
                Directory scan
              </div>
              <div className="mt-5 text-3xl font-semibold">01</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {patients.length} patients are currently loaded into the demo environment and ready for review.
              </p>
            </div>

            <div className="rounded-[28px] border border-foreground/10 bg-background/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <HeartPulse className="h-4 w-4 text-red-500" />
                Alert queue
              </div>
              <div className="mt-5 text-3xl font-semibold">{criticalPatients.length}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Critical cases currently loaded and ready to route the swarm into alert mode.
              </p>
            </div>

            <div className="rounded-[28px] border border-foreground/10 bg-background/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-red-500" />
                War room gate
              </div>
              <div className="mt-5 text-3xl font-semibold">Context first</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Each patient routes into a dossier page before the live agent room.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Active patient</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                {hasQuery ? "Search results" : "Search required"}
              </h2>
            </div>
          </div>

          {!hasQuery ? (
            <div className="rounded-[36px] border border-dashed border-foreground/15 bg-background/70 px-8 py-16 text-center shadow-[0_24px_80px_rgba(0,0,0,0.04)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03]">
                <Search className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-6 text-3xl font-semibold tracking-tight">Search the patient directory first.</h3>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                The console now waits for a directory query before it reveals a patient. Search for Morgan or Rowan to
                continue into the dossier flow.
              </p>
            </div>
          ) : hasResults ? (
            <div className="space-y-5">
              {filteredPatients.map((patient) => (
              <article
                key={patient.id}
                className="overflow-hidden rounded-[36px] border border-foreground/10 bg-background/90 shadow-[0_28px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl"
              >
                <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
                  <div className="relative min-h-[320px] border-b border-foreground/10 bg-foreground/[0.03] lg:border-b-0 lg:border-r">
                    <Image
                      src={patient.portrait}
                      alt={patient.portraitAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 280px"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.12)_100%)]" />
                  </div>

                  <div className="p-7 lg:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                        {patient.code}
                      </Badge>
                      <Badge className="rounded-full border-red-500/15 bg-red-500/8 px-3 py-1 text-[11px] text-red-600">
                        {patient.riskLevel}
                      </Badge>
                      <Badge className="rounded-full border-foreground/10 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                        {patient.monitoringMode}
                      </Badge>
                    </div>

                    <div className="mt-6">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Patient dossier</div>
                      <h3 className="mt-3 text-4xl font-display leading-none">{patient.name}</h3>
                      <div className="mt-3 font-mono text-sm text-muted-foreground">
                        Apparent age {patient.apparentAge} / Persona: {patient.persona}
                      </div>
                    </div>

                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">{patient.summary}</p>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {patient.storyCards.map((card) => (
                        <div
                          key={card.label}
                          className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-4"
                        >
                          <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                            {card.label}
                          </div>
                          <div className="mt-3 text-2xl font-semibold">{card.value}</div>
                          {card.note ? (
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.note}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between border-t border-foreground/10 bg-foreground/[0.03] p-7 lg:border-t-0 lg:border-l">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Why this case</div>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{patient.directoryNote}</p>

                      <div className="mt-6 space-y-3">
                        {patient.watchlist.slice(0, 3).map((item) => (
                          <div
                            key={item}
                            className="rounded-[22px] border border-foreground/10 bg-background/75 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                      <Button
                        asChild
                        size="lg"
                        className="h-14 rounded-full bg-foreground px-8 text-base text-background hover:bg-foreground/90"
                      >
                        <Link href={`/console/${patient.id}`}>
                          Open Dossier
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        The war room opens from inside the dossier after patient context is loaded.
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[36px] border border-dashed border-foreground/15 bg-background/70 px-8 py-16 text-center shadow-[0_24px_80px_rgba(0,0,0,0.04)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03]">
                <Search className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-6 text-3xl font-semibold tracking-tight">No patient found.</h3>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Try Morgan, Rowan, PT-001, PT-002, or part of the patient persona to load the dossier result.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
