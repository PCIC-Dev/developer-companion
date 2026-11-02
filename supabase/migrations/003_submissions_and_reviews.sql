-- ============================================================================
-- Migration 3 of 4 — Submissions and mentor review
--
-- This is the loop the whole product exists for: a member starts a project,
-- submits a repository, a mentor claims it and scores it against the rubric,
-- and the member gets specific feedback back.
--
-- Note what is NOT here: GitHub verification, automated checks on the repo,
-- and screenshot uploads. For the MVP a repository URL is a text field that a
-- mentor opens. Those checks are the first thing to add afterwards.
-- ============================================================================

create type attempt_status    as enum ('in_progress', 'submitted', 'changes_requested', 'approved');
create type submission_status as enum ('submitted', 'in_review', 'changes_requested', 'approved', 'rejected');
create type review_outcome    as enum ('approved', 'changes_requested', 'rejected');


-- ----------------------------------------------------------------------------
-- project_attempts — a member starting a project. One attempt per member per
-- project; a resubmission adds a submission row, not a new attempt.
-- ----------------------------------------------------------------------------
create table project_attempts (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references members(id) on delete cascade,
  project_id   uuid not null references projects(id) on delete cascade,
  status       attempt_status not null default 'in_progress',
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  unique (member_id, project_id)
);

create index project_attempts_member_idx  on project_attempts (member_id);
create index project_attempts_project_idx on project_attempts (project_id);


-- ----------------------------------------------------------------------------
-- submissions — one submitted version of a project.
--
-- A resubmission inserts a NEW row with attempt_number + 1. Rows are never
-- edited after review, so a member can look back at what they sent and what
-- the mentor asked for.
--
-- The claim fields sit here rather than in a separate table: claiming is just
-- a mentor putting their name on a row. claimed_until lets an abandoned claim
-- return to the queue.
-- ----------------------------------------------------------------------------
create table submissions (
  id             uuid primary key default gen_random_uuid(),
  attempt_id     uuid not null references project_attempts(id) on delete cascade,
  member_id      uuid not null references members(id) on delete cascade,
  attempt_number int not null default 1,
  status         submission_status not null default 'submitted',
  repo_url       text not null,
  demo_url       text,
  summary        text,
  hours_spent    numeric,
  claimed_by     uuid references members(id) on delete set null,
  claimed_at     timestamptz,
  claimed_until  timestamptz,
  submitted_at   timestamptz not null default now(),
  unique (attempt_id, attempt_number)
);

create index submissions_member_idx on submissions (member_id);
create index submissions_status_idx on submissions (status);
-- The review queue reads this: unclaimed submissions, oldest first.
create index submissions_queue_idx  on submissions (status, submitted_at)
  where status in ('submitted', 'in_review');


-- ----------------------------------------------------------------------------
-- reviews — a mentor's verdict on one submission.
--
-- is_draft covers the mentor autosaving as they work. A draft review is never
-- shown to the member; half-written feedback is worse than none.
-- ----------------------------------------------------------------------------
create table reviews (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  reviewer_id   uuid not null references members(id) on delete restrict,
  outcome       review_outcome,
  total_score   numeric,
  strengths     text,
  improvements  text,
  is_draft      boolean not null default true,
  submitted_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index reviews_submission_idx on reviews (submission_id);
create index reviews_reviewer_idx   on reviews (reviewer_id);

-- A submitted review must say something useful. Enforcing the minimum here
-- means it holds however the row was written.
alter table reviews add constraint reviews_feedback_required check (
  is_draft
  or (strengths is not null and length(trim(strengths)) > 0
      and improvements is not null and length(trim(improvements)) > 0)
);


-- ----------------------------------------------------------------------------
-- review_scores — the per-criterion breakdown the member sees.
-- ----------------------------------------------------------------------------
create table review_scores (
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null references reviews(id) on delete cascade,
  criterion_id uuid not null references rubric_criteria(id) on delete restrict,
  score        int not null check (score between 0 and 4),
  comment      text,
  unique (review_id, criterion_id)
);

create index review_scores_review_idx on review_scores (review_id);


-- ----------------------------------------------------------------------------
-- A mentor can never review their own submission. The API should stop this at
-- claim time, but a trigger means it holds even if that check is missed.
-- ----------------------------------------------------------------------------
create or replace function app.block_self_review() returns trigger
language plpgsql set search_path = public as $$
begin
  if exists (
    select 1 from submissions s
     where s.id = new.submission_id and s.member_id = new.reviewer_id
  ) then
    raise exception 'a member cannot review their own submission';
  end if;
  return new;
end $$;

create trigger reviews_no_self_review before insert or update on reviews
  for each row execute function app.block_self_review();


-- ----------------------------------------------------------------------------
-- Ownership helpers.
--
-- submission_assets-style child tables have no member_id of their own, so
-- "can this person see it?" is answered through the parent row rather than by
-- copying member_id onto every table.
-- ----------------------------------------------------------------------------
create or replace function app.can_see_submission(p_submission uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from submissions s
     where s.id = p_submission
       and (s.member_id = auth.uid()
            or app.is_mentor_of_member(s.member_id)
            or app.is_admin())
  );
$$;

create or replace function app.can_see_review(p_review uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from reviews r join submissions s on s.id = r.submission_id
     where r.id = p_review
       and (app.is_mentor_of_member(s.member_id)
            or app.is_admin()
            or (s.member_id = auth.uid() and not r.is_draft))
  );
$$;

revoke execute on function app.can_see_submission(uuid) from anon, authenticated;
revoke execute on function app.can_see_review(uuid)     from anon, authenticated;


-- ----------------------------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------------------------
alter table project_attempts enable row level security;
create policy project_attempts_select on project_attempts
  for select using (
    member_id = auth.uid() or app.is_mentor_of_member(member_id) or app.is_admin()
  );

alter table submissions enable row level security;
create policy submissions_select on submissions
  for select using (
    member_id = auth.uid() or app.is_mentor_of_member(member_id) or app.is_admin()
  );

alter table reviews enable row level security;
-- The member sees the review once it is submitted. Mentors see it any time.
create policy reviews_select on reviews
  for select using (
    app.can_see_submission(submission_id)
    and (not is_draft or app.is_mentor() or app.is_admin())
  );

alter table review_scores enable row level security;
create policy review_scores_select on review_scores
  for select using (app.can_see_review(review_id));
