"use client";

import { createBrowserClient } from "@supabase/ssr";

// ANON KEY ONLY. The `service_role` key must NEVER appear in this app: it
// bypasses all row-level security, and this bundle ships to every browser.
// The web app only ever holds the anon key. Enforced by scripts/check-keys.sh.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
