# 🐾 Rescue Pup Passport

> A gentle home for everything you know about the dog in your care.

You've got a dog in your back bedroom. Maybe you found him on a trail shoulder. Maybe she came from a hoarding intake with 26 others. Maybe the shelter called because you're the one who takes the hard ones.

You're keeping notes. On the back of an envelope, in your Notes app, in three different text threads with the vet. You know what time she first ate. You remember the exact Tuesday he stopped hiding under the bed. You have a theory about the rash.

**This app is a home for all of it.** A calm, organized place to keep the story of one dog — or ten — from intake to adoption day. And when that day comes, it prints everything into a single beautiful report you can hand to their new family.

---

## For who

- **Full-time rescuers and foster coordinators** juggling multiple dogs at once.
- **Occasional fosters** who want one good tool instead of seven sticky notes.
- **Rehab specialists** taking on the anxious ones, the medical ones, the slow-warm-up ones.
- **Anyone who has ever said** *"I'll remember that"* and then, two weeks later, absolutely had not.

You don't need to be technical. You just need a free Supabase account (we'll walk you through it) and 15 minutes.

---

## What it does

### 🐕 Many dogs at once

Switch between them from the top of the page. Each has their own everything — health history, weights, feedings, potty logs, milestones, journal.

- Mark them as **in rehab**, **ready for adoption**, **adopted**, **returned**, or **foster only**.
- Archive the ones who've gone home. Their records stay, so if they come back through, so does their history.

### 🩺 Health timeline

Vaccines, deworming, medications, symptoms, vet visits, injuries — one timeline, color-coded by urgency. Mark things *resolved* when they pass. Your vet will love you.

### ⚖️ Weight chart

Every weigh-in becomes a point on a line. Watch the gain (or catch the concerning dip) at a glance.

### 🍽️ Feeding log

Timestamps, food type, amount, and — crucially — did they eat *all*, *most*, *some*, or *none*. Because that's the pattern that tells you what's happening before anything else does.

### 💩 Potty log

Type, location, consistency, notes. Not glamorous. But if you've ever needed to tell a vet *"it started on Tuesday evening, normal the week before, soft for two days, diarrhea since yesterday morning,"* you know why this page exists.

### 🌟 Milestones

First bark. First meal finished. First time eating with you in the room. First tail wag. First sleeping on the couch. The moments nobody else will remember, captured in the places they deserve.

### 📔 Daily journal

Mood, energy, sleep hours, and free-form notes. The sentence you couldn't fit anywhere else. *"She came out of the bedroom on her own today. She watched me cook. She's going to be okay."*

### ✅ Vet checklists

Age-based puppy care schedules (6 weeks, 8 weeks, 12 weeks, 16 weeks). Tick items off, add due dates, add notes. Works for adult dogs too — just skip the weeks you don't need.

### 💌 Adopter report

One click on adoption day → a complete, printable passport. Dog's full story, every vaccine, every weight, every milestone, the journal highlights, a welcome note for the new family.

Save it as PDF. Email it. Or print it and hand it over in a folder. They'll read every page.

### 📦 Backup & import

- **Export** any dog's full record as a JSON file. Their history, yours to keep.
- **Import vet records** from a CSV. If your vet can email you a spreadsheet, you can get it in here.

---

## What makes this different

**Your data, your database, no third parties.** The app talks directly to a Supabase project *you own*. No company in the middle. No analytics. No ads. No "upgrade to unlock." No login required (optional if you want it).

**Built for the messy reality of rescue work.** Most pet-tracking apps assume you have one dog, you've had them since 8 weeks old, you know their breed, and everything is fine. This one assumes you might have six dogs, three of them anonymous, two on meds, one who hasn't eaten in 40 hours, and a vet appointment in an hour.

**Nothing gets lost.** Everything syncs to your Supabase. Close the tab, change browsers, pick it up on your phone at the vet — it's all there.

**Forgiving.** Fields are optional. Typos are fixable. Wrong date? Just edit it. We assume you're tired.

---

## See it in action

On first load (after setup), you'll see three fictional example dogs so you can explore every feature with realistic data:

- 🐺 **Willa** — a 4-year-old anxious shepherd mix from a hoarding intake. Wouldn't eat for two days. Week three: playing with the resident cat. Shows how the app handles *slow-burn rehab*.
- 🐶 **Biscuit** — a 7-week-old shepherd puppy found in a cardboard box. Full vaccine schedule ahead, growing fast. Shows *puppy milestone tracking* and *vet checklists*.
- 🐕 **Moose** — a ~5-year-old coonhound of mystery origin, ready for adoption, full of personality. Shows the *adult dog* flow and the *adopter report*.

Delete them whenever you're ready for your own.

---

## Getting started

### 👉 First time? Start here

**[📖 Read the SETUP guide](./SETUP.md)** — a click-by-click walkthrough assuming zero database experience. About 15 minutes from zero to running.

### Already comfortable with Supabase?

```bash
git clone https://github.com/jaredpeters/rescue-pup-passport.git
cd rescue-pup-passport
npm install
cp .env.local.example .env.local   # then paste in your Supabase URL + anon key
# run supabase/schema.sql in your Supabase SQL Editor
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy online (recommended — use it from your phone)

Both of these are free and take a few minutes:

- **Netlify** — fork → import → add the two env vars → Deploy.
- **Vercel** — fork → import → add the two env vars → Deploy.

[Step-by-step deploy guide →](./SETUP.md#step-5--deploy-it-online-optional-but-recommended)

---

## The moving parts (for the curious)

| Layer | Tech |
|---|---|
| Frontend | [Next.js 16](https://nextjs.org/) (static export) + [React 19](https://react.dev/) + TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Database | [Supabase](https://supabase.com/) (Postgres + RLS) |
| Charts | [Recharts](https://recharts.org/) |
| Tests | [Vitest](https://vitest.dev/) |

Static export means the built site is plain HTML/CSS/JS. No server to keep running. Host it anywhere — Netlify, Vercel, GitHub Pages, an S3 bucket, your friend's spare Raspberry Pi.

---

## Privacy & security

- **Your Supabase project URL is what protects your data.** If you share the URL of your deployed app, only people you share it with can reach your database.
- **Row-Level Security** is enabled on every table, with policies set up by the schema file.
- **The anon key** is the one the browser uses. It's designed to be public *within RLS constraints* — it can only do what your policies allow.
- **If you want a stronger guarantee** (like a real login screen so your deployment can live at a public URL), see the [Adding login](#adding-login-optional) section below.

No analytics. No tracking pixels. No third-party cookies. No "we collect usage data to improve the product" small-print. You host it, you own it, you're done.

---

## Adding login (optional)

The default setup is "single user, URL is the secret." Good enough for most personal use. If you want a proper login screen:

1. Turn on **Email auth** in your Supabase project → Authentication → Providers.
2. Tighten the RLS policies to match `auth.uid()` — there's a rough example in the [Supabase docs](https://supabase.com/docs/guides/auth/row-level-security).
3. Add `@supabase/ssr` or the Supabase Auth UI to this app.

This is on the roadmap as an opt-in. PRs welcome.

---

## Roadmap (ideas, not promises)

- [ ] Optional Auth / multi-user shelter mode
- [ ] Photo uploads via Supabase Storage
- [ ] PDF export that doesn't rely on browser print
- [ ] Quick-log widget (add a weight or feeding in one tap)
- [ ] Localization (Spanish first)
- [ ] Import from common vet management systems

See something you want here? [Open an issue](https://github.com/jaredpeters/rescue-pup-passport/issues/new), or fork and send a PR.

---

## Contributing

Yes please. Whether it's a typo fix, a better checklist preset, a translation, or a whole new feature — this project exists to get better with every person who uses it.

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for how to pitch in.

Good first issues: clearer error messages, more vet checklist presets, accessibility tweaks, screenshots for the README, translations.

---

## Thanks

To every person who has opened their home to a dog they didn't have to open it to. This tool is for you.

---

## License

[MIT](./LICENSE). Use it, fork it, adapt it for your shelter, rebrand it entirely — all welcome.

---

<p align="center">🐾 Made for fosters who keep a lot of notes. 🐾</p>
