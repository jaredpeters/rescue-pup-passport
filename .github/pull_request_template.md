## What this changes

One or two sentences. What and why.

## Related issue

Closes #... (or: no related issue — describe the motivation above)

## How to test

1. …
2. …

## Checklist

- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] If I added a DB column: migration in `supabase/migrations/` and assertion in `supabase-schema.test.ts`
- [ ] Tested on a real Supabase (not just mocks) if the change touches persistence
- [ ] No hardcoded location-specific content (vet listings, shelter names, etc.)
