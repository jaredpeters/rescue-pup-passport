# Security

Rescue Pup Passport is a static web app. Each person who runs it brings their own Supabase project, and the browser talks to it directly with the public anon key, protected by Row-Level Security. See the "Privacy and data ownership" section of the [README](README.md) for the security model and its limits.

## Reporting a problem

Please report security problems privately, not in a public issue: open the repository's **Security** tab and choose **Report a vulnerability**. You'll get a reply within a week.

Useful things to include: what an attacker could do, the steps to reproduce it, and whether it needs a particular Supabase setup.

## In scope

- The app in `src/`, the database schema and migrations in `supabase/`, and the setup guides
- Advice in the docs that would lead someone to expose their data

Problems in Supabase or Next.js themselves go to those projects.
