import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 *
 * Only ever import this in server-only code (API route handlers), NEVER in
 * a Client Component or anything that ships to the browser: the key this
 * uses can read and write every row in the database regardless of RLS
 * policies. It exists for exactly one purpose today — writing to
 * course_video_cache, a table with no user_id column and therefore no
 * per-user RLS policy that a normal signed-in client could satisfy.
 *
 * Unlike lib/supabase/client.ts and lib/supabase/server.ts, this doesn't
 * read cookies or care about the current user's session — the service role
 * key IS the credential, independent of who's signed in.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
