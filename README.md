# 🐾 Rescue Pup Passport

A warm, detailed tracker for rescue dogs — health, weight, feeding, potty, milestones, daily journal, and a printable adopter-ready passport. Multi-dog, cloud-synced.

Built for fosters and rescuers who keep a lot of notes and want to hand a new family **everything** on adoption day.

---

## What it does

- **Track many dogs at once.** Switch between them from the header. Each dog has their own health history, weights, feedings, potty log, milestones, and journal.
- **Health timeline.** Vaccines, deworming, medications, symptoms, vet visits — all in one scrolling history with severity tags.
- **Weight chart.** Every weigh-in plotted on a simple line graph.
- **Feeding & potty logs.** Timestamped, with notes. Useful for catching early signs something's off.
- **Milestones.** First bark, first successful recall, first day eating with people in the room — the small things that matter.
- **Daily journal.** Mood, energy, sleep hours, free-form notes. The stuff that tells the real story.
- **Vet checklists.** Age-based puppy vaccine/care schedules you can tick off as you go.
- **Adopter Report.** One click → a complete printable PDF of the dog's whole history. Hand it to the new family on adoption day.
- **Import/export.** JSON backups per dog, CSV import for vet records.
- **Parvo-aware resources.** If you log a parvo diagnosis, the Resources tab surfaces recovery guidance and warning signs.

Everything lives in your own Supabase project. **No third parties, no analytics, no ads, no accounts to manage** — it's your data, in your database, full stop.

---

## Quick start

**First time setting up a database? Read [SETUP.md](./SETUP.md) instead — it walks you through every click.**

If you're comfortable with Supabase already:

```bash
git clone https://github.com/jaredpeters/rescue-pup-passport.git
cd rescue-pup-passport
npm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# then run supabase/schema.sql in your Supabase SQL Editor
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). You'll see three example dogs (Willa, Biscuit, Moose) — delete them and add your own real rescues.

---

## Deploy

One-click deploy after forking the repo:

- **Netlify**: import your fork, add the two Supabase env vars, build command `npm run build`, publish directory `out`.
- **Vercel**: import your fork, add the two env vars, default Next.js settings.

Detailed walkthrough in [SETUP.md](./SETUP.md#step-5--deploy-it-online-optional-but-recommended).

---

## Tech stack

- [Next.js 16](https://nextjs.org/) with static export (`output: "export"`) — no server runtime needed
- [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres + REST + Row-Level Security)
- [Recharts](https://recharts.org/) for the weight chart
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for tests

Static export means the built site is just HTML/CSS/JS files. Host it anywhere — Netlify, Vercel, GitHub Pages, an S3 bucket. Supabase handles all the dynamic parts.

---

## Multi-dog data model

- **`puppy_profile`** — one row per dog. (The table is named `puppy_profile` for historical reasons; the app has supported adult dogs the whole time.) Has a `status` field: `in_rehab`, `ready_for_adoption`, `adopted`, `returned`, `foster_only`.
- **Child tables** (`weight_entries`, `health_logs`, `feeding_entries`, `potty_logs`, `milestones`, `daily_notes`, `vet_checklists`) — each row references a `puppy_id`. Cascade-delete so removing a dog cleans up everything.
- **Archiving** — soft delete via `archived = true`, so adopted dogs' records stay recoverable.

Row-Level Security is enabled on every table. The default policy allows any request with the anon key to read/write — appropriate for single-user deployments where only you know your Supabase URL.

---

## Adding login (optional)

The default setup treats **your Supabase project URL as your secret**. If you share your deployment URL with others, or run this on a public domain, anyone who finds it could write to your database.

To add real login, read [Supabase Auth — Password](https://supabase.com/docs/guides/auth/passwords) and tighten the RLS policies to match `auth.uid()`. A minimal change looks like:

```sql
-- Example: restrict all rows to the authenticated user
drop policy "anon all puppy_profile" on puppy_profile;
create policy "owner reads own" on puppy_profile
  for select using (auth.uid() = owner_id);
-- ... and similar for insert/update/delete + all child tables
-- (requires adding an owner_id column to each table)
```

This is on the roadmap as an optional opt-in, not the default — the goal is to keep setup simple for the single-user case.

---

## Development

```bash
npm run dev       # http://localhost:3000
npm test          # run the vitest suite
npm run build     # production build (static export to /out)
npm run lint      # eslint
```

The test suite covers the seed data integrity, Supabase config detection, the schema file, and the import/export utilities. It does not hit a real Supabase — tests are fast and deterministic.

---

## Contributing

This project exists so people rescuing animals have a tool that actually fits how they work. Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

Good first issues: clearer error messages, more checklist presets, accessibility improvements, translations.

---

## License

[MIT](./LICENSE). Use it, fork it, ship a version with your shelter's branding — all good.

---

Made for fosters who keep a lot of notes. 🐾
