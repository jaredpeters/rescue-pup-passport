# CLAUDE.md — orientation for AI assistants

You are working in **Rescue Pup Passport**, an open-source web app for dog rescuers. The most likely contributor here is a non-developer using an AI assistant — that's by design. Optimize for clear, small changes that this contributor can review and trust.

Read [README.md](./README.md) for the user-facing pitch and [SETUP.md](./SETUP.md) if you need to understand the setup flow. [WORKING_WITH_CLAUDE.md](./WORKING_WITH_CLAUDE.md) is a guide for the human you're paired with.

## Architecture in 60 seconds

Next.js 16 with `output: "export"` — the entire app is static HTML/CSS/JS. All persistence goes through Supabase Postgres via `@supabase/supabase-js` using the anon key from the browser, protected by Row-Level Security. **No API routes, no server runtime.** `localStorage` is used **only** to remember which dog was last selected (`rpp-selected-dog-id`) — it is not a data store.

## Key files

- `src/lib/types.ts` — the domain model. `Dog` is the profile; `DogData` is per-dog children (weights, health logs, etc.); `PuppyData = DogData + { profile: Dog }` is the composite shape components consume. `SeedDog` is `DogData + { profile: Omit<Dog, "id"> }` for pre-insert fixtures.
- `src/lib/supabase.ts` — singleton client. `isSupabaseConfigured()` rejects placeholder values from `.env.local.example`.
- `src/lib/db.ts` — all Supabase queries. `db.dogs.*` for profile CRUD, `db.{weights,healthLogs,...}` for child-row mutations. `loadDogData(dogId)` is the fan-out fetch. `seedIfEmpty()` inserts the three demo dogs on first connect.
- `src/lib/storage.ts` — `getSeedDogs()` returns the demo profiles, `generateId()`, JSON export/import, CSV import, and the selected-dog-id localStorage pointer. Nothing else should touch localStorage.
- `src/lib/useDogStore.ts` — the single React hook every page uses. Profiles, selected dog, full composed `PuppyData`, all mutators. Optimistic add → real UUID swap on DB success.
- `supabase/schema.sql` — full DDL. New users run it once. Idempotent.
- `supabase/migrations/` — small additive migrations for users who ran an earlier `schema.sql`.
- `src/components/SetupScreen.tsx` — shown when env vars are missing or placeholder. The first thing a non-technical user sees if they miss a setup step.

## Common change patterns

These are the changes you'll be asked to make most often. The "scope" column tells you how many files to expect to touch.

| Change | Scope | Files |
|---|---|---|
| Tweak label, color, or copy | 1 file | The relevant component |
| Add a field to an existing form | 2–3 files | `types.ts` + the form component + maybe `ProfileCard.tsx`/`AdopterReport.tsx` for display |
| Add a new column to a database table | 4 files | new `supabase/migrations/000N_*.sql`, `supabase/schema.sql`, `types.ts`, `supabase-schema.test.ts` |
| Add a new tab | 2–3 files | new component, register in `src/app/page.tsx` `tabs` array, render block |
| Add a new entity type (e.g., "vet bills") | 6–8 files | migration + schema + types + db helpers + store hook entry + new component + register in page |

If you're about to touch >3 files for what was described as a small change, **stop and ask** — you're probably building something the user didn't request.

## Recipe: adding a database column

Follow this exact order. Skipping a step silently breaks either the build, the tests, or other people's deployments.

1. **Write a migration**: create `supabase/migrations/000N_<descriptive_name>.sql`. Use `add column if not exists`. Number it one higher than the highest existing migration.
2. **Update the canonical schema**: add the same column to `supabase/schema.sql`. New users run schema; existing users run the migration. Both must agree.
3. **Update `src/lib/types.ts`**: add the camelCase field to the relevant interface (`Dog`, `WeightEntry`, etc.).
4. **Update `src/__tests__/supabase-schema.test.ts`**: add an assertion that the new column exists in the schema text. This is the guard against schema drift.
5. **Use it**: React/store code can now read/write the field. The `toCamel`/`toSnake` helpers in `db.ts` handle naming conversion automatically.

Run `npm test` to confirm; the schema test will fail loudly if you missed step 2 or 4.

## Load-bearing — don't accidentally rip out

These design choices look removable but aren't. Don't refactor them away without an explicit ask.

- **Static export (`output: "export"` in `next.config.ts`)** — what makes the app deployable to any static host. Don't add API routes, server actions, or middleware.
- **Anon-key-in-browser pattern + RLS policies** — the entire security model. Don't move queries to a backend; if real auth is wanted, layer Supabase Auth on top.
- **`puppy_*` table names** — historical. Renaming would break every existing user's database. Only with a versioned migration story.
- **The 3 seed dogs (Willa, Biscuit, Moose)** — onboarding UX. Don't replace with empty state; users who don't want them can delete from the UI.
- **`isSupabaseConfigured()` placeholder check** — keeps the SetupScreen visible when env vars contain template values. Don't simplify it to a null check.
- **No analytics, no third parties** — a stated value of the project. Don't add Sentry, GA, PostHog, error reporting, or anything that phones home.

## Conventions

- **Camel/snake mapping** is done in `db.ts` via `toCamel` / `toSnake`. TypeScript is camelCase, Postgres is snake_case. Don't leak snake_case into React components.
- **IDs** are UUIDs generated by Postgres for real rows. Seed dogs use static string IDs so tests can assert them. `generateId()` is for optimistic temp IDs only, before the DB assigns a real UUID.
- **Dates** are ISO `YYYY-MM-DD` strings everywhere in TS. Postgres `date` type. Never use JS `Date` in application code except for display formatting.
- **Severity / category / status** are string literal unions mirrored by SQL `check` constraints. Add a value in both places or the insert will fail silently (error is logged, UI shows stale row).
- **Code comments** — minimal. The project style is to let well-named code speak for itself. JSDoc one-liners on top of public functions are fine; multi-paragraph docstrings are not.

## Testing

Vitest + jsdom. Tests are fast, deterministic, and **do not hit a real Supabase**. Three test files:

- `storage.test.ts` — seed dog integrity, ID utilities, import/export round-trips.
- `db.test.ts` — `isSupabaseConfigured()` behavior including placeholder rejection.
- `supabase-schema.test.ts` — parses `schema.sql` as text and asserts required tables, columns, RLS policies, check constraints. **The guard against schema drift.**

If you add a column or table, add both a migration in `supabase/migrations/` **and** an assertion in `supabase-schema.test.ts`. CI runs `npm test` + `npm run build` on every PR.

## Conversation shape

This codebase is small enough that you can hold the relevant files in context. For any change touching >2 files, **plan before editing** — show the user what you intend to change, get a "go," then implement. The contributor often can't easily tell if you've done something subtle that's wrong; planning gives them a chance to catch drift early.

When the user reports a bug, ask for: the exact error text, the file or feature involved, and what they did just before it appeared. Don't fix without that context — fabricated fixes are worse than no fix.

## What NOT to do

- Don't add a Node/server runtime.
- Don't reintroduce `localStorage` as a data store.
- Don't hardcode a Supabase URL (the repo is public; users bring their own).
- Don't add location-specific content (vet listings, local shelters).
- Don't add analytics or tracking.
- Don't write multi-paragraph code comments.
- Don't `git push --force` or skip hooks.

## Running things

```bash
npm install
npm run dev       # localhost:3000
npm test          # vitest
npm run build     # produces /out for static deploy
```

## When the contributor is non-technical

Most contributors won't be software engineers — they'll be rescuers and designers using AI to adapt the app for their workflow. When in doubt:

- Prefer editing an existing component over introducing a new concept.
- Write error messages that say what to do, not what went wrong technically.
- Keep diffs small. A 30-line PR they can read and trust beats a 300-line PR they have to take on faith.
