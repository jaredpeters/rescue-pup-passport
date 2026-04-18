# Setup Guide — Rescue Pup Passport

This guide walks you through every click. **No prior database experience required.** If you get stuck at any step, open an issue and we'll improve the guide.

You will:

1. Create a free Supabase account (this is where your dogs' records live)
2. Create the tables
3. Connect the app to your Supabase
4. Run it locally, then deploy it online

Rough time: **15–20 minutes** if it's your first time. Faster once you've done it.

---

## What you need before you start

- A web browser
- A free [GitHub account](https://github.com/join) (for deploying later — not needed right now)
- A free [Supabase account](https://supabase.com) — we'll create this together in Step 1
- **Node.js 20 or newer** installed on your computer. To check:
  ```bash
  node --version
  ```
  If you see `v20.x.x` or higher, you're set. If not, install from [nodejs.org](https://nodejs.org) (pick the "LTS" version).

---

## Step 1 — Create your Supabase project

Supabase is the service that stores your data. Your account is free; you won't be charged unless you go way over the free tier (which is unlikely for this app).

1. Go to **[supabase.com](https://supabase.com)** and click **Start your project**.
2. Sign in with GitHub (easiest) or email.
3. Once you're logged in, click **New project** (green button, top-right of your dashboard).
4. Fill in:
   - **Name**: anything you want — e.g., `rescue-pup-passport`
   - **Database Password**: click the **Generate a password** button and **save it somewhere safe** (a password manager, a note, anywhere you won't lose it). You won't need it often, but you can't recover it — only reset it.
   - **Region**: pick whichever is closest to you.
   - **Pricing plan**: **Free**.
5. Click **Create new project**.
6. Wait ~2 minutes for Supabase to build your project. You'll see a loading spinner; that's normal.

✅ When you see the project dashboard (green "Project Status: Healthy"), move on.

---

## Step 2 — Create the tables (run the schema file)

The app needs specific tables to store profiles, health logs, weights, etc. We ship a single file that creates them all.

1. In the left sidebar of your Supabase dashboard, click **SQL Editor** (the `<>` icon).
2. Click **New query** (top-right).
3. Open [`supabase/schema.sql`](./supabase/schema.sql) from this repo in a second tab.
4. Select everything in that file (`Cmd/Ctrl+A`) and copy it (`Cmd/Ctrl+C`).
5. Paste it into the Supabase SQL Editor.
6. Click the green **Run** button (or press `Cmd/Ctrl+Enter`).

✅ You should see **"Success. No rows returned."** at the bottom. That's exactly what you want.

❌ If you see an error mentioning something like "already exists" — that's fine, it means you ran this before. The script is safe to re-run.

❌ If you see any other error, copy it into a [new GitHub issue](https://github.com/jaredpeters/rescue-pup-passport/issues/new) and we'll help.

---

## Step 3 — Copy your two connection values

The app needs two strings to connect to your database:

1. In your Supabase dashboard sidebar, click **Settings** (the gear icon at the bottom).
2. Click **API** in the settings submenu.
3. You'll see two values you need. Keep this tab open — we'll use them in the next step.
   - **Project URL** — looks like `https://abcdefghijk.supabase.co`
   - **Project API keys** → **anon public** — a long string starting with `eyJ…`

> **The `anon` key is safe in the browser.** That's what it's designed for. **Do NOT copy the `service_role` key** (that one is secret and should never leave the server).

---

## Step 4 — Set up the app locally

1. Clone the repo:
   ```bash
   git clone https://github.com/jaredpeters/rescue-pup-passport.git
   cd rescue-pup-passport
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local environment file by copying the example:
   ```bash
   cp .env.local.example .env.local
   ```

4. Open `.env.local` in any text editor and paste in your two values from Step 3:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...the-long-anon-key...
   ```
   Save the file.

5. Start the app:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

✅ You should see **three example dogs** (Willa, Biscuit, and Moose) pre-loaded. These are fictional examples showing how the app works — **you can delete them any time** from the "Import/Export" tab (Danger zone → Delete permanently).

---

## Step 5 — Deploy it online (optional, but recommended)

Running it only on your own computer works, but you'll probably want to use it from your phone too. The easiest free host is **Netlify**.

### Option A — One-click Netlify deploy

1. Fork this repo to your own GitHub account (click **Fork** at the top-right of the GitHub page).
2. Go to [app.netlify.com](https://app.netlify.com) and sign in with GitHub.
3. Click **Add new site** → **Import an existing project** → **GitHub** → choose your fork.
4. In the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
5. Click **Show advanced** → **New variable** and add the two Supabase values from Step 3:
   - Key: `NEXT_PUBLIC_SUPABASE_URL` — Value: your project URL
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Value: your anon key
6. Click **Deploy site**.

✅ Within about 2 minutes you'll have a public URL like `your-site-name.netlify.app`. Open it on your phone, bookmark it to your home screen, and you're set.

### Option B — Vercel

Works just as well. [vercel.com](https://vercel.com) → Import from GitHub → add the same two environment variables → Deploy.

---

## Troubleshooting

### "Couldn't connect to your database"

This error means the app loaded but can't reach Supabase. Check:

- Did you paste the **anon** key and not the service_role key?
- Is there a typo in the URL? It should look like `https://<something>.supabase.co` (no trailing slash, no extra spaces).
- Did you actually run `schema.sql` in Step 2? If not, the tables don't exist yet.

### "No dogs yet" screen even though I expected the seed dogs

The three seed dogs (Willa, Biscuit, Moose) are inserted **only when the database is empty**. If you deleted them, or if you ran the schema but the seeding somehow failed, add your own dog via the "+ Add a dog" button — you don't need the examples.

### Seed dogs came back after I deleted them

They won't — seeding only runs when the dogs table has zero rows. If you delete two of them and add a real dog, the seeder will not re-run.

### I pushed the wrong key by accident / my `.env.local` was in git

Stop, and:

1. In Supabase: **Settings → API → Reset anon key** (this invalidates the leaked key immediately).
2. Update `.env.local` with the new key.
3. Rewrite git history to remove the committed file (see [GitHub's guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)).

The anon key is "safe in the browser" when protected by Row-Level Security — which the schema sets up. Even if leaked, an attacker can only do what your policies allow. Still, rotate anyway.

---

## What's next

- Read the [README](./README.md) for a tour of the features.
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) if you want to help improve the app.
- If you want to **add a login screen** (so the app isn't wide-open to anyone with your URL), see the "Adding login" section in the README.

Questions? [Open an issue](https://github.com/jaredpeters/rescue-pup-passport/issues/new). No question is too basic.
