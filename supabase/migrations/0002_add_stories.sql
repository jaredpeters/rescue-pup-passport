-- Migration 0002 — add stories table
--
-- Run this if your project was set up with an older version of schema.sql
-- that did not include a `stories` table. If you're setting up for the
-- first time, just run schema.sql and skip this migration.
--
-- How to apply:
--   1. Open your Supabase dashboard → SQL Editor → New query.
--   2. Paste the contents of this file.
--   3. Click Run.
--   4. Reload the app. The Stories tab is now available.

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppy_profile(id) on delete cascade,
  title text not null,
  body text not null default '',
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_stories_puppy_start
  on stories(puppy_id, start_date desc);

alter table stories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'stories' and policyname = 'anon all stories'
  ) then
    create policy "anon all stories" on stories for all using (true) with check (true);
  end if;
end $$;

drop trigger if exists stories_updated_at on stories;
create trigger stories_updated_at
  before update on stories
  for each row execute function update_updated_at();
