-- ============================================================================
-- Migration 1 of 4 — Accounts, domains and membership
--
-- Creates the three club domains, the member profile table, and the approval
-- flow that lets an admin let someone in.
--
-- Two rules this file follows, and so does every later migration:
--   1. Row-level security is turned on for every table, in the same migration
--      that creates it. The default is deny.
--   2. Tables get SELECT policies only. Every INSERT, UPDATE and DELETE goes
--      through the Express API using the service_role key, which ignores RLS.
--      So "no write policy" is deliberate, not an oversight.
-- ============================================================================

create extension if not exists pgcrypto;

-- A separate schema for helper functions, so they do not clutter the tables.
create schema if not exists app;


-- ----------------------------------------------------------------------------
-- Enum types. Using enums instead of free text means a typo is a database
-- error rather than a row nobody notices for three weeks.
-- ----------------------------------------------------------------------------
create type member_status      as enum ('pending', 'active', 'deactivated');
create type domain_role        as enum ('member', 'mentor');
create type application_status as enum ('pending', 'approved', 'rejected');


-- Keeps updated_at honest without the application having to remember.
create or replace function app.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;


-- ----------------------------------------------------------------------------
-- domains — the club's three domains. Seeded at the bottom of this file.
-- ----------------------------------------------------------------------------
create table domains (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  position      int  not null default 0,
  created_at    timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- members — one row per person. The id is the same id Supabase Auth uses, so
-- auth.uid() inside a policy matches members.id directly.
-- ----------------------------------------------------------------------------
create table members (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text not null,
  display_name  text,
  handle        text unique,
  student_id    text not null unique,
  year_of_study int,
  bio           text,
  avatar_url    text,
  status        member_status not null default 'pending',
  is_admin      boolean not null default false,
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint members_bio_length check (char_length(bio) <= 300)
);

create index members_status_idx on members (status);
create index members_handle_idx on members (handle);

create trigger members_touch before update on members
  for each row execute function app.touch_updated_at();


-- ----------------------------------------------------------------------------
-- member_domains — which domain someone is in, and whether they mentor there.
-- Being a mentor is per domain, not global. Every mentor policy reads this.
-- ----------------------------------------------------------------------------
create table member_domains (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references members(id) on delete cascade,
  domain_id   uuid not null references domains(id) on delete restrict,
  role        domain_role not null default 'member',
  is_primary  boolean not null default false,
  joined_at   timestamptz not null default now(),
  unique (member_id, domain_id)
);

create index member_domains_member_idx on member_domains (member_id);
create index member_domains_domain_idx on member_domains (domain_id);

-- A member has exactly one primary domain. A partial unique index is the
-- cheapest way to say that.
create unique index member_domains_one_primary
  on member_domains (member_id) where is_primary;


-- ----------------------------------------------------------------------------
-- applications — a verified sign-up waiting for an admin decision. Approval is
-- the only thing that turns a member's status to 'active'.
-- ----------------------------------------------------------------------------
create table applications (
  id                  uuid primary key default gen_random_uuid(),
  member_id           uuid not null references members(id) on delete cascade,
  requested_domain_id uuid references domains(id) on delete set null,
  motivation          text,
  status              application_status not null default 'pending',
  decided_by          uuid references members(id) on delete set null,
  decided_at          timestamptz,
  decision_reason     text,
  created_at          timestamptz not null default now()
);

create index applications_member_idx on applications (member_id);
create index applications_status_idx on applications (status);


-- ----------------------------------------------------------------------------
-- Helper functions used by the policies below.
--
-- These come AFTER the tables on purpose: PostgreSQL checks a SQL function's
-- body when the function is created, so a helper that queries members cannot
-- be defined before members exists.
--
-- Each one is `security definer`, meaning it runs with the owner's rights. That
-- is what lets a policy check a table the caller cannot read. It also makes an
-- unguarded function a back door, which is why execute is revoked from the
-- client roles at the end.
-- ----------------------------------------------------------------------------
create or replace function app.is_active_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where id = auth.uid() and status = 'active');
$$;

create or replace function app.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from members where id = auth.uid() and status = 'active' and is_admin
  );
$$;

create or replace function app.is_mentor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from member_domains where member_id = auth.uid() and role = 'mentor'
  );
$$;

create or replace function app.is_mentor_of(p_domain uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from member_domains
     where member_id = auth.uid() and domain_id = p_domain and role = 'mentor'
  );
$$;

-- True when the caller mentors a domain that this member belongs to.
create or replace function app.is_mentor_of_member(p_member uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from member_domains mine
      join member_domains theirs on theirs.domain_id = mine.domain_id
     where mine.member_id = auth.uid()
       and mine.role = 'mentor'
       and theirs.member_id = p_member
  );
$$;

revoke execute on function app.is_active_member()          from anon, authenticated;
revoke execute on function app.is_admin()                  from anon, authenticated;
revoke execute on function app.is_mentor()                 from anon, authenticated;
revoke execute on function app.is_mentor_of(uuid)          from anon, authenticated;
revoke execute on function app.is_mentor_of_member(uuid)   from anon, authenticated;


-- ----------------------------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------------------------
alter table domains enable row level security;
create policy domains_select on domains
  for select using (app.is_active_member());

alter table members enable row level security;
-- You can always read yourself. Other members are visible to active members.
create policy members_select on members
  for select using (id = auth.uid() or app.is_active_member() or app.is_admin());

alter table member_domains enable row level security;
create policy member_domains_select on member_domains
  for select using (app.is_active_member());

alter table applications enable row level security;
-- Your own application, or any application if you are an admin.
create policy applications_select on applications
  for select using (member_id = auth.uid() or app.is_admin());


-- ----------------------------------------------------------------------------
-- Seed: the three domains.
-- ----------------------------------------------------------------------------
insert into domains (slug, name, description, position) values
  ('code_crafters', 'Code Crafters',
   'Web and mobile application development.', 1),
  ('cyber_security', 'Cyber Security',
   'Security fundamentals, tooling and defensive practice.', 2),
  ('data_science', 'Data Science',
   'Data analysis, visualisation and machine learning.', 3);
