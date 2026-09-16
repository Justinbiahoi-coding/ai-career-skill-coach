import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session on every request and gates the app.
 *
 * This is `proxy.ts`, not `middleware.ts` — the middleware convention is
 * deprecated in Next 16 and renamed to proxy. Do not add `export const
 * runtime` here; proxy already runs on Node.js and setting it throws.
 *
 * The gate lives here rather than in a layout because a layout does not
 * control whether the rest of the route renders, and layouts don't re-render
 * on client-side navigation. Proxy runs before the route renders, so it can
 * actually stop it.
 */

/** Routes a signed-out visitor may see. Everything else requires a session. */
const PUBLIC_PATHS = ["/", "/auth/callback", "/login", "/register"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Without credentials the Supabase client throws on construction, which
  // would take down every route at once. Letting requests through unguarded
  // is the safer failure here: a misconfigured deploy still serves the app,
  // and the missing config is obvious the moment sign-in is attempted.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn(
      "[proxy] Supabase env vars missing — every route is unguarded. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          // Supabase supplies no-store headers alongside auth cookies. Without
          // them a CDN could cache a response carrying one user's session and
          // serve it to somebody else.
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    }
  );

  // getUser() revalidates the token with Supabase, unlike getSession() which
  // trusts whatever the cookie claims. Calling it here also refreshes an
  // expiring token and writes the new cookie through setAll above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);
  // API routes still get their session refreshed above, but must never be
  // redirected: the caller is doing res.json(), and handing it an HTML login
  // page turns an expired session into an unreadable parse error.
  const isApi = pathname.startsWith("/api");

  if (!user && !isPublic && !isApi) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/login";
    // Remember where they were headed so sign-in can return them there.
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (user && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/home";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next's own assets, the mascot images (served on every
    // screen — running auth on them is pure latency), and common static files.
    "/((?!_next/static|_next/image|favicon.ico|mascot/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
