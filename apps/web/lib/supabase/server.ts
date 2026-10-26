import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ANON KEY ONLY. The `service_role` key must NEVER appear in this app: it
// bypasses all row-level security. Server code here runs under the user's own
// RLS context via their session cookies. Enforced by scripts/check-keys.sh.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component; safe to ignore.
          }
        },
      },
    },
  );
}
