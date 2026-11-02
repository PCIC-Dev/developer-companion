-- ============================================================================
-- Migration 4 of 4 — XP, levels, leaderboard and notifications
--
-- The leaderboard is only motivating if members believe it. One person finding
-- out they can give themselves points ends that, and word travels faster than
-- the fix. So xp_ledger is locked harder than anything else in the schema:
-- RLS is on with NO policies, and the client roles have their grants revoked.
-- A browser holding a perfectly valid member token cannot read or write a row.
--
-- Members still see totals, through the member_xp view at the bottom. A view
-- runs with its owner's rights, so it can read a table the viewer cannot.
-- ============================================================================

create type xp_source as enum ('milestone', 'project', 'adjustment');


-- ----------------------------------------------------------------------------
-- levels — XP thresholds per domain. A table rather than constants in code, so
-- an admin can retune them without a deploy.
-- ----------------------------------------------------------------------------
create table levels (
  id        uuid primary key default gen_random_uuid(),
  domain_id uuid not null references domains(id) on delete cascade,
  level     int not null,
  min_xp    int not null,
  name      text,
  unique (domain_id, level)
);


-- ----------------------------------------------------------------------------
-- xp_ledger — every point ever awarded, append-only.
--
-- The unique constraint is the important line in this file. It means one event
-- can award at most once, no matter how many times a request is retried or a
-- button is double-clicked. Without it, a flaky connection quietly inflates
-- somebody's score.
--
-- Corrections are negative rows, never edits or deletes, so a member's total
-- can always be explained.
-- ----------------------------------------------------------------------------
create table xp_ledger (
  id          bigint generated always as identity primary key,
  member_id   uuid not null references members(id) on delete cascade,
  domain_id   uuid references domains(id) on delete set null,
  source_type xp_source not null,
  source_id   uuid,
  amount      int not null,
  reason      text,
  awarded_by  uuid references members(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (member_id, source_type, source_id)
);

create index xp_ledger_member_idx  on xp_ledger (member_id);
create index xp_ledger_domain_idx  on xp_ledger (domain_id);
create index xp_ledger_created_idx on xp_ledger (created_at);


-- ----------------------------------------------------------------------------
-- notifications — in-app queue. Email is sent by the API from the same rows.
--
-- dedupe_key stops a retried job notifying the same person twice about the
-- same thing.
-- ----------------------------------------------------------------------------
create table notifications (
  id         bigint generated always as identity primary key,
  member_id  uuid not null references members(id) on delete cascade,
  event_type text not null,
  title      text not null,
  body       text,
  link       text,
  dedupe_key text,
  read_at    timestamptz,
  created_at timestamptz not null default now(),
  unique (member_id, dedupe_key)
);

create index notifications_member_idx on notifications (member_id, created_at desc);


-- ----------------------------------------------------------------------------
-- Approving a submission.
--
-- Everything below happens together or not at all. The dangerous version is
-- two separate calls — mark approved, then award XP. If the connection drops
-- between them you get an approved project with no points, nobody is told,
-- and it surfaces weeks later as a confused member.
--
-- Called only by the API with the service_role key.
-- ----------------------------------------------------------------------------
create or replace function app.approve_submission(
  p_submission_id uuid,
  p_reviewer_id   uuid
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_member    uuid;
  v_attempt   uuid;
  v_project   uuid;
  v_milestone uuid;
  v_domain    uuid;
  v_xp        int;
begin
  -- Claim the row and read what we need in one statement.
  update submissions
     set status = 'approved'
   where id = p_submission_id
     and status in ('submitted', 'in_review')
   returning member_id, attempt_id into v_member, v_attempt;

  if v_member is null then
    raise exception 'submission % is not awaiting review', p_submission_id;
  end if;

  if v_member = p_reviewer_id then
    raise exception 'a member cannot approve their own submission';
  end if;

  update project_attempts
     set status = 'approved', completed_at = now()
   where id = v_attempt
   returning project_id into v_project;

  select p.milestone_id, p.xp_value, t.domain_id
    into v_milestone, v_xp, v_domain
    from projects p
    join milestones m on m.id = p.milestone_id
    join tracks t     on t.id = m.track_id
   where p.id = v_project;

  -- The milestone this project belongs to is now complete.
  insert into milestone_progress (member_id, milestone_id, status, completed_at)
  values (v_member, v_milestone, 'complete', now())
  on conflict (member_id, milestone_id)
  do update set status = 'complete', completed_at = now();

  -- Award the XP. on conflict do nothing makes a retry harmless.
  insert into xp_ledger (member_id, domain_id, source_type, source_id, amount)
  values (v_member, v_domain, 'project', p_submission_id, coalesce(v_xp, 0))
  on conflict (member_id, source_type, source_id) do nothing;

  insert into notifications (member_id, event_type, title, body, link, dedupe_key)
  values (v_member, 'review.approved', 'Your project was approved',
          'A mentor reviewed your submission and approved it.',
          '/submissions/' || p_submission_id::text,
          'review.approved:' || p_submission_id::text)
  on conflict (member_id, dedupe_key) do nothing;
end $$;

-- security definer functions are a back door if left callable.
revoke execute on function app.approve_submission(uuid, uuid) from anon, authenticated;


-- ----------------------------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------------------------
alter table levels enable row level security;
create policy levels_select on levels
  for select using (app.is_active_member());

alter table notifications enable row level security;
create policy notifications_select on notifications
  for select using (member_id = auth.uid());

-- xp_ledger gets RLS with NO policies at all. Default-deny means no client can
-- touch it. The revokes are a second lock, in case someone later adds a policy
-- by mistake.
alter table xp_ledger enable row level security;
revoke select, insert, update, delete on xp_ledger from anon, authenticated;


-- ----------------------------------------------------------------------------
-- member_xp — totals and level per member per domain.
--
-- This is how the leaderboard and the profile read XP without being able to
-- read the ledger itself.
-- ----------------------------------------------------------------------------
create view member_xp as
select
  t.member_id,
  t.domain_id,
  t.total_xp,
  coalesce(
    (select max(l.level) from levels l
      where l.domain_id = t.domain_id and l.min_xp <= t.total_xp), 1
  ) as level
from (
  select member_id, domain_id, sum(amount)::int as total_xp
    from xp_ledger
   group by member_id, domain_id
) t;

grant select on member_xp to authenticated;


-- ----------------------------------------------------------------------------
-- Seed: a starting level ladder for every domain. Admins can retune these.
-- ----------------------------------------------------------------------------
insert into levels (domain_id, level, min_xp, name)
select d.id, v.level, v.min_xp, v.name
  from domains d
 cross join (values
   (1,    0, 'Newcomer'),
   (2,  100, 'Builder'),
   (3,  300, 'Practitioner'),
   (4,  700, 'Craftsman'),
   (5, 1200, 'Peak')
 ) as v(level, min_xp, name);
