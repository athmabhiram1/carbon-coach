import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Refresh auth session in request cookies
  const sessionResponse = await updateSession(request);

  // Check user session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {}
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const hasAnonymousId = request.cookies.has("carbon-coach-anonymous-id");
  const path = request.nextUrl.pathname;

  // Protect dashboard and leaderboard pages
  if (path.startsWith("/dashboard") || path.startsWith("/leaderboard")) {
    if (!user && !hasAnonymousId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
