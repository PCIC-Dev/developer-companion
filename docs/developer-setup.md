# Developer Setup Guide

A step-by-step walkthrough for getting the **PCIC Developer Companion** running on a
fresh machine — from zero to the web app, the API, and a seeded local database, with
every command explained.

Follow the steps **in order**. Each one builds on the previous. If you get stuck, jump to
[Troubleshooting](#troubleshooting) at the bottom.

> This guide is the long-form companion to the quick setup in the root
> [`README.md`](../README.md). If you already know the stack, the README version is
> faster. If this is your first time, read this one.

---

## What you'll have when you're done

- A local **Supabase** stack (Postgres + Auth + Storage) running in Docker, with the full
  schema applied from migrations and seeded with starter data.
- The **Express API** (`apps/api`) running on <http://localhost:4000>.
- The **Next.js web app** (`apps/web`) running on <http://localhost:3000>.
- A working `pnpm check` gate (lint, type-check, build, tests) — the only thing standing
  between you and a clean push.

**Estimated time:** 20–40 minutes, mostly waiting on downloads the first time.

---

## How the system fits together

This is a **pnpm monorepo** with three workspaces:

| Workspace         | What it is                            | Key fact                                        |
| ----------------- | ------------------------------------- | ----------------------------------------------- |
| `apps/web`        | Next.js 16 (App Router) + Tailwind v4 | Holds the **anon** key only                     |
| `apps/api`        | Express 5 + TypeScript (`tsx` in dev) | Holds the **service_role** key; all writes here |
| `packages/shared` | `@pcic/shared` — zod schemas + types  | Shared by web and api so validation can't drift |

The database, Auth, and Storage are **not** in this repo's `docker-compose.yml` — they are
managed by the **Supabase CLI** (`supabase start`), which runs its own set of Docker
containers. There is deliberately only one Postgres, so local matches production.

### Ports you'll use

| Service                      | URL                      | Started by                              |
| ---------------------------- | ------------------------ | --------------------------------------- |
| Web app                      | <http://localhost:3000>  | `pnpm --filter web dev`                 |
| API                          | <http://localhost:4000>  | API container / `pnpm --filter api dev` |
| Supabase API gateway         | <http://127.0.0.1:54321> | `supabase start`                        |
| Supabase Postgres            | `127.0.0.1:54322`        | `supabase start`                        |
| Supabase Studio (DB GUI)     | <http://localhost:54323> | `supabase start`                        |
| Inbucket/Mailpit (test mail) | <http://localhost:54324> | `supabase start`                        |

---

## Step 0 — Install the prerequisites

You only need **three** things installed globally. Node and pnpm come from the repo
itself in later steps.

### Git

- **macOS:** `xcode-select --install`, or `brew install git`
- **Windows:** <https://git-scm.com/download/win> (use Git Bash for the commands below)
- **Linux:** `sudo apt install git` (Debian/Ubuntu) or your distro's equivalent

Verify:

```bash
git --version
```

### nvm (Node Version Manager)

We pin Node with `.nvmrc`, so install Node **through nvm** rather than directly.

- **macOS / Linux:** follow <https://github.com/nvm-sh/nvm#installing-and-updating>,
  then restart your terminal.
- **Windows:** use <https://github.com/coreybutler/nvm-windows> (commands are the same
  shape; run in a regular terminal, not Git Bash, for nvm-windows).

Verify:

```bash
nvm --version
```

### Docker Desktop

Supabase's local stack and the API container both need Docker.

- Download: <https://www.docker.com/products/docker-desktop>
- **Launch it and wait until the whale icon says "Docker Desktop is running."**
  Nothing in the later steps works until the Docker daemon is up.

Verify (should print without error):

```bash
docker info
```

> **Network note:** the first run downloads ~1–2 GB of Docker images and ~550 MB of npm
> packages. Use stable Wi-Fi — a phone hotspot often causes DNS timeouts mid-download.
> Everything is cached after the first success, so a failed download just needs a re-run
> on a better connection.

---

## Step 1 — Clone the repository

```bash
git clone <repo-url>
cd developer-companion
```

All commands from here on are run from the repository root unless stated otherwise.

---

## Step 2 — Select the pinned Node version

The repo pins Node **24** in `.nvmrc`. Install and switch to it:

```bash
nvm install   # reads .nvmrc, installs Node 24 if you don't have it
nvm use       # switches the current shell to Node 24
```

Verify:

```bash
node --version   # → v24.x.x
```

> You must run `nvm use` in **each new terminal** (or set up nvm's auto-switch). If
> commands later complain about Node version, this is usually why.

---

## Step 3 — Enable pnpm via Corepack

The package manager is pinned to **pnpm 12.15.0** in `package.json`. Corepack ships with
Node and makes the `pnpm` command resolve to exactly that version — no separate install.

```bash
corepack enable
```

Verify:

```bash
pnpm --version   # → 12.15.0
```

---

## Step 4 — Install dependencies

```bash
pnpm install
```

What this does:

- Installs all workspace dependencies (web, api, shared) into a single linked store.
- Downloads ~550 MB on first run.
- Installs the **Husky pre-commit hook** automatically (via the `prepare` script), which
  runs `lint-staged` on your staged files before each commit.

It should finish without prompting you to approve builds (`esbuild` is pre-approved in
`pnpm-workspace.yaml`).

---

## Step 5 — Start the Supabase stack

This launches local Postgres, Auth, and Storage in Docker and applies every migration.

```bash
pnpm exec supabase start
```

The **first** run pulls the Supabase Docker images (slow, cached afterward). When it
finishes it prints your local credentials. You can reprint them any time:

```bash
pnpm exec supabase status
```

From that output you'll need two values in the next step:

- **anon key** — public, safe for the browser.
- **service_role key** — **secret**, bypasses all row-level security, server-only.

> **Why the CLI and not `docker compose`?** The repo's `docker-compose.yml` starts the
> API **only**. The database is managed by the Supabase CLI so that local and production
> share one Postgres with identical behaviour. Do not add a second Postgres.

---

## Step 6 — Apply the schema (migrations)

`supabase start` already applies migrations on first boot, but run an explicit reset to
confirm a clean apply and to re-seed:

```bash
pnpm exec supabase db reset
```

You should see each migration applied in order with no errors, ending with
`Reset local database.`

> **Migrations are the only way to change the schema.** Never hand-edit the database
> through Studio, `psql`, or the SQL editor — those changes don't survive a reset and
> drift from everyone else. See [`database.md`](database.md) and
> [`../supabase/migrations/README.md`](../supabase/migrations/README.md).

---

## Step 7 — Create the two environment files

Both files are git-ignored. **Never commit them.** Paste the keys from
`supabase status` (Step 5).

### `apps/web/.env.local` — web holds the **anon key only**

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from `supabase status`>
```

### `apps/api/.env` — API holds the **service_role key** (and nowhere else)

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
# Host dev uses 127.0.0.1. Inside the API container use http://host.docker.internal:54321
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role key from `supabase status`>
```

> **Architecture rule #2, enforced by a script:** the `service_role` key may live only in
> `apps/api`. `scripts/check-keys.sh` fails the build if a `SERVICE_ROLE` reference shows
> up anywhere under `apps/web`. The web app only ever holds the anon key.

---

## Step 8 — Start the API

Pick one. On the host (fastest feedback):

```bash
pnpm --filter api dev          # tsx watch, hot reload on save
```

…or in its container (production-parity):

```bash
docker compose up -d --build api
```

> If you run the API **in the container**, change its `SUPABASE_URL` in `apps/api/.env` to
> `http://host.docker.internal:54321`, because `127.0.0.1` inside a container points at
> the container itself, not your host.

Verify it's up:

```bash
curl http://localhost:4000/api/v1/health
# → {"status":"ok"}
```

---

## Step 9 — Start the web app

The web app always runs on the **host** (not Docker) for fast hot-module reload:

```bash
pnpm --filter web dev          # → http://localhost:3000
```

Open <http://localhost:3000>. You should see
**"PCIC Developer Companion — scaffold is running."**

---

## One-command backend (optional shortcut)

Once the env files exist, you can bring the whole backend up with:

```bash
pnpm dev
```

This runs `scripts/dev.sh`: it starts Supabase, builds and starts the API container, then
prints the command to start the web app. Web still runs separately on the host.

---

## Final verification checklist

- [ ] `docker info` succeeds (Docker is running)
- [ ] `node --version` → v24.x
- [ ] `pnpm --version` → 12.15.0
- [ ] `pnpm exec supabase status` prints URLs and keys
- [ ] `pnpm exec supabase db reset` applies all migrations with no errors
- [ ] `apps/web/.env.local` and `apps/api/.env` exist and are **not** committed
- [ ] `curl http://localhost:4000/api/v1/health` → `{"status":"ok"}`
- [ ] <http://localhost:3000> shows the scaffold page
- [ ] `pnpm check` passes end to end (see below)

---

## The `pnpm check` gate

There is **no CI pipeline** — `pnpm check` is the only gate, so run it before every push:

```bash
pnpm check
```

It runs, in order, and stops at the first failure:

1. `check:keys` — the service_role key guard (`scripts/check-keys.sh`)
2. `lint` — ESLint across the repo
3. `typecheck` — `tsc --noEmit` in every workspace
4. `build` — builds every workspace
5. `test` — Vitest (passes with no tests)

Handy fixers while developing:

```bash
pnpm lint:fix        # auto-fix lint issues
pnpm format          # Prettier write
```

---

## Daily workflow

```bash
nvm use                     # Node 24 in this shell
pnpm dev                    # backend up (Supabase + API)
pnpm --filter web dev       # web up (separate terminal)

# ...code...

pnpm check                  # MUST pass before pushing
```

Shutting down:

```bash
docker compose down         # stop the API container (if you used it)
pnpm exec supabase stop     # stop Supabase (Postgres/Auth/Storage)
```

Your committing flow is guarded automatically: the Husky pre-commit hook runs
`lint-staged`, which lints and formats only your staged files.

---

## Changing the database later

Every schema change is a new timestamped migration in `supabase/migrations/`, applied by
the CLI — never a manual edit. To make a change:

1. Add a new migration file (or `pnpm exec supabase migration new <name>`).
2. `pnpm exec supabase db reset` to apply it cleanly from scratch.
3. If you touched row-level security, run the RLS test suite:

   ```bash
   docker exec -i supabase_db_developer-companion \
     psql -U postgres -d postgres < supabase/tests_rls.sql
   ```

   Every assertion should print `PASS`.

See [`database.md`](database.md) for the full policy.

---

## Troubleshooting

**`Cannot connect to the Docker daemon` / `supabase start` fails immediately**
Docker Desktop isn't running. Launch it, wait until it reports "running," then retry.

**Image pulls fail with DNS / `i/o timeout` / `no such host`**
Flaky network (common on phone hotspots). The download resumes from cache, so just re-run
`pnpm exec supabase start` on a stable connection until it completes.

**`pnpm install` stalls or errors mid-download**
Same cause — connection dropped. Re-run it; pnpm resumes from its store cache.

**Port already in use (3000 / 4000 / 54321–54324)**
Stop strays: `pnpm exec supabase stop`, `docker compose down`, and kill any leftover dev
server on 3000/4000.

**Key guard fails (`found a service_role reference under 'apps/web'`)**
You referenced `SUPABASE_SERVICE_ROLE_KEY` (or anything matching `SERVICE_ROLE`) somewhere
under `apps/web`. Move it to `apps/api`; the web app may only hold the anon key.

**API can't reach Supabase from inside the container**
You're using `127.0.0.1` inside the container. Set
`SUPABASE_URL=http://host.docker.internal:54321` in `apps/api/.env`.

**`curl .../health` returns a 404 HTML page instead of `{"status":"ok"}`**
Something other than the current API build is answering on port 4000 (e.g. a stale
container). Run `docker compose down`, then start the API fresh.

**Node version complaints**
Run `nvm use` in the current terminal — it doesn't persist across new shells by default.
