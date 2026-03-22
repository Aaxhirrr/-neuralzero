# Neural Zero

<p align="center">
  <strong>I built Neural Zero as a predictive surveillance system for paralyzed patients.</strong>
</p>

<p align="center">
  Instead of waiting for a patient to fully crash and then react, I wanted to show how a room camera, a small biometric pipeline, and a multi-agent console could help flag deterioration earlier.
</p>

<p align="center">
  <code>Next.js</code>
  <code>React</code>
  <code>TypeScript</code>
  <code>Anthropic API</code>
  <code>Vercel</code>
</p>

## What this is

Neural Zero is a hackathon prototype and demo experience.

I designed it around one simple idea:

> If a patient cannot speak or move much, their face, breathing pattern, color return, and tiny physiological changes may still be telling us something important before a classic bedside alarm fires.

So I built a product story around that.

The project has:

- a landing page that explains the problem and the system
- a patient directory
- a dossier page with human context, baseline notes, and clinician-style context
- a war room where multiple agents debate what the system is seeing
- a report view that summarizes technical findings, clinical interpretation, and final action

## The demo flow

This is the flow I use when I present it:

1. I start on the homepage.
2. I open the patient directory.
3. I search for a patient and open their dossier.
4. I enter the war room.
5. The center canvas shows the patient relay.
6. The agents around the edges explain what each lane is seeing.
7. The Chief terminal resolves the room into one final decision.

I currently use two demo patients:

- `PT-001 / Morgan Ellison`: quiet baseline, observe-only case
- `PT-002 / Rowan Hale`: distress case, predictive escalation case

## What I wanted to prove

I wanted this project to feel like something that could sit between messy real hospital infrastructure and an actual clinical team.

That is why I included:

- a hidden cached/live relay mode
- a historical nearest-case graph lane
- a Holter-style electrical comparator for the Bio lane
- terminal scripts that look like legacy HL7 traffic and live camera perception output
- a glassy but readable console that feels more like a workstation than a generic dashboard

## Main features

### 1. Landing page

I wanted the first impression to feel calm, technical, and intentional.

The homepage explains:

- the clinical problem
- the predictive-monitoring angle
- the multi-agent reasoning model
- why silent or preventable deterioration matters

### 2. Patient dossier

I did not want the patient pages to feel like anonymous machine output.

So each dossier includes:

- human background
- medical history
- hospital stay context
- physician note
- nursing note
- baseline persona based on time already spent in the hospital

### 3. War room

The war room is the core experience.

It includes:

- live patient feed
- ECG strip
- agent cards around the edges
- a Vision popup with face lock, body scan, and cue overlays
- a CrossCheck popup with a knowledge-graph style view
- a Bio popup with a Holter deterioration replay
- a Chief consensus stream
- a downloadable clinical report

### 4. Demo-only realism scripts

I also added standalone terminal scripts so I can show supporting infrastructure during a live demo without wiring everything directly into the app UI.

- `scripts/legacy_hl7_relay.py`
- `scripts/vision_perception_relay.py`
- `scripts/hardcoded_knowledge_graph.py`
- `scripts/hardcoded_holter.py`

These help me present the system as if it is receiving live monitor data, camera perception data, graph cross-check context, and electrical-breakdown context in real time.

## Tech stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `Radix UI`
- `Lucide React`
- `Anthropic API` for the live relay mode
- `Python` for demo support scripts

## Project structure

```text
app/
  api/
  console/
components/
  console/
  landing/
  ui/
lib/
scripts/
src/
  dataset/
  imgs/
  vids/
```

## Local setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Add environment variables

Create `.env.local` with:

```env
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

### 3. Run the app

```bash
pnpm dev
```

### 4. Open it

```text
http://localhost:3000
```

If I am using a different port locally, I just open that port instead.

## Demo scripts

### Legacy HL7 relay

```bash
python scripts/legacy_hl7_relay.py --patient patient-2 --mode raw --interval 0.03
```

### Vision perception relay

```bash
python scripts/vision_perception_relay.py --patient patient-2 --mode compact --interval 0.12
```

### Historical graph payload

```bash
python scripts/hardcoded_knowledge_graph.py patient-2
```

### Holter comparator payload

```bash
python scripts/hardcoded_holter.py patient-2
```

## Live mode vs cached mode

I built the console so it can work in two ways:

- `cached`: best for demos, stable and predictable
- `live`: pulls server-side generated war-room output through the Anthropic API

If the API key is missing, the app still works in cached mode.

## About the dataset folder

The files inside `src/dataset` are there for presentation and context.

They are not required for the main app flow, and I did not treat them as a production-grade medical backend.

## Why I made it this way

I did not want this to feel like a generic "AI healthcare dashboard."

I wanted it to feel like:

- a real pitch
- a believable clinical command center
- a system with layered reasoning
- a product demo that tells a story clearly

So the whole repo is built around clarity, atmosphere, and demo realism.

## Important note

This is a prototype for demonstration purposes, not a real medical device, not a diagnostic tool, and not clinical advice.

## Author

Built by me, Aashir.

If you are here from the demo, thank you for taking the time to look through it.
