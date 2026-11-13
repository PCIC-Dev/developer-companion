# Developer Setup Guide — No Docker

A step-by-step guide for developers whose machines **cannot run Docker**. It gets the web
app and the API running locally against a **cloud Supabase database** instead of the local
Dockerized one.

> This is the no-Docker companion to [`developer-setup.md`](./developer-setup.md). If your
> machine can run Docker, use that guide instead — it gives you an isolated local database.

---

## Table of contents

- [Why this works without Docker](#why-this-works-without-docker)
- [What you'll have when you're done](#what-youll-have-when-youre-done)
- [Prerequisites](#prerequisites)
- [Part 1 — One-time team setup (lead only)](#part-1--one-time-team-setup-lead-only)
- [Part 2 — Each developer](#part-2--each-developer)
- [Differences from the Docker guide](#differences-from-the-docker-guide)
- [Option B — Your own isolated cloud database](#option-b--your-own-isolated-cloud-database)
- [Verification checklist](#verification-checklist)
- [Troubleshooting](#troubleshooting)

---

## Why this works without Docker

In this repo, **only one thing requires Docker: the local Supabase stack** (`supabase
start`), which runs Postgres, Auth, and Storage in containers.

Everything else already runs directly on your machine:

| Part     | How it runs                 | Needs Docker? |
| -------- | --------------------------- | ------------- |
| Web app  | `pnpm --filter web dev`     | No            |
| API      | `pnpm --filter api dev`     | No            |
| Database | **Local** Supabase (Docker) | **Yes**       |

The fix is simple: **replace the local Dockerized database with a cloud Supabase project**
(free tier, hosted on Supabase's servers) and point the environment files at it. No Docker
needed anywhere.

---

## What you'll have when you're done

- The **Next.js web app** (`apps/web`) running on <http://localhost:3000>.
- The **Express API** (`apps/api`) running on <http://localhost:4000>.
- Both talking to a **cloud Supabase** database.
- A working `pnpm check` gate (lint, type-check, build, tests).

**Estimated time:** ~5 minutes per developer (after the one-time team setup).

---

## Prerequisites

Install these once. **Docker is NOT required.**

### Git

- **macOS:** `xcode-select --install`, or `brew install git`
- **Windows:** <https://git-scm.com/download/win> (use Git Bash for the commands below)
- **Linux:** `sudo apt install git` or your distro's equivalent

Verify:

```bash
git --version
```

### nvm (Node Version Manager)

The repo pins Node **24** in `.nvmrc`, so install Node **through nvm**.

- **macOS / Linux:** <https://github.com/nvm-sh/nvm#installing-and-updating>, then restart your terminal.
- **Windows:** <https://github.com/coreybutler/nvm-windows>

Verify:

```bash
nvm --version
```

### pnpm (via Corepack)

Corepack ships with Node, so there is nothing to install separately — it is enabled in
[Part 2, Step 2](#step-2--select-node-and-enable-pnpm).

---

## Part 1 — One-time team setup (lead only)

> **Do this ONCE for the whole team.** Individual developers skip to
> [Part 2](#part-2--each-developer). It needs to be run by someone on a stable
> connection; it does **not** require Docker.

### 1. Create the cloud project

1. Go to <https://supabase.com> and create a **free** project.
2. Open **Project Settings → API** and copy these three values:
   - **Project URL** — `https://<ref>.supabase.co`
   - **anon key** — public, safe for the browser
   - **service_role key** — secret, server-only, bypasses all row-level security

### 2. Apply the schema to the cloud project

The Supabase CLI is already a dependency of this repo (no Docker needed to push to a
remote project):

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <your-project-ref>
pnpm exec supabase db push        # applies supabase/migrations/* to the cloud DB
```

### 3. (Optional) Seed starter data

Paste the contents of [`supabase/seed.sql`](../supabase/seed.sql) into the Supabase
dashboard **SQL Editor** and run it.

### 4. Share the credentials

Send these **three values** to the team **privately** (never commit them):

- `SUPABASE_URL` → `https://<ref>.supabase.co`
- `anon key`
- `service_role key`

---

## Part 2 — Each developer

No Docker. About 5 minutes.

### Step 1 — Clone the repository

```bash
git clone <repo-url>
cd developer-companion
```

All commands below are run from the repository root.

### Step 2 — Select Node and enable pnpm

```bash
nvm install        # installs Node 24 from .nvmrc
nvm use            # switch this shell to Node 24
corepack enable    # makes `pnpm` resolve to the pinned 12.15.0
```

Verify:

```bash
node --version     # → v24.x.x
pnpm --version     # → 12.15.0
```

> You must run `nvm use` in **each new terminal** (or set up nvm's auto-switch).

### Step 3 — Install dependencies

```bash
pnpm install
```

This installs all workspace dependencies and the Husky pre-commit hook.

### Step 4 — Create the two environment files

Both files are git-ignored. **Never commit them.** Use the **cloud** values from
[Part 1](#4-share-the-credentials).

**`apps/web/.env.local`** — the web app holds the **anon** key only:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

**`apps/api/.env`** — the API holds the **service_role** key (and nowhere else):

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

> The only difference from the Docker guide is the **URL** (`https://<ref>.supabase.co`
> instead of `http://127.0.0.1:54321`) and using the **cloud project's keys**.
>
> **Architecture rule #2, enforced by a script:** the `service_role` key may live only in
> `apps/api`. `scripts/check-keys.sh` fails the build if a `SERVICE_ROLE` reference shows
> up anywhere under `apps/web`.

### Step 5 — Start the API

```bash
pnpm --filter api dev          # tsx watch, hot reload on save
```

Verify it's up:

```bash
curl http://localhost:4000/api/v1/health
# → {"status":"ok"}
```

### Step 6 — Start the web app

In a **separate terminal**:

```bash
nvm use
pnpm --filter web dev          # → http://localhost:3000
```

Open <http://localhost:3000>. You should see the scaffold page. Done — zero Docker.

---

## Differences from the Docker guide

- **Do NOT run `pnpm dev`.** That script (`scripts/dev.sh`) calls `supabase start` and
  `docker compose`, both of which need Docker. Start the API and web manually, as in
  Steps 5–6.
- **Everyone shares one database** (the default here). Great for early development — just
  know your data is not private. For an isolated DB, see
  [Option B](#option-b--your-own-isolated-cloud-database).
- `pnpm check` (lint, type-check, build, tests) and the Husky pre-commit hook **work fine
  without Docker** — nothing there needs it.
- The RLS test suite from the Docker guide uses `docker exec`; skip it on a no-Docker
  machine (run those statements in the Supabase dashboard SQL Editor instead).

---

## Option B — Your own isolated cloud database

If you need a database that no one else touches, repeat [Part 1](#part-1--one-time-team-setup-lead-only)
for your **own** free Supabase project, then put **your** project's URL and keys in the env
files from [Step 4](#step-4--create-the-two-environment-files). Still **no Docker** —
`supabase db push` targets a remote project.

---

## Verification checklist

- [ ] `node --version` → v24.x
- [ ] `pnpm --version` → 12.15.0
- [ ] `apps/web/.env.local` and `apps/api/.env` exist, point at the cloud URL, and are **not** committed
- [ ] `curl http://localhost:4000/api/v1/health` → `{"status":"ok"}`
- [ ] <http://localhost:3000> loads
- [ ] `pnpm check` passes end to end

---

## Troubleshooting

**`curl .../health` fails or the API won't start**
Check `apps/api/.env`: `SUPABASE_URL` must be your `https://<ref>.supabase.co` URL and
`SUPABASE_SERVICE_ROLE_KEY` must be the cloud project's service_role key.

**Web app loads but data calls fail**
Confirm `apps/web/.env.local` uses the cloud URL and the **anon** key, and that the schema
was applied to the cloud project ([Part 1, Step 2](#2-apply-the-schema-to-the-cloud-project)).

**Key guard fails (`found a service_role reference under 'apps/web'`)**
You referenced `SUPABASE_SERVICE_ROLE_KEY` (or anything matching `SERVICE_ROLE`) somewhere
under `apps/web`. Move it to `apps/api`; the web app may only hold the anon key.

**Port already in use (3000 / 4000)**
Stop any leftover dev servers on those ports and retry.

**Node version complaints**
Run `nvm use` in the current terminal — it doesn't persist across new shells by default.
