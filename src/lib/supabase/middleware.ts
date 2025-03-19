import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/documents", "/reset-password", "/settings"];
const privateRoutes = ["/login", "/signup", "/forget-password"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Anon Key must be defined in environment variables');
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Fetch user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  //Redirect to /login if accessing protected routes without a session
  if (
    !user &&
    (protectedRoutes.some((r) => pathname.startsWith(r)) ||
      pathname === "/complete-profile")
  ) {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_APP_URL),
    );
  }


  // Redirect to /doc if accessing private routes with a session
  if (user && privateRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(
      new URL("/documents", process.env.NEXT_PUBLIC_APP_URL),
    );
  }

  // Return the response with updated cookies/session
  return supabaseResponse;
}
