# Rescue Pup Passport

A structured record-keeping tool for people who rehabilitate rescue dogs.

Rehabilitating a rescue dog produces a lot of information. A first-week feeding pattern. The exact date a fearful dog first ate with you in the room. Three vaccines given over two months at two different clinics. A string of journal notes about a rash that comes and goes. When adoption day arrives, all of that context — months of observation and care — needs to reach the new family in a form they can actually use. Most of the time it doesn't, because it lives in a notes app, a few text threads with the vet, and the rehabilitator's memory.

This app is a home for that information while the dog is in your care, and a way to hand it over cleanly when they leave.

---

## How it works

You set up the app with your own free database (about fifteen minutes — the setup guide walks through it). From then on, you log observations as they happen: what the dog ate, how they slept, how they behaved, what the vet said. Each type of information has its own view optimized for how you actually record it — timestamps for feedings and potty breaks, categories and severity for health events, free text for journal entries.

Over time, the app builds a continuous record of the dog's progress: weight trending up, symptoms trending down, social milestones accumulating. When the dog is adopted, one click produces a complete printable passport — the full history, formatted for handoff — that you can save as PDF, email, or hand over in person.

---

## What you can record

Listed roughly in the order you'll use them during a typical rehabilitation.

### Daily journal

Short entries with mood, energy level, sleep hours, and free-form notes. This is the tool most rehabilitators will touch every day — the place for observations that don't fit any structured field. *"She came out of the bedroom on her own today and watched me cook."*

### Stories

Longer-form narrative entries for observations that span days or weeks. Each story has a title, an optional date range, and free-form body text. Use them for turning points and transitional periods — the first week in a new environment, a breakthrough, a difficult stretch — the context that gives individual journal entries their meaning.

### Feeding log

Timestamped entries recording food type, amount, and how much the dog actually ate — all, most, some, or none. Appetite changes are often the earliest signal of illness or stress, and a structured log is far more useful to a vet than a memory.

### Health log

Vaccines, deworming, medications, symptoms, vet visits, injuries. Each entry is categorized and tagged with a severity level (info, mild, moderate, urgent). Symptoms can be marked resolved when they clear. This replaces the pile of vet invoices, medication bottles, and remembered appointments with a single timeline.

### Potty log

Type, location, consistency, and notes. Unglamorous, but when a dog develops a GI issue, being able to tell a vet *"normal for a week, soft for two days, diarrhea since yesterday morning"* with specific timestamps often shortens diagnosis significantly.

### Weight chart

Every weigh-in becomes a point on a line graph. Watch the gain (or catch a concerning dip) across weeks instead of trying to reconstruct it from memory.

### Milestones

A place to record whatever behavioral or developmental progress matters for the dog in your care — you decide what counts and how to describe it. Optional categories (development, social, training, health, first) exist for organization. For rehab cases specifically, the milestone log is often the clearest evidence that the dog is improving.

### Vet checklists

Age-based schedules for puppy care — 6, 8, 12, and 16 weeks — each with due dates and notes per item. Works for adult dogs too; unused weeks can be skipped. Less for daily use, more for making sure nothing slips through on a puppy's first months.

### Profile

The static information: breed, sex, date of birth, date rescued, microchip, rescue story, personality notes, and adoption status. Updated occasionally.

---

## The adopter passport

When a dog is adopted, the app produces a single printable document containing the complete record: the profile and rescue story, every vaccine and medical event, the weight trajectory, every milestone reached, curated journal highlights, and a welcome note for the new family.

The intent is that the passport answers the questions a new adopter will have over the coming year — *"when was the last flea treatment?"*, *"has she had this cough before?"*, *"how did he respond to being left alone?"* — without the adopter needing to call or text.

Save as PDF, email it, or print and hand it over in a folder at adoption.

---

## Multiple dogs

If you foster or coordinate more than one dog at a time, each has its own complete record. Switching between them happens from the top of the page. Dogs can be archived when they're adopted or returned; their history is preserved and is available again if the dog comes back through.

---

## See it in action

On first connect to an empty database, the app inserts three fictional rescues so the interface has realistic data to explore from the start:

- **Willa** — an anxious shepherd mix from a hoarding intake (slow-burn rehab).
- **Biscuit** — a 7-week-old puppy (puppy milestone tracking and vet checklists).
- **Moose** — an adult coonhound ready for adoption (the full adoption passport flow).

Delete them from the UI whenever you're ready to start with your own records.

---

## Privacy and data ownership

The app stores nothing on a third-party service you don't control. Data lives in a free Supabase project (a hosted Postgres database) that you create and own. The app is a static site — HTML, CSS, and JavaScript that run in the browser and talk directly to your Supabase. There is no middle server, no analytics, no telemetry.

The default deployment assumes you are the only person using it, and that the URL of the deployed site is not shared publicly. Under this assumption the database is protected only by the obscurity of the URL — this is appropriate for personal use but not for a URL that will be indexed or shared widely. If you want a real login screen, see [Adding login](#adding-login-optional) below.

If you ever want to walk away from Supabase, the data is in a standard Postgres database; export it and go.

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (static export) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase (Postgres with Row-Level Security) |
| Charts | Recharts |
| Tests | Vitest |

Static export means the built app is a folder of plain HTML/CSS/JS with no server runtime. It can be hosted on any static host — Netlify, Vercel, GitHub Pages, S3, a personal machine — and works offline to the extent that Supabase is reachable.

---

## Getting started

### Use this template

This repo is a GitHub template. Click **"Use this template" → "Create a new repository"** at the top of the repo page to create your own copy with no upstream fork relationship. You can modify it freely.

### Setup

**[SETUP.md](./SETUP.md)** — step-by-step walkthrough covering Supabase account creation, schema installation, local environment variables, and local dev. Assumes no prior database experience. About fifteen minutes end to end.

For contributors already comfortable with the stack:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
cp .env.local.example .env.local   # paste your Supabase URL + anon key
# run supabase/schema.sql in your Supabase SQL Editor
npm run dev
```

Open `http://localhost:3000`.

### Deploy

The static export is compatible with any static host. The two lowest-friction options:

- **Netlify** — import the repo → add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Deploy.
- **Vercel** — same flow.

Both redeploy automatically on every push. Step-by-step instructions are in [SETUP.md](./SETUP.md#step-5--deploy-it-online-optional-but-recommended).

---

## Adding login (optional)

The default single-user setup doesn't have an account system — the security model is that only you know the URL of your deployment. If that isn't enough (multi-person rescue operation, public URL, sensitive records), add Supabase Auth on top:

1. Enable Email auth in the Supabase dashboard under Authentication → Providers.
2. Rewrite the RLS policies to check `auth.uid()` rather than allowing all anon requests. An example is in the [Supabase docs](https://supabase.com/docs/guides/auth/row-level-security).
3. Add `@supabase/ssr` or the Supabase Auth UI components to the app.

This is on the roadmap as an opt-in configuration.

---

## Backup and portability

- **JSON export** — any dog's complete record exports to a single JSON file.
- **CSV import** — vet records can be imported from a spreadsheet; the importer recognizes weight rows and categorized health log entries.

---

## Roadmap

Non-binding. Ideas under consideration:

- Optional Supabase Auth for multi-user deployments
- Photo upload via Supabase Storage
- Native PDF export independent of browser print
- Quick-log widget for one-tap weight or feeding entries
- Localization (Spanish first)
- Importers for common vet management systems

[Open an issue](https://github.com/jaredpeters/rescue-pup-passport/issues/new) to propose something else.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The project explicitly supports AI-assisted contributions — see the "Contributing with Claude" section there and [WORKING_WITH_CLAUDE.md](./WORKING_WITH_CLAUDE.md) for the working style expected in this repo.

Good first issues: improved vet checklist presets, accessibility fixes, clearer error messages, translations.

---

## License

[MIT](./LICENSE).
