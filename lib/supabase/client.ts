import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components.
 *
 * Called per component rather than shared as a module singleton: the browser
 * client reads auth state from cookies on creation, so a long-lived instance
 * can hold a session that sign-in or sign-out has already replaced.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
