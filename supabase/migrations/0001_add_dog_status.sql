-- Migration 0001 — add multi-dog status fields
--
-- Only run this if you ran an OLDER version of schema.sql that did not
-- have `status`, `date_rescued`, `rescue_story`, or `archived` columns.
-- If you're setting up for the first time, just run schema.sql and skip this.

alter table puppy_profile
  add column if not exists date_rescued date,
  add column if not exists rescue_story text default '',
  add column if not exists archived boolean default false;

-- Status column (enum-like). Added with a safe default.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'puppy_profile' and column_name = 'status'
  ) then
    alter table puppy_profile
      add column status text not null default 'in_rehab'
      check (status in ('in_rehab','ready_for_adoption','adopted','returned','foster_only'));
  end if;
end $$;

create index if not exists idx_profile_status
  on puppy_profile(status) where archived = false;
