export { cn } from "cn"

/**
 * Guards against open-redirect: only accept `next` values that are a plain
 * same-origin relative path. Rejects "//evil.com" and "/\evil.com" (both
 * parsed by browsers as protocol-relative URLs to a different origin) and
 * any scheme/credential syntax ("javascript:", "http://", "user@host").
 *
 * Used everywhere a post-auth redirect destination comes from a query
 * param — the auth callback route and both login/register pages — since an
 * attacker-crafted sign-in link could otherwise send a freshly
 * authenticated user off to their own site right after a real password or
 * OAuth exchange.
 */
export function safeRedirectPath(path: string | null | undefined, fallback = "/"): string {
  if (!path) return fallback;
  if (!path.startsWith("/")) return fallback;
  if (/^\/[\\/]/.test(path)) return fallback; // "//x" or "/\x"
  if (path.includes(":") || path.includes("@")) return fallback;
  return path;
}
