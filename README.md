# PCIC Developer Companion

A project-based learning platform for the PCIC informatics club. Members enrol in
learning tracks, submit real GitHub repositories, mentors review them against rubrics,
and members earn XP and appear on domain leaderboards.

This repository is the **foundation** (monorepo, tooling, and architecture guardrails).
Features are built on top of it.

## Stack

- **Web:** Next.js (App Router) + TypeScript + Tailwind CSS v4 — runs on the host
- **API:** Node.js + Express 5 + TypeScript (`tsx` in dev)
- **Database / Auth / Storage:** Supabase (Postgres, Auth, Storage) via the Supabase CLI
- **Shared:** `@pcic/shared` — zod schemas/types shared by web and api
- **Package manager:** pnpm workspaces · **Node:** 24 (pinned in `.nvmrc`)

## Architecture rules (read before building)

Full detail in [`docs/architecture.md`](docs/architecture.md). In short:

1. **Reads go directly to Supabase under row-level security; all writes go through the
   Express API.** Exceptions: the Auth SDK, Storage uploads, Realtime subscriptions.
2. **The `service_role` key lives only in `apps/api`** (one file:
   `apps/api/src/lib/supabase.ts`, exported as `admin`). The web app holds only the
   `anon` key. `scripts/check-keys.sh` fails the build if the key leaks into `apps/web`.
3. **XP is written only by the server**, in the same transaction as the event that earned
   it, on a table no client can write to.
4. **Row-level security is enabled on every table**, with policies written in the same
   migration that creates the table.

---

## Setup (clean machine → running app)

### 0. Install prerequisites

- **Git**
- **nvm** — <https://github.com/nvm-sh/nvm>
- **Docker Desktop** — <https://www.docker.com/products/docker-desktop> (must be running)

Node and pnpm come from the repo itself in the steps below.

### 1. Clone

```bash
git clone <repo-url>
cd developer-companion
```

### 2. Node (pinned in `.nvmrc` = 24)

```bash
nvm install   # installs Node 24
nvm use       # switches to it
```

### 3. pnpm (pinned to 12.15.0 via corepack)

```bash
corepack enable   # makes `pnpm` resolve to the pinned version automatically
```

### 4. Install dependencies

```bash
pnpm install
```

First run downloads ~550 MB — use decent Wi-Fi, not a phone hotspot. It finishes clean
(esbuild's build is pre-approved in `pnpm-workspace.yaml`) and installs the Husky
pre-commit hook automatically.

### 5. Start Supabase (first run pulls ~1–2 GB of images — slow once, cached after)

```bash
pnpm exec supabase start
```

Read your local credentials any time with:

```bash
pnpm exec supabase status
```

You'll get the **API URL** (`http://127.0.0.1:54321`), **anon key**, **service_role key**,
and **Studio** (`http://127.0.0.1:54323`).

### 6. Create the two env files (both are git-ignored — never commit them)

**`apps/web/.env.local`** — web holds the **anon key only**:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from `supabase status`>
```

**`apps/api/.env`** — API holds the **service_role key** (and nowhere else):

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
# Host dev: 127.0.0.1 — inside the API container: http://host.docker.internal:54321
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role key from `supabase status`>
```

### 7. Start the API

On the host:

```bash
pnpm --filter api dev          # tsx watch, hot reload
```

…or in its container:

```bash
docker compose up -d --build api
```

Check it:

```bash
curl http://localhost:4000/api/v1/health      # → {"status":"ok"}
```

### 8. Start the web app (host)

```bash
pnpm --filter web dev          # → http://localhost:3000
```

You should see **"PCIC Developer Companion — scaffold is running."**

---

## Running everything

`docker compose up` starts **only the API** — this is deliberate:

| Piece    | How it runs                                        | Why                                           |
| -------- | -------------------------------------------------- | --------------------------------------------- |
| Supabase | `supabase start` (CLI-managed containers)          | A second Postgres would drift from production |
| API      | `docker compose up` **or** `pnpm --filter api dev` | Containerised for parity                      |
| Web      | `pnpm --filter web dev` on the host                | Fast hot reload                               |

The one command that brings the backend up together is **`pnpm dev`** (runs
`supabase start` + the API container, then prints the web command). Web always runs
separately on the host.

**Gotchas:** Docker must be running before `supabase start` / `docker compose`. Inside the
API container, set `SUPABASE_URL=http://host.docker.internal:54321` (127.0.0.1 points at
the container itself).

## Daily workflow

```bash
pnpm dev                    # backend up (Supabase + API)
pnpm --filter web dev       # web up
# ...code...
pnpm check                  # MUST pass before pushing — there is no CI
pnpm exec supabase stop     # stop Supabase
docker compose down         # stop the API container
```

`pnpm check` runs, in order: **key guard → lint → type-check → build → tests**. It is the
only gate (there is no CI pipeline), so run it before every push.

## Project structure

```
apps/
  web/        Next.js (App Router) — anon key only
  api/        Express 5 — holds the service_role key; all writes go here
packages/
  shared/     zod schemas + types shared by web and api
supabase/
  migrations/ the ONLY way to change the schema (see its README)
  seed.sql    local seed data
docs/         architecture.md, api.md
scripts/      check-keys.sh (key guard), dev.sh (pnpm dev)
```

## Adding an API route

See [`docs/api.md`](docs/api.md). Briefly: create `apps/api/src/routes/v1/<feature>.ts`,
validate input with `validateBody(schema)` using a schema from `@pcic/shared`, protect
private/mutating routes with `requireMember`, and mount it in
`apps/api/src/routes/v1/index.ts`. Breaking changes get a new version (`/api/v2`).

## Troubleshooting

- **`Cannot connect to the Docker daemon`** → start Docker Desktop and wait until ready.
- **`pnpm install` stalls** → slow/hotspot connection; it resumes from cache, so re-run on
  better Wi-Fi.
- **Port already in use** (3000 / 4000 / 54321–54324) → `pnpm exec supabase stop`, and
  stop any stray dev server.
- **Key guard fails** → you referenced `SUPABASE_SERVICE_ROLE_KEY` under `apps/web`. Move
  it to `apps/api`; the web app may only ever hold the anon key.
