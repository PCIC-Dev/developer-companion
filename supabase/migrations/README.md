# Migrations

Migrations are the **only** way to change the database schema. Every change —
tables, columns, indexes, policies, functions — is a new timestamped SQL file in
this directory, applied in order.

**Never hand-edit the database** (via Studio, `psql`, or anything else). Manual
edits are not reproducible, do not survive a `supabase db reset`, and drift from
what every other developer and production run. If a change is not in a
migration, it does not exist.
