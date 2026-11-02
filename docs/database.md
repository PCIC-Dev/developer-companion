# Database

## Migrations are the only way to change the schema

Every schema change — tables, columns, indexes, constraints, policies, functions,
triggers, seed-role grants — is a new timestamped SQL file in
[`supabase/migrations/`](../supabase/migrations/), applied in order by the Supabase
CLI. To change the schema, add a migration and run `supabase db reset` (or
`supabase db push` against a remote).

**Hand-editing the database is never acceptable.** Do not alter schema through
Supabase Studio, `psql`, the SQL editor, or any other direct connection. Manual
edits are invisible to code review, are not reproducible, do not survive a
`supabase db reset`, and drift from what every other developer and production run.
If a change is not in a migration, it does not exist.

## Local workflow

```bash
supabase start      # bring up the local stack (Postgres on port 54322)
supabase db reset   # drop, recreate, and re-apply every migration + seed
```

A clean `supabase db reset` must apply all migrations with no errors before any
change is committed.
