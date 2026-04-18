# Contributing to Rescue Pup Passport

First: thank you for even thinking about helping. This project exists to make life a little easier for people rescuing dogs, and every improvement matters.

You don't need to be a "real developer" to contribute. If you've used the app and something felt clunky, **that's a valid bug report**. Open an issue.

## Ways to help

- **Report bugs.** [Open an issue](https://github.com/jaredpeters/rescue-pup-passport/issues/new) — no format required, just describe what happened.
- **Suggest features.** Especially if you rescue dogs yourself — tell us what's missing.
- **Improve docs.** Better `SETUP.md` screenshots, typo fixes, clearer error wording.
- **Code.** Pick any open issue or propose your own.

## Local development

Follow [SETUP.md](./SETUP.md) to get the app running against your own Supabase. Then:

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # vitest
npm run build     # verify static export still builds
npm run lint      # eslint
```

Before opening a PR, run all three — `npm test`, `npm run build`, `npm run lint` — and make sure they pass.

## Testing against a real Supabase

Some bugs only reproduce with a live database. Keep a dedicated "test" Supabase project for this — don't develop against your production data. Free tier lets you have several projects at once.

## Pull requests

1. Fork the repo and branch off `main`.
2. Make your changes. Keep them focused — small PRs get reviewed faster.
3. If you add a database column: add both a migration in `supabase/migrations/` **and** an assertion in `src/__tests__/supabase-schema.test.ts`. The schema test is what stops silent drift.
4. If you add a new UI concept: try to test it on a phone-sized viewport. Most users open this app on their phones during foster work.
5. Push to your fork and open a PR. Reference any related issue.

## What we're trying to keep simple

- **Setup stays ~15 minutes for a non-technical user.** Any change that adds required steps needs a good reason.
- **No server runtime.** The app is a static export. If you need dynamic behavior, use Supabase.
- **No third-party analytics or tracking.** Ever.
- **No location-specific content.** The project is used by rescuers all over. Keep resources generic.

## Contributing with Claude (or another AI assistant)

A significant share of contributors to this project are using Claude Code or a similar AI assistant. That's by design. A few expectations to keep those contributions reviewable:

- **Plan before coding.** For anything touching more than a file or two, ask your assistant to produce a plan first and approve it before it writes code. Small, scoped PRs are much easier to review than sprawling ones.
- **Read the diff yourself.** An assistant can confidently produce plausible code that doesn't do what you asked. Before opening a PR, open the diff in GitHub Desktop (or `git diff`) and check: did it only change what you wanted? Are there files you didn't expect? Any `TODO` / `you'll need to...` comments left behind?
- **Run the full test suite.** `npm test && npm run build && npm run lint`. If something fails, understand *why* before accepting a fix. "Make the test pass" is the wrong prompt — a deleted test is worse than a failing one.
- **Keep the assistant-generated code consistent with the codebase.** This project uses the patterns documented in `CLAUDE.md`. If your assistant is suggesting things that contradict those patterns (introducing a server runtime, reintroducing localStorage as a data store, adding analytics), push back.
- **Cite nothing you don't understand.** If a reviewer asks why the code does X, you should be able to answer. If you can't, the PR isn't ready.

`WORKING_WITH_CLAUDE.md` covers the day-to-day workflow in more detail.

## How to add a database column

Follow this exact order. Skipping a step silently breaks either the build, the tests, or other people's deployments.

1. **Write a migration.** Create `supabase/migrations/000N_<descriptive_name>.sql`, where `N` is one higher than the highest existing migration number. Use `add column if not exists` so the migration is idempotent.
2. **Update the canonical schema.** Add the same column to `supabase/schema.sql`. New users run `schema.sql` once; existing users run the migration. Both files must agree.
3. **Update `src/lib/types.ts`.** Add the camelCase field to the relevant interface (`Dog`, `WeightEntry`, etc.). The `toCamel` / `toSnake` helpers in `db.ts` handle naming conversion at the Supabase boundary — application code stays camelCase.
4. **Update `src/__tests__/supabase-schema.test.ts`.** Add an assertion that the new column exists in the schema text, plus any check constraint. This test is the guard against schema drift between `schema.sql` and the migrations.
5. **Use the field.** React and store code can now read/write it.

Run `npm test`. The schema test will fail loudly if you missed step 2 or 4.

## Code style

- TypeScript, strict mode.
- Camel case in TS; snake case only where we talk to Postgres (`toCamel` / `toSnake` in `db.ts`).
- Tailwind for styles; avoid raw CSS files unless you're adding a new global (like print styles).
- Keep components mostly presentational. Data flow lives in `useDogStore`.

## Code of conduct

Be kind. If you wouldn't say it to a stranger who's just had a hard week at the rescue, don't say it here.

## License

By contributing, you agree your contributions are licensed under the [MIT License](./LICENSE).

## Questions

Any. Seriously, any. [Open an issue](https://github.com/jaredpeters/rescue-pup-passport/issues/new) — there are no dumb questions here.
