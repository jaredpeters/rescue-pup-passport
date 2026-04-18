-- Rescue Pup Passport — Supabase Schema
--
-- What this file does:
--   Creates every table the app needs, with relationships, data validation,
--   security policies, and performance indexes.
--
-- How to run it:
--   1. Open your Supabase dashboard.
--   2. In the sidebar, click "SQL Editor".
--   3. Click "New query".
--   4. Copy the ENTIRE contents of this file into the editor.
--   5. Click "Run" (or press Cmd/Ctrl + Enter).
--   6. You should see "Success. No rows returned." — that's what you want.
--
-- You only need to run this ONCE per Supabase project.
-- If you already ran an older version of this file, see the `migrations/`
-- folder for small additive updates.
--
-- Note: tables are named `puppy_*` for historical reasons. The app supports
-- dogs of any age — "puppy" here just means "one of your rescue dogs."

-- ── Dogs (profiles) ────────────────────────────────────────
-- One row per dog you are tracking.
create table if not exists puppy_profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'New Dog',
  breed text default '',
  color text default '',
  sex text default '',
  date_of_birth date,
  date_rescued date,
  status text not null default 'in_rehab'
    check (status in ('in_rehab','ready_for_adoption','adopted','returned','foster_only')),
  microchip_id text default '',
  photo_url text default '',
  personality text default '',
  rescue_story text default '',
  adoption_date date,
  adopter_name text default '',
  adopter_contact text default '',
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Weight entries ─────────────────────────────────────────
create table if not exists weight_entries (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppy_profile(id) on delete cascade,
  date date not null,
  weight_lbs numeric(5,2) not null,
  notes text default '',
  created_at timestamptz default now()
);

-- ── Health logs ────────────────────────────────────────────
create table if not exists health_logs (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppy_profile(id) on delete cascade,
  date date not null,
  category text not null check (category in ('vaccine','deworming','medication','symptom','vet_visit','injury','other')),
  title text not null,
  details text default '',
  severity text not null default 'info' check (severity in ('info','mild','moderate','urgent')),
  resolved boolean default false,
  created_at timestamptz default now()
);

-- ── Feeding entries ────────────────────────────────────────
create table if not exists feeding_entries (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppy_profile(id) on delete cascade,
  date date not null,
  time time not null,
  food_type text not null,
  amount text default '',
  ate text not null default 'all' check (ate in ('all','most','some','none')),
  notes text default '',
  created_at timestamptz default now()
);

-- ── Potty logs ─────────────────────────────────────────────
create table if not exists potty_logs (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppy_profile(id) on delete cascade,
  date date not null,
  time time not null,
  type text not null check (type in ('pee','poop','both')),
  location text not null default 'inside' check (location in ('inside','outside','pad')),
  consistency text not null default 'normal' check (consistency in ('normal','soft','diarrhea','hard','blood')),
  notes text default '',
  created_at timestamptz default now()
);

-- ── Milestones ─────────────────────────────────────────────
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppy_profile(id) on delete cascade,
  date date not null,
  category text not null check (category in ('development','social','training','health','first')),
  title text not null,
  description text default '',
  achieved boolean default false,
  created_at timestamptz default now()
);

-- ── Daily notes (journal) ──────────────────────────────────
create table if not exists daily_notes (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppy_profile(id) on delete cascade,
  date date not null,
  mood text not null check (mood in ('happy','playful','sleepy','fussy','sick','calm')),
  energy_level integer not null check (energy_level between 1 and 5),
  sleep_hours numeric(4,1) default 0,
  notes text default '',
  created_at timestamptz default now()
);

-- ── Vet checklists ─────────────────────────────────────────
create table if not exists vet_checklists (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppy_profile(id) on delete cascade,
  week_age integer not null,
  created_at timestamptz default now()
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid references vet_checklists(id) on delete cascade,
  label text not null,
  done boolean default false,
  due_date date,
  notes text default '',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ── Indexes for performance ────────────────────────────────
create index if not exists idx_weight_puppy_date on weight_entries(puppy_id, date);
create index if not exists idx_health_puppy_date on health_logs(puppy_id, date);
create index if not exists idx_feeding_puppy_date on feeding_entries(puppy_id, date);
create index if not exists idx_potty_puppy_date on potty_logs(puppy_id, date);
create index if not exists idx_milestones_puppy on milestones(puppy_id);
create index if not exists idx_daily_notes_puppy_date on daily_notes(puppy_id, date);
create index if not exists idx_checklist_items on checklist_items(checklist_id);
create index if not exists idx_profile_status on puppy_profile(status) where archived = false;

-- ── Row-Level Security ─────────────────────────────────────
-- These policies allow any request using your project's anon key to read and
-- write data. That is the correct setup for a single-user deployment where
-- only you know your Supabase URL. If you later add collaborators or want
-- stronger access control, read the README section titled "Adding login".
alter table puppy_profile enable row level security;
alter table weight_entries enable row level security;
alter table health_logs enable row level security;
alter table feeding_entries enable row level security;
alter table potty_logs enable row level security;
alter table milestones enable row level security;
alter table daily_notes enable row level security;
alter table vet_checklists enable row level security;
alter table checklist_items enable row level security;

create policy "anon all puppy_profile" on puppy_profile for all using (true) with check (true);
create policy "anon all weight_entries" on weight_entries for all using (true) with check (true);
create policy "anon all health_logs" on health_logs for all using (true) with check (true);
create policy "anon all feeding_entries" on feeding_entries for all using (true) with check (true);
create policy "anon all potty_logs" on potty_logs for all using (true) with check (true);
create policy "anon all milestones" on milestones for all using (true) with check (true);
create policy "anon all daily_notes" on daily_notes for all using (true) with check (true);
create policy "anon all vet_checklists" on vet_checklists for all using (true) with check (true);
create policy "anon all checklist_items" on checklist_items for all using (true) with check (true);

-- ── updated_at trigger ─────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profile_updated_at on puppy_profile;
create trigger profile_updated_at
  before update on puppy_profile
  for each row execute function update_updated_at();
