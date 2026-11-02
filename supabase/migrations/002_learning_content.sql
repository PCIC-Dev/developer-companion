-- ============================================================================
-- Migration 2 of 4 — Learning content and enrolment
--
-- Mentors author tracks, milestones, projects and rubrics. Members browse
-- published tracks, enrol, and work through milestones.
--
-- A track is only visible to members once it is published. Drafts are hidden
-- in the database, not just in the interface, so an unfinished brief cannot
-- leak through the API.
-- ============================================================================

create type content_status    as enum ('draft', 'published', 'archived');
create type difficulty        as enum ('beginner', 'intermediate', 'advanced');
create type enrollment_status as enum ('active', 'withdrawn', 'completed');
create type progress_status   as enum ('locked', 'available', 'in_progress', 'submitted', 'complete');


-- ----------------------------------------------------------------------------
-- tracks — a learning path inside one domain.
-- ----------------------------------------------------------------------------
create table tracks (
  id              uuid primary key default gen_random_uuid(),
  domain_id       uuid not null references domains(id) on delete restrict,
  slug            text not null unique,
  title           text not null,
  summary         text,
  difficulty      difficulty not null default 'beginner',
  estimated_weeks int,
  status          content_status not null default 'draft',
  created_by      uuid references members(id) on delete set null,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index tracks_domain_idx on tracks (domain_id);
create index tracks_status_idx on tracks (status);

create trigger tracks_touch before update on tracks
  for each row execute function app.touch_updated_at();


-- ----------------------------------------------------------------------------
-- milestones — the ordered steps in a track.
--
-- position is numeric rather than int so a milestone can be dropped between
-- two others (1 and 2 leaves room for 1.5) without renumbering everything.
-- ----------------------------------------------------------------------------
create table milestones (
  id              uuid primary key default gen_random_uuid(),
  track_id        uuid not null references tracks(id) on delete cascade,
  position        numeric not null,
  title           text not null,
  objectives      text[],
  description     text,
  estimated_hours int,
  xp_value        int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index milestones_track_idx on milestones (track_id, position);

create trigger milestones_touch before update on milestones
  for each row execute function app.touch_updated_at();


-- ----------------------------------------------------------------------------
-- projects — the thing a member actually builds. At most one per milestone.
-- ----------------------------------------------------------------------------
create table projects (
  id                uuid primary key default gen_random_uuid(),
  milestone_id      uuid not null unique references milestones(id) on delete cascade,
  title             text not null,
  problem_statement text not null,
  deliverables      text[] not null default '{}',
  constraints       text[],
  estimated_hours   int,
  xp_value          int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger projects_touch before update on projects
  for each row execute function app.touch_updated_at();


-- ----------------------------------------------------------------------------
-- rubric_criteria — how a project is graded.
--
-- The rubric lives directly on the project rather than in its own reusable
-- table. That is a deliberate simplification: reusable, versioned rubrics are
-- worth building once the club has run a term, not before.
--
-- weight is a percentage. The API checks that a project's weights total 100
-- before the track can be published.
-- ----------------------------------------------------------------------------
create table rubric_criteria (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  position    int not null,
  name        text not null,
  description text,
  weight      numeric not null check (weight > 0 and weight <= 100),
  descriptors jsonb not null default '{}'::jsonb,   -- what 0,1,2,3,4 each mean
  unique (project_id, position)
);

create index rubric_criteria_project_idx on rubric_criteria (project_id);


-- ----------------------------------------------------------------------------
-- enrollments — a member taking a track. Withdrawing keeps progress, so
-- re-enrolling resumes instead of starting over.
-- ----------------------------------------------------------------------------
create table enrollments (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references members(id) on delete cascade,
  track_id     uuid not null references tracks(id) on delete cascade,
  status       enrollment_status not null default 'active',
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (member_id, track_id)
);

create index enrollments_member_idx on enrollments (member_id);
create index enrollments_track_idx  on enrollments (track_id);


-- ----------------------------------------------------------------------------
-- milestone_progress — where a member is in a track.
-- ----------------------------------------------------------------------------
create table milestone_progress (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references members(id) on delete cascade,
  milestone_id uuid not null references milestones(id) on delete cascade,
  status       progress_status not null default 'available',
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  unique (member_id, milestone_id)
);

create index milestone_progress_member_idx on milestone_progress (member_id);

create trigger milestone_progress_touch before update on milestone_progress
  for each row execute function app.touch_updated_at();


-- ----------------------------------------------------------------------------
-- Visibility helpers, defined now that the content tables exist.
-- ----------------------------------------------------------------------------
create or replace function app.track_is_published(p_track uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from tracks where id = p_track and status = 'published');
$$;

create or replace function app.milestone_is_published(p_milestone uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from milestones m join tracks t on t.id = m.track_id
     where m.id = p_milestone and t.status = 'published'
  );
$$;

create or replace function app.project_is_published(p_project uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from projects p
      join milestones m on m.id = p.milestone_id
      join tracks t     on t.id = m.track_id
     where p.id = p_project and t.status = 'published'
  );
$$;

revoke execute on function app.track_is_published(uuid)     from anon, authenticated;
revoke execute on function app.milestone_is_published(uuid) from anon, authenticated;
revoke execute on function app.project_is_published(uuid)   from anon, authenticated;


-- ----------------------------------------------------------------------------
-- Row-level security
--
-- Members see published content. Mentors and admins also see drafts, because
-- they are the ones writing them.
-- ----------------------------------------------------------------------------
alter table tracks enable row level security;
create policy tracks_select on tracks
  for select using (
    app.is_active_member()
    and (status = 'published' or app.is_mentor() or app.is_admin())
  );

alter table milestones enable row level security;
create policy milestones_select on milestones
  for select using (
    app.is_active_member()
    and (app.track_is_published(track_id) or app.is_mentor() or app.is_admin())
  );

alter table projects enable row level security;
create policy projects_select on projects
  for select using (
    app.is_active_member()
    and (app.milestone_is_published(milestone_id) or app.is_mentor() or app.is_admin())
  );

alter table rubric_criteria enable row level security;
-- Members must see the rubric before they start building, not after grading.
create policy rubric_criteria_select on rubric_criteria
  for select using (
    app.is_active_member()
    and (app.project_is_published(project_id) or app.is_mentor() or app.is_admin())
  );

alter table enrollments enable row level security;
create policy enrollments_select on enrollments
  for select using (
    member_id = auth.uid() or app.is_mentor_of_member(member_id) or app.is_admin()
  );

alter table milestone_progress enable row level security;
create policy milestone_progress_select on milestone_progress
  for select using (
    member_id = auth.uid() or app.is_mentor_of_member(member_id) or app.is_admin()
  );
