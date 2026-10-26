# Architecture

Four settled rules. The folder structure and client setup exist to make these
hard to break.

### 1. Reads go directly to Supabase; writes go through the API

Clients read from Supabase directly under row-level security (RLS), which keeps
reads fast and simple. All **writes** go through the Express API so that
authorization and invariants live in one auditable place. Exceptions that may
talk to Supabase directly from the client: the Auth SDK, Storage uploads, and
Realtime subscriptions.

### 2. The `service_role` key lives only in `apps/api`

The `service_role` key bypasses all RLS, so a single leak into the browser
bundle would expose every row. It is read in exactly one file
(`apps/api/src/lib/supabase.ts`, exported as `admin`). The web app holds only
the `anon` key. `scripts/check-keys.sh` fails the build if the key appears under
`apps/web`.

### 3. XP is written only by the server

XP is awarded by the server inside the **same transaction** as the event that
earned it, writing to a table no client can write to. This makes points
impossible to forge and impossible to leave in an inconsistent state if the
earning event half-fails.

### 4. RLS on every table, in the same migration

Row-level security is enabled on every table, and its policies are written in
the **same migration** that creates the table. A table is never allowed to exist
even briefly without the policies that govern who can see and change its rows.
