#!/usr/bin/env bash
#
# Key guard — mechanical enforcement of architecture rule #2.
#
# The Supabase `service_role` key bypasses ALL row-level security. It must live
# only in the Express API (apps/api) and NOWHERE in the web app. This script
# fails the `pnpm check` gate if any reference to the service_role key leaks
# into apps/web. The web app may only ever hold the `anon` key.
#
set -euo pipefail

TARGET="apps/web"
# Case-sensitive on purpose: matches the KEY reference (SERVICE_ROLE, as in
# SUPABASE_SERVICE_ROLE_KEY) but not lowercase "service_role" prose in the
# comments that explain this very rule.
PATTERN="SERVICE_ROLE"

if [ ! -d "$TARGET" ]; then
  echo "key guard: '$TARGET' not found — nothing to check."
  exit 0
fi

if grep -rEn -I \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=build \
  "$PATTERN" "$TARGET"; then
  echo ""
  echo "❌ key guard FAILED: found a service_role reference under '$TARGET'."
  echo "   The service_role key bypasses row-level security and must never live"
  echo "   in the web app. Only the anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  echo "   belongs in apps/web. Move this to apps/api instead."
  exit 1
fi

echo "✅ key guard passed: no service_role reference under '$TARGET'."
