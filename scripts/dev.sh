#!/usr/bin/env bash
#
# One command to bring up the local backend: Supabase (Postgres, Auth, Storage,
# all in the Supabase CLI's own Docker containers) plus the Express API
# container. The Next.js web app stays on the HOST for fast hot reload and is
# started separately (printed below).
#
set -euo pipefail

echo "▶ Starting Supabase (local Postgres, Auth, Storage in Docker)…"
pnpm exec supabase start

echo ""
echo "▶ Building & starting the Express API container…"
docker compose up -d --build api

echo ""
echo "✅ Backend is up."
echo "   • API health:       http://localhost:4000/api/v1/health"
echo "   • API base (v1):    http://localhost:4000/api/v1"
echo "   • Supabase Studio:   http://localhost:54323"
echo "   • Supabase API URL:  http://localhost:54321"
echo ""
echo "👉 Next, start the web app on the host (kept off Docker for fast HMR):"
echo ""
echo "     pnpm --filter web dev      →  http://localhost:3000"
echo ""
echo "   To stop the backend later:  docker compose down && pnpm exec supabase stop"
