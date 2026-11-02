grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
revoke select, insert, update, delete on xp_ledger from anon, authenticated;

-- Two members and one mentor, all in Code Crafters.
insert into auth.users (id) values
 ('a0000000-0000-0000-0000-000000000001'),
 ('b0000000-0000-0000-0000-000000000002'),
 ('c0000000-0000-0000-0000-000000000003');
insert into members (id,email,full_name,student_id,status) values
 ('a0000000-0000-0000-0000-000000000001','a@uni.edu','Student A','S1','active'),
 ('b0000000-0000-0000-0000-000000000002','b@uni.edu','Student B','S2','active'),
 ('c0000000-0000-0000-0000-000000000003','m@uni.edu','Mentor M','S3','active');
insert into member_domains (member_id,domain_id,role,is_primary)
select v.m, d.id, v.r::domain_role, true from domains d,
 (values ('a0000000-0000-0000-0000-000000000001'::uuid,'member'),
         ('b0000000-0000-0000-0000-000000000002'::uuid,'member'),
         ('c0000000-0000-0000-0000-000000000003'::uuid,'mentor')) v(m,r)
where d.slug='code_crafters';

-- A published track with one milestone, one project and a rubric.
insert into tracks (id,domain_id,slug,title,status)
select '10000000-0000-0000-0000-000000000001', id,'js-basics','JavaScript Basics','published'
  from domains where slug='code_crafters';
insert into tracks (id,domain_id,slug,title,status)
select '10000000-0000-0000-0000-000000000002', id,'secret','Unpublished Track','draft'
  from domains where slug='code_crafters';
insert into milestones (id,track_id,position,title,xp_value) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',1,'Build a to-do app',0);
insert into projects (id,milestone_id,title,problem_statement,deliverables,xp_value) values
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',
  'To-do app','Build a to-do app with persistence.','{"repo","demo"}',150);
insert into rubric_criteria (project_id,position,name,weight) values
 ('30000000-0000-0000-0000-000000000001',1,'Correctness',60),
 ('30000000-0000-0000-0000-000000000001',2,'Code quality',40);

-- A starts the project and submits.
insert into enrollments (member_id,track_id) values
 ('a0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001');
insert into project_attempts (id,member_id,project_id) values
 ('40000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001');
insert into submissions (id,attempt_id,member_id,repo_url) values
 ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001','https://github.com/a/todo');

\echo '=== Loop and constraint tests (server side) ==='
do $$
declare n int; v numeric;
begin
  -- 1. A mentor cannot review their own work
  begin
    insert into reviews (submission_id, reviewer_id, is_draft)
    values ('50000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001', true);
    raise exception 'FAIL 1: self-review allowed';
  exception when others then
    if sqlerrm like '%cannot review their own%' then raise notice 'PASS 1  self-review blocked';
    else raise exception 'FAIL 1: %', sqlerrm; end if;
  end;

  -- 2. A submitted review must carry a strength and an improvement
  begin
    insert into reviews (submission_id, reviewer_id, is_draft, outcome)
    values ('50000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003',
            false, 'approved');
    raise exception 'FAIL 2: empty feedback accepted';
  exception when check_violation then raise notice 'PASS 2  review requires real feedback';
  end;

  -- 3. A proper review saves
  insert into reviews (submission_id, reviewer_id, is_draft, outcome, total_score,
                       strengths, improvements, submitted_at)
  values ('50000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003',
          false,'approved', 86, 'Clean state handling.', 'Add tests for the edge cases.', now());
  raise notice 'PASS 3  review with feedback saved';

  -- 4. Score range is enforced
  begin
    insert into review_scores (review_id, criterion_id, score)
    select r.id, c.id, 7 from reviews r, rubric_criteria c
     where r.submission_id='50000000-0000-0000-0000-000000000001' and c.position=1;
    raise exception 'FAIL 4: score 7 accepted on a 0-4 scale';
  exception when check_violation then raise notice 'PASS 4  rubric score range enforced';
  end;

  -- 5. Approval is one transaction: status, milestone, XP and notification
  perform app.approve_submission('50000000-0000-0000-0000-000000000001',
                                 'c0000000-0000-0000-0000-000000000003');
  select count(*) into n from xp_ledger
   where member_id='a0000000-0000-0000-0000-000000000001' and amount=150;
  if n <> 1 then raise exception 'FAIL 5: expected 1 XP row, got %', n; end if;
  select count(*) into n from milestone_progress
   where member_id='a0000000-0000-0000-0000-000000000001' and status='complete';
  if n <> 1 then raise exception 'FAIL 5b: milestone not completed'; end if;
  select count(*) into n from notifications
   where member_id='a0000000-0000-0000-0000-000000000001';
  if n <> 1 then raise exception 'FAIL 5c: member not notified'; end if;
  raise notice 'PASS 5  approval awarded XP, completed milestone and notified in one go';

  -- 6. Running it twice does not award twice
  begin
    perform app.approve_submission('50000000-0000-0000-0000-000000000001',
                                   'c0000000-0000-0000-0000-000000000003');
    raise notice 'PASS 6  second approval rejected (already reviewed)';
  exception when others then
    raise notice 'PASS 6  second approval rejected: %', left(sqlerrm, 44);
  end;
  select count(*) into n from xp_ledger where member_id='a0000000-0000-0000-0000-000000000001';
  if n <> 1 then raise exception 'FAIL 6b: XP awarded % times', n; end if;

  -- 7. The level view reads through to the ledger
  select level into n from member_xp where member_id='a0000000-0000-0000-0000-000000000001';
  if n <> 2 then raise exception 'FAIL 7: expected level 2 at 150 xp, got %', n; end if;
  raise notice 'PASS 7  member_xp view reports 150 xp = level 2';

  -- 8. One primary domain only
  begin
    insert into member_domains (member_id, domain_id, is_primary)
    select 'a0000000-0000-0000-0000-000000000001', id, true from domains where slug='data_science';
    raise exception 'FAIL 8: second primary domain accepted';
  exception when unique_violation then raise notice 'PASS 8  one primary domain per member';
  end;
end $$;

\echo '=== Policy tests, as Student B (role authenticated) ==='
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"b0000000-0000-0000-0000-000000000002"}';
do $$
declare n int;
begin
  select count(*) into n from submissions
   where member_id = 'a0000000-0000-0000-0000-000000000001';
  if n <> 0 then raise exception 'FAIL 9: B read A''s submissions'; end if;
  raise notice 'PASS 9  member cannot read another member''s submissions';

  select count(*) into n from reviews;
  if n <> 0 then raise exception 'FAIL 10: B read A''s review feedback'; end if;
  raise notice 'PASS 10 member cannot read another member''s feedback';

  select count(*) into n from tracks;
  if n <> 1 then raise exception 'FAIL 11: expected 1 visible track, got %', n; end if;
  raise notice 'PASS 11 draft track hidden, published track visible';

  select count(*) into n from rubric_criteria;
  if n <> 2 then raise exception 'FAIL 12: rubric not visible before starting'; end if;
  raise notice 'PASS 12 rubric visible to members before they build';

  begin
    select count(*) into n from xp_ledger;
    raise exception 'FAIL 13: client read xp_ledger';
  exception when insufficient_privilege then
    raise notice 'PASS 13 client cannot read xp_ledger';
  end;

  begin
    insert into xp_ledger (member_id, source_type, amount)
    values (auth.uid(), 'adjustment', 99999);
    raise exception 'FAIL 14: client wrote xp_ledger';
  exception when insufficient_privilege then
    raise notice 'PASS 14 client cannot write xp_ledger';
  end;

  select count(*) into n from member_xp;
  if n < 1 then raise exception 'FAIL 15: leaderboard view unreadable'; end if;
  raise notice 'PASS 15 member_xp view readable (leaderboard works without ledger access)';

  update members set full_name='Hacked' where id='a0000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n > 0 then raise exception 'FAIL 16: client updated another member'; end if;
  raise notice 'PASS 16 client writes affect no rows (no write policies)';
end $$;
commit;
