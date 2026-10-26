import { createClient } from "@supabase/supabase-js";

// THE service_role client — exported as `admin`.
//
// This is the ONLY place in the entire repository that reads the service_role
// key. That key bypasses ALL row-level security, so it must live only in the
// API (never in apps/web). Writes flow through the API and enforce their own
// authorization. See docs/architecture.md rule #2.
const url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to construct the admin client.");
}

export const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
